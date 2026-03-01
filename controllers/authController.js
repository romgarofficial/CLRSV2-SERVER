const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { welcomeOTPTemplate, resendOTPTemplate } = require('../templates/emails');
const activationConfirmationTemplate = require('../templates/emails/activationConfirmation');
const { sendEmail } = require('../utils/emailService');

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ===========================================
// REGISTRATION FLOW
// ===========================================

// @desc    Register new user with OTP verification
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      middleName, 
      lastName, 
      email, 
      contactNumber, 
      password, 
      role 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, and password'
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role assignment (only admin can assign roles other than student)
    let userRole = 'student'; // default
    if (role && role !== 'student') {
      // TODO: Add middleware to check if current user is admin
      // For now, we'll allow role assignment (can be restricted later)
      const validRoles = ['student', 'faculty', 'lab_custodian', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      userRole = role;
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Create user with OTP
    const user = await User.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '',
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: contactNumber?.trim() || '',
      passwordHash: password,
      role: userRole,
      isEmailVerified: false,
      emailOTP: hashedOTP,
      emailOTPExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Send OTP email using template
    const emailContent = welcomeOTPTemplate(user.firstName, otp);
    await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      data: {
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific mongoose validation errors
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
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// EMAIL VERIFICATION
// ===========================================

// @desc    Verify email using OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user by email and include OTP fields
    const user = await User.findOne({ email: email.toLowerCase() })
                          .select('+emailOTP');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if OTP exists and hasn't expired
    if (!user.emailOTP || !user.emailOTPExpires) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    if (user.emailOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, user.emailOTP);
    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Update user - mark as verified and clear OTP
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Send activation confirmation email
    try {
      const emailContent = activationConfirmationTemplate(
        user.firstName,
        user.fullName,
        user.email,
        user.role
      );
      await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);
      console.log(`Activation confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending activation confirmation email:', emailError);
      // Don't fail the verification process if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to CIT CLRS.'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// RESEND OTP
// ===========================================

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);

    // Update user with new OTP
    user.emailOTP = hashedOTP;
    user.emailOTPExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send new OTP email using template
    const emailContent = resendOTPTemplate(user.firstName, otp);
    await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// LOGIN
// ===========================================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() })
                          .select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your email for OTP.',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          contactNumber: user.contactNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ===========================================
// GET CURRENT USER
// ===========================================

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Update current user's profile details
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { firstName, middleName, lastName, contactNumber } = req.body || {};

    if (firstName !== undefined) user.firstName = String(firstName).trim();
    if (middleName !== undefined) user.middleName = String(middleName || '').trim();
    if (lastName !== undefined) user.lastName = String(lastName).trim();
    if (contactNumber !== undefined) user.contactNumber = String(contactNumber || '').trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((entry) => entry.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isCurrentValid = await user.matchPassword(String(currentPassword));
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.passwordHash = String(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// ===========================================
// EXPORTS
// ===========================================

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
};
