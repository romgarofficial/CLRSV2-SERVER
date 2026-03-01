const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ===========================================
  // PERSONAL INFORMATION
  // ===========================================
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  middleName: {
    type: String,
    default: "",
    trim: true,
    maxlength: [50, 'Middle name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  fullName: {
    type: String,
    trim: true
  },

  // ===========================================
  // CONTACT INFORMATION
  // ===========================================
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  contactNumber: {
    type: String,
    default: "",
    trim: true
  },

  // ===========================================
  // AUTHENTICATION
  // ===========================================
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },

  // ===========================================
  // USER ROLE
  // ===========================================
  role: {
    type: String,
    enum: {
      values: ["student", "faculty", "lab_custodian", "admin"],
      message: 'Role must be either student, faculty, lab_custodian, or admin'
    },
    default: "student"
  },

  // ===========================================
  // EMAIL VERIFICATION USING OTP
  // ===========================================
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: {
    type: String,
    select: false // Don't include OTP in queries by default
  },
  emailOTPExpires: {
    type: Date
  },
  emailVerifiedAt: {
    type: Date
  },

  // ===========================================
  // SYSTEM FIELDS
  // ===========================================
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// ===========================================
// PRE-SAVE HOOKS
// ===========================================
userSchema.pre('save', async function(next) {
  // Generate fullName automatically
  let fullName = this.firstName;
  if (this.middleName && this.middleName.trim()) {
    fullName += ` ${this.middleName}`;
  }
  fullName += ` ${this.lastName}`;
  this.fullName = fullName;

  // Ensure email is lowercase (redundant but ensures consistency)
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  // Only hash password if it was modified
  if (!this.isModified('passwordHash')) return next();
  
  // Hash the password with cost of 12
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ===========================================
// INSTANCE METHODS
// ===========================================

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to compare OTP
userSchema.methods.compareOTP = async function(enteredOTP) {
  if (!this.emailOTP) return false;
  return await bcrypt.compare(enteredOTP, this.emailOTP);
};

// Method to generate OTP
userSchema.methods.generateOTP = async function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP
  this.emailOTP = await bcrypt.hash(otp, 12);
  
  // Set expiry time to 15 minutes from now
  this.emailOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
  
  // Return the plain OTP (to send via email)
  return otp;
};

// ===========================================
// JSON TRANSFORM
// ===========================================
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  
  // Remove sensitive fields from JSON response
  delete userObject.passwordHash;
  delete userObject.emailOTP;
  
  return userObject;
};

// ===========================================
// INDEXES
// ===========================================
// Note: email index is automatically created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ emailOTPExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', userSchema);
