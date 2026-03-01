/**
 * ===========================================
 * LABORATORY CONTROLLER
 * ===========================================
 * Handles all laboratory-related operations including CRUD operations
 * with proper role-based access control and report synchronization
 */

const bcrypt = require('bcryptjs');
const { User, Laboratory, Report } = require('../models');

// ===========================================
// CREATE LABORATORY
// ===========================================

/**
 * @desc    Create new laboratory
 * @route   POST /api/laboratories
 * @access  Private (Admin + Lab Custodian only)
 */
const createLab = async (req, res) => {
  try {
    const {
      labCode,
      labName,
      location = '',
      description = '',
      numberOfWorkstations = 0
    } = req.body;

    // Validate required fields
    if (!labCode || !labName) {
      return res.status(400).json({
        success: false,
        message: 'Lab code and lab name are required'
      });
    }

    // Validate numberOfWorkstations
    if (numberOfWorkstations < 0) {
      return res.status(400).json({
        success: false,
        message: 'Number of workstations must be 0 or greater'
      });
    }

    // Check if labCode already exists
    const existingLabByCode = await Laboratory.findOne({ 
      labCode: labCode.toUpperCase().trim() 
    });
    
    if (existingLabByCode) {
      return res.status(400).json({
        success: false,
        message: 'A laboratory with this code already exists'
      });
    }

    // Check if labName already exists (optional - depends on requirements)
    const existingLabByName = await Laboratory.findOne({ 
      labName: labName.trim() 
    });
    
    if (existingLabByName) {
      return res.status(400).json({
        success: false,
        message: 'A laboratory with this name already exists'
      });
    }

    // Create new laboratory
    const laboratory = new Laboratory({
      labCode: labCode.toUpperCase().trim(),
      labName: labName.trim(),
      location: location.trim(),
      description: description.trim(),
      numberOfWorkstations: parseInt(numberOfWorkstations),
      isActive: true
    });

    await laboratory.save();

    res.status(201).json({
      success: true,
      message: 'Laboratory created successfully',
      data: laboratory
    });

  } catch (error) {
    console.error('Create laboratory error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory code must be unique'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating laboratory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET ALL LABORATORIES
// ===========================================

/**
 * @desc    Get all active laboratories
 * @route   GET /api/laboratories
 * @access  Public (All authenticated users)
 */
const getLabs = async (req, res) => {
  try {
    const { 
      includeInactive = false,
      sortBy = 'labCode',
      sortOrder = 'asc',
      search = ''
    } = req.query;

    // Build query
    let query = {};
    
    // Include inactive labs only if specifically requested (admin/custodian feature)
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { labCode: { $regex: search, $options: 'i' } },
        { labName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const laboratories = await Laboratory.find(query).sort(sortObj);

    // Add report counts for each lab (optional additional info)
    const labsWithCounts = await Promise.all(
      laboratories.map(async (lab) => {
        const reportCount = await Report.countDocuments({ labId: lab._id });
        const activeReportCount = await Report.countDocuments({ 
          labId: lab._id, 
          status: { $in: ['Submitted', 'Verified by Lab Custodian', 'In Progress'] }
        });
        
        return {
          ...lab.toJSON(),
          reportCount,
          activeReportCount
        };
      })
    );

    res.status(200).json({
      success: true,
      message: `Found ${laboratories.length} laboratories`,
      data: labsWithCounts
    });

  } catch (error) {
    console.error('Get laboratories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching laboratories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET LABORATORY BY ID
// ===========================================

/**
 * @desc    Get single laboratory by ID
 * @route   GET /api/laboratories/:id
 * @access  Public (All authenticated users)
 */
const getLabById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid laboratory ID format'
      });
    }

    // Find laboratory
    const laboratory = await Laboratory.findById(id);

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    // Get additional information
    const reportCount = await Report.countDocuments({ labId: laboratory._id });
    const recentReports = await Report.find({ labId: laboratory._id })
      .populate('reporterId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(5);

    const reportStats = await Report.aggregate([
      { $match: { labId: laboratory._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format response with additional data
    const response = {
      ...laboratory.toJSON(),
      reportCount,
      recentReports,
      reportStats,
      workstationNumbers: laboratory.getWorkstationNumbers()
    };

    res.status(200).json({
      success: true,
      message: 'Laboratory retrieved successfully',
      data: response
    });

  } catch (error) {
    console.error('Get laboratory by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching laboratory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// UPDATE LABORATORY
// ===========================================

/**
 * @desc    Update laboratory
 * @route   PUT /api/laboratories/:id
 * @access  Private (Admin + Lab Custodian only)
 */
const updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      labCode,
      labName,
      location,
      description,
      numberOfWorkstations
    } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid laboratory ID format'
      });
    }

    // Find existing laboratory
    const existingLab = await Laboratory.findById(id);
    if (!existingLab) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    // Prepare update data
    const updateData = {};
    
    if (labCode !== undefined) {
      // Check if new labCode is unique (excluding current lab)
      const existingLabByCode = await Laboratory.findOne({ 
        labCode: labCode.toUpperCase().trim(),
        _id: { $ne: id }
      });
      
      if (existingLabByCode) {
        return res.status(400).json({
          success: false,
          message: 'A laboratory with this code already exists'
        });
      }
      updateData.labCode = labCode.toUpperCase().trim();
    }

    if (labName !== undefined) {
      if (!labName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Lab name cannot be empty'
        });
      }
      
      // Check if new labName is unique (excluding current lab)
      const existingLabByName = await Laboratory.findOne({ 
        labName: labName.trim(),
        _id: { $ne: id }
      });
      
      if (existingLabByName) {
        return res.status(400).json({
          success: false,
          message: 'A laboratory with this name already exists'
        });
      }
      updateData.labName = labName.trim();
    }

    if (location !== undefined) {
      updateData.location = location.trim();
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (numberOfWorkstations !== undefined) {
      const workstations = parseInt(numberOfWorkstations);
      if (workstations < 0) {
        return res.status(400).json({
          success: false,
          message: 'Number of workstations must be 0 or greater'
        });
      }
      updateData.numberOfWorkstations = workstations;
    }

    // Check if labName is being changed (for sync logic)
    const labNameChanged = updateData.labName && updateData.labName !== existingLab.labName;

    // Update laboratory
    const updatedLab = await Laboratory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    // SYNC LOGIC: Update labNameCache in all related reports if labName changed
    if (labNameChanged) {
      try {
        const updateResult = await Report.updateMany(
          { labId: updatedLab._id },
          { $set: { labNameCache: updatedLab.labName } }
        );

        console.log(`✅ Synced labNameCache for ${updateResult.modifiedCount} reports after lab name change`);
      } catch (syncError) {
        console.error('❌ Error syncing reports after lab name change:', syncError);
        // Don't fail the update if sync fails, but log the error
      }
    }

    res.status(200).json({
      success: true,
      message: 'Laboratory updated successfully',
      data: updatedLab
    });

  } catch (error) {
    console.error('Update laboratory error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory code must be unique'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating laboratory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// DELETE LABORATORY (SOFT DELETE)
// ===========================================

/**
 * @desc    Soft delete laboratory (set isActive = false)
 * @route   DELETE /api/laboratories/:id
 * @access  Private (Admin + Lab Custodian only)
 */
const deleteLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword } = req.body || {};

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid laboratory ID format'
      });
    }

    // Find laboratory
    const laboratory = await Laboratory.findById(id);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    // Check if already inactive
    if (!laboratory.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Laboratory is already inactive'
      });
    }

    if (!currentPassword || !String(currentPassword).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Your password is required to deactivate a laboratory.'
      });
    }

    const actingUser = await User.findById(req.user?.id).select('+passwordHash');
    if (!actingUser) {
      return res.status(401).json({
        success: false,
        message: 'Acting user not found.'
      });
    }

    const isPasswordValid = await bcrypt.compare(String(currentPassword), actingUser.passwordHash || '');
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Laboratory deactivation denied.'
      });
    }

    // Check for active reports (optional warning)
    const activeReportCount = await Report.countDocuments({
      labId: laboratory._id,
      status: { $in: ['Submitted', 'Verified by Lab Custodian', 'In Progress'] }
    });

    // Soft delete: set isActive = false
    const updatedLab = await Laboratory.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    // Note: Reports are NOT modified - they stay intact for historical purposes

    let message = 'Laboratory deactivated successfully';
    if (activeReportCount > 0) {
      message += `. Note: ${activeReportCount} active reports remain associated with this laboratory.`;
    }

    res.status(200).json({
      success: true,
      message,
      data: {
        laboratory: updatedLab,
        activeReportsCount: activeReportCount
      }
    });

  } catch (error) {
    console.error('Delete laboratory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting laboratory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// ADDITIONAL UTILITY FUNCTIONS
// ===========================================

/**
 * @desc    Reactivate laboratory (set isActive = true)
 * @route   PATCH /api/laboratories/:id/reactivate
 * @access  Private (Admin only)
 */
const reactivateLab = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid laboratory ID format'
      });
    }

    // Find and reactivate laboratory
    const laboratory = await Laboratory.findByIdAndUpdate(
      id,
      { $set: { isActive: true } },
      { new: true }
    );

    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Laboratory reactivated successfully',
      data: laboratory
    });

  } catch (error) {
    console.error('Reactivate laboratory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reactivating laboratory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @desc    Get laboratory statistics
 * @route   GET /api/laboratories/stats
 * @access  Private (Admin + Lab Custodian)
 */
const getLabStats = async (req, res) => {
  try {
    const totalLabs = await Laboratory.countDocuments();
    const activeLabs = await Laboratory.countDocuments({ isActive: true });
    const inactiveLabs = totalLabs - activeLabs;

    const labsWithReports = await Laboratory.aggregate([
      {
        $lookup: {
          from: 'reports',
          localField: '_id',
          foreignField: 'labId',
          as: 'reports'
        }
      },
      {
        $project: {
          labCode: 1,
          labName: 1,
          isActive: 1,
          totalReports: { $size: '$reports' },
          activeReports: {
            $size: {
              $filter: {
                input: '$reports',
                cond: {
                  $in: ['$$this.status', ['Submitted', 'Verified by Lab Custodian', 'In Progress']]
                }
              }
            }
          }
        }
      },
      { $sort: { totalReports: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Laboratory statistics retrieved successfully',
      data: {
        summary: {
          totalLabs,
          activeLabs,
          inactiveLabs
        },
        topLabsByReports: labsWithReports
      }
    });

  } catch (error) {
    console.error('Get lab stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
  reactivateLab,
  getLabStats
};
