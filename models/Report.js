/**
 * ===========================================
 * REPORT MODEL (Linked to Laboratory + Custodian Tracking)
 * ===========================================
 * Mongoose model for managing laboratory issue reports with custodian workflow
 */

const mongoose = require('mongoose');

// ===========================================
// SUB-SCHEMAS
// ===========================================

/**
 * Custodian Notes Sub-Schema
 * Tracks notes added by custodians with timestamps
 */
const custodianNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true
  },
  
  custodianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Custodian ID is required']
  },

  custodianName: {
    type: String,
    required: [true, 'Custodian name is required'],
    trim: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// ===========================================
// MAIN REPORT SCHEMA
// ===========================================

const reportSchema = new mongoose.Schema({
  // ===========================================
  // 1. Lab Reference (Dynamic)
  // ===========================================
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true, 'Laboratory ID is required']
  },
  
  labNameCache: {
    type: String,
    default: "",
    trim: true
  },
  
  // ===========================================
  // 2. Workstation
  // ===========================================
  workstationNumber: {
    type: String,
    default: "",
    trim: true
  },
  
  // ===========================================
  // 3. Issue Details
  // ===========================================
  issueCategory: {
    type: String,
    enum: {
      values: ["hardware", "software", "facility", "cleanliness"],
      message: 'Issue category must be hardware, software, facility, or cleanliness'
    },
    required: [true, 'Issue category is required']
  },
  
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images) {
        return images.length <= 5; // Maximum 5 images
      },
      message: 'Cannot upload more than 5 images per report'
    }
  },
  
  // ===========================================
  // 4. Reporter Information
  // ===========================================
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'Reporter ID is required']
  },
  
  // ===========================================
  // 5. Workflow Status
  // ===========================================
  status: {
    type: String,
    enum: {
      values: [
        "submitted",
        "verified",
        "in_progress",
        "resolved",
        "closed"
      ],
      message: 'Invalid status value'
    },
    default: "submitted"
  },
  
  // ===========================================
  // 6. Custodian Progress Tracking
  // ===========================================
  updatedByCustodianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    validate: {
      validator: async function(custodianId) {
        if (!custodianId) return true; // null is allowed
        
        // Verify that the custodian has the correct role
        const User = mongoose.model('User');
        const custodian = await User.findById(custodianId);
        return custodian && (custodian.role === 'lab_custodian' || custodian.role === 'admin');
      },
      message: 'Updated by custodian must be a lab custodian or admin'
    }
  },
  
  custodianNotes: [custodianNoteSchema],
  
  // ===========================================
  // 7. System Tracking
  // ===========================================
  resolvedAt: {
    type: Date,
    default: null
  },
  
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ===========================================
// MIDDLEWARE HOOKS
// ===========================================

/**
 * Pre-save middleware
 * - Auto-populate labNameCache when labId is set
 * - Set resolved/closed timestamps based on status changes
 */
