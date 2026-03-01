/**
 * ===========================================
 * LABORATORY MODEL (Dynamic Lab List)
 * ===========================================
 * Mongoose model for managing laboratory information
 */

const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  // Lab identification
  labCode: {
    type: String,
    required: [true, 'Lab code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  labName: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true
  },
  
  // Lab details
  location: {
    type: String,
    default: "",
    trim: true
  },
  
  description: {
    type: String,
    default: "",
    trim: true
  },
  
  numberOfWorkstations: {
    type: Number,
    default: 0,
    min: [0, 'Number of workstations cannot be negative']
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
 * Post hook for findOneAndUpdate
 * Updates all related Report documents when labName or labCode changes
 */
laboratorySchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    // Import Report model (avoid circular dependency)
    const Report = mongoose.model('Report');
    
    try {
      // Update labNameCache in all reports for this laboratory
      await Report.updateMany(
        { labId: doc._id },
        { 
          $set: { 
            labNameCache: doc.labName 
          }
        }
      );
      
      console.log(`✅ Updated labNameCache for all reports in laboratory: ${doc.labName}`);
    } catch (error) {
      console.error('❌ Error updating labNameCache in reports:', error);
    }
  }
});

/**
 * Post hook for save
 * Updates related Report documents when a lab is saved with changes
 */
laboratorySchema.post('save', async function(doc) {
  if (doc.isModified('labName')) {
    // Import Report model (avoid circular dependency)
    const Report = mongoose.model('Report');
    
    try {
      // Update labNameCache in all reports for this laboratory
      await Report.updateMany(
        { labId: doc._id },
        { 
          $set: { 
            labNameCache: doc.labName 
          }
        }
      );
      
      console.log(`✅ Updated labNameCache for all reports in laboratory: ${doc.labName}`);
    } catch (error) {
      console.error('❌ Error updating labNameCache in reports:', error);
    }
  }
});

// ===========================================
// INDEXES
// ===========================================
laboratorySchema.index({ labCode: 1 });
laboratorySchema.index({ labName: 1 });
laboratorySchema.index({ isActive: 1 });
laboratorySchema.index({ createdAt: -1 });

// ===========================================
// VIRTUAL FIELDS
// ===========================================

// Virtual for full lab identifier
laboratorySchema.virtual('fullIdentifier').get(function() {
  return `${this.labCode} - ${this.labName}`;
});

// Virtual for workstation range
laboratorySchema.virtual('workstationRange').get(function() {
  if (this.numberOfWorkstations <= 0) return 'No workstations';
  return `1-${this.numberOfWorkstations}`;
});

// ===========================================
// INSTANCE METHODS
// ===========================================

/**
 * Get active workstation numbers for this lab
 * @returns {Array} Array of workstation numbers as strings
 */
laboratorySchema.methods.getWorkstationNumbers = function() {
  const workstations = [];
  for (let i = 1; i <= this.numberOfWorkstations; i++) {
    workstations.push(i.toString());
  }
  return workstations;
};

/**
 * Check if a workstation number is valid for this lab
 * @param {string|number} workstationNumber
 * @returns {boolean}
 */
laboratorySchema.methods.isValidWorkstation = function(workstationNumber) {
  const num = parseInt(workstationNumber);
  return num >= 1 && num <= this.numberOfWorkstations;
};

// ===========================================
// STATIC METHODS
// ===========================================

/**
 * Find all active laboratories
 * @returns {Promise} Promise resolving to active labs
 */
laboratorySchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ labCode: 1 });
};

/**
 * Find lab by code (case-insensitive)
 * @param {string} labCode
 * @returns {Promise} Promise resolving to lab or null
 */
laboratorySchema.statics.findByCode = function(labCode) {
  return this.findOne({ labCode: labCode.toUpperCase() });
};

module.exports = mongoose.model('Laboratory', laboratorySchema);
