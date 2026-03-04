/**
 * ===========================================
 * REPORT CONTROLLER
 * ===========================================
 * Handles all report-related operations including CRUD operations,
 * custodian workflow management, and role-based access control
 */

const { Report, Laboratory, User, Notification } = require('../models');
const { 
  sendReportCreatedNotification,
  sendReportCreatedAdminNotifications,
  sendReportStatusUpdateNotification,
  sendCustodianNoteNotification,
  sendReportDetailsUpdateNotification
} = require('../utils/notificationHelper');
const {
  sendReportSubmissionEmails,
  sendReportStatusUpdateEmail,
  sendCustodianNoteEmail
} = require('../utils/emailNotificationHelper');

// ===========================================
// CREATE REPORT
// ===========================================

/**
 * @desc    Create new report
 * @route   POST /api/reports
 * @access  Private (Student, Faculty, Lab Custodian, Admin)
 */
const createReport = async (req, res) => {
  try {
    const {
      labId,
      workstationNumber,
      issueCategory,
      description
    } = req.body;

    // Validate required fields
    if (!labId || !issueCategory || !description) {
      return res.status(400).json({
        success: false,
        message: 'Lab ID, issue category, and description are required'
      });
    }

    // Validate labId exists and get lab details
    const laboratory = await Laboratory.findById(labId);
    if (!laboratory) {
      return res.status(404).json({
        success: false,
        message: 'Laboratory not found'
      });
    }

    if (!laboratory.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create report for inactive laboratory'
      });
    }

    // Validate workstation number if provided
    if (workstationNumber) {
      const wsNum = parseInt(workstationNumber);
      if (wsNum < 1 || wsNum > laboratory.numberOfWorkstations) {
        return res.status(400).json({
          success: false,
          message: `Workstation number must be between 1 and ${laboratory.numberOfWorkstations}`
        });
      }
    }

    // Create new report
    const report = new Report({
      labId: laboratory._id,
      labNameCache: laboratory.labName,
      workstationNumber: workstationNumber || '',
      issueCategory,
      description: description.trim(),
      reporterId: req.user.id,
      status: 'submitted'
    });

    await report.save();

    // Populate reporter information for response
    await report.populate('reporterId', 'fullName email role contactNumber');

    // Send email and in-app notifications asynchronously (don't block response)
    setImmediate(async () => {
      try {
        await sendReportSubmissionEmails(report, req.user, laboratory);
        console.log('✅ Report submission emails sent successfully');
      } catch (emailError) {
        console.warn('❌ Failed to send report submission emails:', emailError.message);
        // Email failure shouldn't affect the report creation
      }

      try {
        await sendReportCreatedNotification(req.user.id, report, laboratory);
        console.log(`📬 In-app notification created for report ${report._id}`);
      } catch (notificationError) {
        console.warn('❌ Failed to create in-app notification for new report:', notificationError.message);
      }

      try {
        await sendReportCreatedAdminNotifications(report, req.user, laboratory);
        console.log(`📬 In-app notifications created for custodians/admins for report ${report._id}`);
      } catch (adminNotificationError) {
        console.warn('❌ Failed to create in-app notifications for custodians/admins:', adminNotificationError.message);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: report
    });

  } catch (error) {
    console.error('Create report error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET MY REPORTS
// ===========================================

/**
 * @desc    Get current user's reports
 * @route   GET /api/reports/me
 * @access  Private (All authenticated users)
 */
const getMyReports = async (req, res) => {
  try {
    const {
      status,
      category,
      labId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query for user's reports
    const query = { reporterId: req.user.id };

    // Add filters
    if (status) query.status = status;
    if (category) query.issueCategory = category;
    if (labId) query.labId = labId;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const reports = await Report.find(query)
      .populate('labId', 'labCode labName location numberOfWorkstations')
      .populate('updatedByCustodianId', 'fullName email role')
      .populate('custodianNotes.custodianId', 'fullName email role')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReports = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      message: `Found ${reports.length} reports`,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReports / parseInt(limit)),
          totalReports,
          hasNextPage: skip + reports.length < totalReports,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET ALL REPORTS
// ===========================================

/**
 * @desc    Get all reports (with filters)
 * @route   GET /api/reports
 * @access  Private (Lab Custodian, Admin)
 */
const getAllReports = async (req, res) => {
  try {
    const {
      status,
      labId,
      category,
      dateStart,
      dateEnd,
      reporterId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};

    // Add filters
    if (status) query.status = status;
    if (labId) query.labId = labId;
    if (category) query.issueCategory = category;
    if (reporterId) query.reporterId = reporterId;

    // Date range filter
    if (dateStart || dateEnd) {
      query.createdAt = {};
      if (dateStart) query.createdAt.$gte = new Date(dateStart);
      if (dateEnd) query.createdAt.$lte = new Date(dateEnd);
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with full population
    const reports = await Report.find(query)
      .populate('labId', 'labCode labName location numberOfWorkstations isActive')
      .populate('reporterId', 'fullName email role contactNumber')
      .populate('updatedByCustodianId', 'fullName email role')
      .populate('custodianNotes.custodianId', 'fullName email role')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalReports = await Report.countDocuments(query);

    // Get summary statistics
    const stats = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          statusCounts: {
            $push: '$status'
          },
          categoryCounts: {
            $push: '$issueCategory'
          }
        }
      }
    ]);

    // Process stats
    let summary = {
      totalReports: totalReports,
      byStatus: {},
      byCategory: {}
    };

    if (stats.length > 0) {
      // Count by status
      stats[0].statusCounts.forEach(status => {
        summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
      });

      // Count by category
      stats[0].categoryCounts.forEach(category => {
        summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${reports.length} reports`,
      data: {
        reports,
        summary,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReports / parseInt(limit)),
          totalReports,
          hasNextPage: skip + reports.length < totalReports,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET REPORT BY ID
// ===========================================

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/:id
 * @access  Private (Reporter can view own, Custodian/Admin can view all)
 */
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Find report with full population
    const report = await Report.findById(id)
      .populate('labId', 'labCode labName location numberOfWorkstations isActive')
      .populate('reporterId', 'fullName email role contactNumber')
      .populate('updatedByCustodianId', 'fullName email role')
      .populate('custodianNotes.custodianId', 'fullName email role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check access permissions
    const reporterId = report?.reporterId?._id || report?.reporterId;
    const requesterId = req?.user?.id;
    const isReporter = String(reporterId) === String(requesterId);
    const isCustodianOrAdmin = ['lab_custodian', 'admin'].includes(req.user.role);

    if (!isReporter && !isCustodianOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reports.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });

  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// UPDATE REPORT STATUS
// ===========================================

/**
 * @desc    Update report status
 * @route   PUT /api/reports/:id/status
 * @access  Private (Lab Custodian, Admin)
 */
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, note } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Validate new status
    const allowedStatuses = [
      'submitted',
      'verified',
      'in_progress',
      'resolved',
      'closed'
    ];

    if (!newStatus || !allowedStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: ' + allowedStatuses.join(', ')
      });
    }

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update status and custodian tracking
    const updateData = {
      status: newStatus,
      updatedByCustodianId: req.user.id
    };

    // Set timestamps based on status
    if (newStatus === 'Resolved' && !report.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (newStatus === 'Closed' && !report.closedAt) {
      updateData.closedAt = new Date();
    }

    // Add custodian note if provided
    if (note) {
      updateData.$push = {
        custodianNotes: {
          note: `Status updated to "${newStatus}". ${note}`,
          custodianId: req.user.id,
          custodianName: req.user.fullName,
          createdAt: new Date()
        }
      };
    }

    // Update report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('labId', 'labCode labName')
    .populate('reporterId', 'fullName email role contactNumber')
     .populate('updatedByCustodianId', 'fullName email role')
     .populate('custodianNotes.custodianId', 'fullName email role');

    // Send notification to report creator about status update
    try {
      await sendReportStatusUpdateNotification(
        updatedReport.reporterId._id,
        newStatus,
        updatedReport._id,
        {
          id: req.user.id,
          fullName: req.user.fullName
        },
        {
          labCode: updatedReport.labId?.labCode,
          labName: updatedReport.labId?.labName,
          issueCategory: updatedReport.issueCategory,
          workstationNumber: updatedReport.workstationNumber,
          newStatus
        }
      );
    } catch (notificationError) {
      console.warn('Failed to send status update notification:', notificationError.message);
      // Don't fail the entire operation if notification fails
    }

    // Send email notification asynchronously
    setImmediate(async () => {
      try {
        await sendReportStatusUpdateEmail(
          updatedReport,
          newStatus,
          req.user,
          note || ''
        );
        console.log('✅ Status update email sent successfully');
      } catch (emailError) {
        console.warn('❌ Failed to send status update email:', emailError.message);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: updatedReport
    });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// ADD CUSTODIAN NOTE
// ===========================================

/**
 * @desc    Add custodian note to report
 * @route   POST /api/reports/:id/notes
 * @access  Private (Lab Custodian, Admin)
 */
const addCustodianNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Validate note
    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    // Find and update report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      {
        $push: {
          custodianNotes: {
            note: note.trim(),
            custodianId: req.user.id,
            custodianName: req.user.fullName,
            createdAt: new Date()
          }
        },
        $set: {
          updatedByCustodianId: req.user.id
        }
      },
      { new: true }
    ).populate('labId', 'labCode labName')
    .populate('reporterId', 'fullName email role contactNumber')
     .populate('updatedByCustodianId', 'fullName email role')
     .populate('custodianNotes.custodianId', 'fullName email role');

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Send notification to report creator about the new note
    try {
      await sendCustodianNoteNotification(
        updatedReport.reporterId._id,
        updatedReport._id,
        {
          id: req.user.id,
          fullName: req.user.fullName
        },
        {
          labCode: updatedReport.labId?.labCode,
          labName: updatedReport.labId?.labName,
          issueCategory: updatedReport.issueCategory,
          workstationNumber: updatedReport.workstationNumber,
          noteContent: note.trim()
        }
      );
    } catch (notificationError) {
      console.warn('Failed to send custodian note notification:', notificationError.message);
      // Don't fail the entire operation if notification fails
    }

    // Send email notification asynchronously
    setImmediate(async () => {
      try {
        await sendCustodianNoteEmail(
          updatedReport,
          note.trim(),
          req.user
        );
        console.log('✅ Custodian note email sent successfully');
      } catch (emailError) {
        console.warn('❌ Failed to send custodian note email:', emailError.message);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Custodian note added successfully',
      data: updatedReport
    });

  } catch (error) {
    console.error('Add custodian note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// UPDATE REPORT DETAILS
// ===========================================

/**
 * @desc    Update report details
 * @route   PUT /api/reports/:id
 * @access  Private (Lab Custodian, Admin)
 */
const updateReportDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      workstationNumber,
      issueCategory,
      description
    } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Find existing report
    const existingReport = await Report.findById(id).populate('labId');
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Prepare update data
    const updateData = {
      updatedByCustodianId: req.user.id
    };

    // Validate and update workstation number
    if (workstationNumber !== undefined) {
      if (workstationNumber && existingReport.labId) {
        const wsNum = parseInt(workstationNumber);
        if (wsNum < 1 || wsNum > existingReport.labId.numberOfWorkstations) {
          return res.status(400).json({
            success: false,
            message: `Workstation number must be between 1 and ${existingReport.labId.numberOfWorkstations}`
          });
        }
      }
      updateData.workstationNumber = workstationNumber;
    }

    // Validate and update issue category
    if (issueCategory !== undefined) {
      const allowedCategories = ['hardware', 'software', 'facility', 'cleanliness'];
      if (!allowedCategories.includes(issueCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid issue category. Allowed values: ' + allowedCategories.join(', ')
        });
      }
      updateData.issueCategory = issueCategory;
    }

    // Update description
    if (description !== undefined) {
      if (description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Description must be at least 10 characters long'
        });
      }
      updateData.description = description.trim();
    }

    // Update report
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('labId', 'labCode labName location numberOfWorkstations')
    .populate('reporterId', 'fullName email role contactNumber')
     .populate('updatedByCustodianId', 'fullName email role')
     .populate('custodianNotes.custodianId', 'fullName email role');

    // Send notification to report creator about the update
    try {
      const updatedFields = [];
      if (workstationNumber !== undefined) updatedFields.push('workstation');
      if (issueCategory !== undefined) updatedFields.push('category');
      if (description !== undefined) updatedFields.push('description');

      await sendReportDetailsUpdateNotification(
        updatedReport.reporterId._id,
        updatedReport._id,
        {
          id: req.user.id,
          fullName: req.user.fullName
        },
        {
          labCode: updatedReport.labId?.labCode,
          labName: updatedReport.labId?.labName,
          issueCategory: updatedReport.issueCategory,
          workstationNumber: updatedReport.workstationNumber,
          updateFields
        }
      );
    } catch (notificationError) {
      console.warn('Failed to send report details update notification:', notificationError.message);
      // Don't fail the entire operation if notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Report details updated successfully',
      data: updatedReport
    });

  } catch (error) {
    console.error('Update report details error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while updating report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// DELETE REPORT (SOFT DELETE)
// ===========================================

/**
 * @desc    Soft delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Admin only)
 */
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Add soft delete field (if not exists in schema, we could add it)
    // For now, we'll just add a custodian note and change status
    const deletedReport = await Report.findByIdAndUpdate(
      id,
      {
        status: 'closed',
        $push: {
          custodianNotes: {
            note: 'Report marked as deleted by administrator',
            custodianId: req.user.id,
            createdAt: new Date()
          }
        },
        updatedByCustodianId: req.user.id,
        closedAt: new Date()
      },
      { new: true }
    ).populate('labId', 'labCode labName')
    .populate('reporterId', 'fullName email role contactNumber');

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: deletedReport
    });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET REPORT STATISTICS
// ===========================================

/**
 * @desc    Get report statistics
 * @route   GET /api/reports/stats
 * @access  Private (Lab Custodian, Admin)
 */
const getReportStats = async (req, res) => {
  try {
    const { labId, dateStart, dateEnd } = req.query;

    // Build match conditions
    const matchConditions = {};
    if (labId) matchConditions.labId = mongoose.Types.ObjectId(labId);
    if (dateStart) matchConditions.createdAt = { $gte: new Date(dateStart) };
    if (dateEnd) {
      matchConditions.createdAt = {
        ...matchConditions.createdAt,
        $lte: new Date(dateEnd)
      };
    }

    // Get comprehensive statistics
    const stats = await Report.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          byStatus: {
            $push: {
              k: '$status',
              v: 1
            }
          },
          byCategory: {
            $push: {
              k: '$issueCategory',
              v: 1
            }
          },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $ne: ['$resolvedAt', null] },
                {
                  $divide: [
                    { $subtract: ['$resolvedAt', '$createdAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);

    // Get recent activity
    const recentReports = await Report.find(matchConditions)
      .populate('labId', 'labCode labName')
      .populate('reporterId', 'fullName role contactNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: 'Report statistics retrieved successfully',
      data: {
        summary: stats[0] || {
          totalReports: 0,
          byStatus: [],
          byCategory: [],
          avgResolutionTime: 0
        },
        recentActivity: recentReports
      }
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  getReportById,
  updateReportStatus,
  addCustodianNote,
  updateReportDetails,
  deleteReport,
  getReportStats
};