reportSchema.pre('save', async function(next) {
  try {
    // Auto-populate labNameCache if labId exists and labNameCache is empty
    if (this.labId && !this.labNameCache) {
      const Laboratory = mongoose.model('Laboratory');
      const lab = await Laboratory.findById(this.labId);
      if (lab) {
        this.labNameCache = lab.labName;
      }
    }
    
    // Set resolved timestamp when status changes to "resolved"
    if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    
    // Set closed timestamp when status changes to "closed"
    if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Pre-validate middleware
 * Validate workstation number against laboratory constraints
 */
reportSchema.pre('validate', async function(next) {
  try {
    if (this.workstationNumber && this.labId) {
      const Laboratory = mongoose.model('Laboratory');
      const lab = await Laboratory.findById(this.labId);
      
      if (lab) {
        const workstationNum = parseInt(this.workstationNumber);
        if (workstationNum < 1 || workstationNum > lab.numberOfWorkstations) {
          throw new Error(`Workstation number must be between 1 and ${lab.numberOfWorkstations} for ${lab.labName}`);
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ===========================================
// INDEXES
// ===========================================
reportSchema.index({ labId: 1 });
reportSchema.index({ labNameCache: 1 });
reportSchema.index({ issueCategory: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ updatedByCustodianId: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ resolvedAt: -1 });
reportSchema.index({ closedAt: -1 });

// Compound indexes for common queries
reportSchema.index({ labId: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ issueCategory: 1, status: 1 });

// ===========================================
// VIRTUAL FIELDS
// ===========================================

// Virtual for report age in days
reportSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
});

// Virtual for resolution time in hours
reportSchema.virtual('resolutionTimeHours').get(function() {
  if (!this.resolvedAt) return null;
  return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for formatted workstation
reportSchema.virtual('workstationDisplay').get(function() {
  return this.workstationNumber ? `Workstation ${this.workstationNumber}` : 'Unspecified';
});

// ===========================================
// INSTANCE METHODS
// ===========================================

/**
 * Add a custodian note to the report
 * @param {string} note - The note content
 * @param {ObjectId} custodianId - The custodian's user ID
 * @returns {Promise} Promise resolving to the updated report
 */
reportSchema.methods.addCustodianNote = function(note, custodianId) {
  this.custodianNotes.push({
    note: note,
    custodianId: custodianId,
    createdAt: new Date()
  });
  
  // Update the last custodian who acted on this report
  this.updatedByCustodianId = custodianId;
  
  return this.save();
};

/**
 * Update report status with custodian tracking
 * @param {string} newStatus - The new status
 * @param {ObjectId} custodianId - The custodian making the update
 * @param {string} note - Optional note about the status change
 * @returns {Promise} Promise resolving to the updated report
 */
reportSchema.methods.updateStatus = function(newStatus, custodianId, note = null) {
  this.status = newStatus;
  this.updatedByCustodianId = custodianId;
  
  if (note) {
    this.custodianNotes.push({
      note: `Status updated to "${newStatus}". ${note}`,
      custodianId: custodianId,
      createdAt: new Date()
    });
  }
  
  return this.save();
};

/**
 * Check if report can be updated by a specific user
 * @param {Object} user - User object with role property
 * @returns {boolean}
 */
reportSchema.methods.canBeUpdatedBy = function(user) {
  // Admins can update any report
  if (user.role === 'admin') return true;
  
  // Lab custodians can update reports
  if (user.role === 'lab_custodian') return true;
  
  // Reporters can update their own reports if status is "Submitted"
  if (user.role === 'student' || user.role === 'faculty') {
    return this.reporterId.toString() === user.id.toString() && this.status === 'Submitted';
  }
  
  return false;
};

// ===========================================
// STATIC METHODS
// ===========================================

/**
 * Find reports by laboratory
 * @param {ObjectId} labId - Laboratory ID
 * @param {Object} options - Query options
 * @returns {Promise} Promise resolving to reports
 */
reportSchema.statics.findByLaboratory = function(labId, options = {}) {
  let query = this.find({ labId });
  
  if (options.status) {
    query = query.where('status', options.status);
  }
  
  if (options.category) {
    query = query.where('issueCategory', options.category);
  }
  
  return query.populate('reporterId', 'fullName email role')
              .populate('updatedByCustodianId', 'fullName email')
              .populate('custodianNotes.custodianId', 'fullName email')
              .sort({ createdAt: -1 });
};

/**
 * Find reports by status
 * @param {string} status - Report status
 * @returns {Promise} Promise resolving to reports
 */
reportSchema.statics.findByStatus = function(status) {
  return this.find({ status })
             .populate('labId', 'labName labCode')
             .populate('reporterId', 'fullName email role')
             .populate('updatedByCustodianId', 'fullName email')
             .sort({ createdAt: -1 });
};

/**
 * Get report statistics
 * @param {Object} filters - Optional filters
 * @returns {Promise} Promise resolving to statistics
 */
reportSchema.statics.getStatistics = function(filters = {}) {
  const matchConditions = {};
  
  if (filters.labId) matchConditions.labId = mongoose.Types.ObjectId(filters.labId);
  if (filters.dateFrom) matchConditions.createdAt = { $gte: new Date(filters.dateFrom) };
  if (filters.dateTo) {
    matchConditions.createdAt = { 
      ...matchConditions.createdAt, 
      $lte: new Date(filters.dateTo) 
    };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            category: '$issueCategory'
          }
        }
      }
    },
    {
      $project: {
        totalReports: 1,
        statusCounts: {
          $reduce: {
            input: '$byStatus',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this.status',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.status', input: '$$value' } }, 0] }, 1] }
                  }]]
                }
              ]
            }
          }
        },
        categoryCounts: {
          $reduce: {
            input: '$byStatus',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this.category',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] }, 1] }
                  }]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Report', reportSchema);
