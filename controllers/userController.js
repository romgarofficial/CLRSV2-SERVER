const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { welcomeOTPTemplate, passwordResetByAdminTemplate } = require('../templates/emails');
const { sendEmail } = require('../utils/emailService');

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;

  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    _id: user._id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    contactNumber: user.contactNumber,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const buildUserFilters = (query = {}) => {
  const filters = {};

  if (query.role) {
    filters.role = query.role;
  }

  if (query.status === 'active') {
    filters.isActive = true;
  }

  if (query.status === 'inactive') {
    filters.isActive = false;
  }

  if (query.search && query.search.trim()) {
    const keyword = query.search.trim();
    filters.$or = [
      { firstName: { $regex: keyword, $options: 'i' } },
      { middleName: { $regex: keyword, $options: 'i' } },
      { lastName: { $regex: keyword, $options: 'i' } },
      { fullName: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } }
    ];
  }

  return filters;
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const buildFullName = (firstName = '', middleName = '', lastName = '') => {
  const parts = [firstName, middleName, lastName]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return parts.join(' ');
};

const deactivateUserInternal = async ({ userId, actingUserId, currentPassword }) => {
  if (!currentPassword || !String(currentPassword).trim()) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Your password is required to deactivate another account.'
      }
    };
  }

  if (String(actingUserId) === String(userId)) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'You cannot deactivate your own account.'
      }
    };
  }

  const actingUser = await User.findById(actingUserId).select('+passwordHash');
  if (!actingUser) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Acting user not found.'
      }
    };
  }

  const isPasswordValid = await bcrypt.compare(String(currentPassword), actingUser.passwordHash || '');
  if (!isPasswordValid) {
    return {
      status: 401,
      body: {
        success: false,
        message: 'Invalid password. Deactivation denied.'
      }
    };
  }

  const user = await User.findById(userId);
  if (!user) {
    return {
      status: 404,
      body: {
        success: false,
        message: 'User not found.'
      }
    };
  }

  const normalizedUserId = new mongoose.Types.ObjectId(String(userId));
  const updateResult = await User.collection.updateOne(
    { _id: normalizedUserId },
    { $set: { isActive: false } }
  );

  if (!updateResult?.matchedCount) {
    return {
      status: 404,
      body: {
        success: false,
        message: 'User not found.'
      }
    };
  }

  const updatedUser = await User.findById(userId);

  if (!updatedUser || updatedUser.isActive !== false) {
    return {
      status: 500,
      body: {
        success: false,
        message: 'Failed to persist deactivation status.',
        debug: {
          matchedCount: updateResult?.matchedCount || 0,
          modifiedCount: updateResult?.modifiedCount || 0,
          observedIsActive: updatedUser?.isActive
        }
      }
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: 'User deactivated successfully.',
      data: sanitizeUser(updatedUser)
    }
  };
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const filters = buildUserFilters(req.query);
    const users = await User.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users: users.map(sanitizeUser),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.'
    });
  }
};

// @desc    Get user analytics summary
// @route   GET /api/users/analytics
// @access  Private/Admin
const getUserAnalytics = async (req, res) => {
  try {
    const summaryRows = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [{ $eq: ['$isActive', true] }, 1, 0]
            }
          },
          inactiveUsers: {
            $sum: {
              $cond: [{ $ne: ['$isActive', true] }, 1, 0]
            }
          },
          verifiedUsers: {
            $sum: {
              $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0]
            }
          },
          unverifiedUsers: {
            $sum: {
              $cond: [{ $ne: ['$isEmailVerified', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const roleRows = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const baseSummary = summaryRows[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0
    };

    const roleSummary = {
      admin: 0,
      lab_custodian: 0,
      faculty: 0,
      student: 0
    };

    roleRows.forEach((entry) => {
      if (entry?._id && Object.prototype.hasOwnProperty.call(roleSummary, entry._id)) {
        roleSummary[entry._id] = entry.count || 0;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        ...baseSummary,
        roleSummary
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics.'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user details.'
    });
  }
};

// @desc    Admin create user and send OTP
// @route   POST /api/users
// @access  Private/Admin
const createUserByAdmin = async (req, res) => {
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

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide firstName, lastName, email, and password.'
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const validRoles = ['student', 'faculty', 'lab_custodian', 'admin'];
    const assignedRole = role || 'student';

    if (!validRoles.includes(assignedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.'
      });
    }

    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 12);

    const user = await User.create({
      firstName: firstName.trim(),
      middleName: middleName?.trim() || '',
      lastName: lastName.trim(),
      email: normalizedEmail,
      contactNumber: contactNumber?.trim() || '',
      passwordHash: password,
      role: assignedRole,
      isEmailVerified: false,
      emailOTP: hashedOTP,
      emailOTPExpires: new Date(Date.now() + 15 * 60 * 1000),
      isActive: true
    });

    const emailContent = welcomeOTPTemplate(user.firstName, otp);
    await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);

    return res.status(201).json({
      success: true,
      message: 'User created successfully. OTP activation email has been sent.',
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Create user by admin error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((entry) => entry.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error.',
        errors: validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create user account.'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const allowedFields = [
      'firstName',
      'middleName',
      'lastName',
      'contactNumber',
      'role',
      'isActive',
      'isEmailVerified'
    ];

    const payload = req.body || {};

    if (Object.prototype.hasOwnProperty.call(payload, 'isActive') && payload.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Use deactivate action with password confirmation to deactivate a user.'
      });
    }

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        user[field] = payload[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
      const normalizedEmail = payload.email.toLowerCase().trim();
      const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account.'
        });
      }

      user.email = normalizedEmail;
    }

    const validRoles = ['student', 'faculty', 'lab_custodian', 'admin'];
    if (user.role && !validRoles.includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.'
      });
    }

    if (req.user?.id?.toString() === userId.toString() && payload.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.'
      });
    }

    const updates = {
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      email: user.email,
      fullName: buildFullName(user.firstName, user.middleName, user.lastName)
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.'
    });
  }
};

// @desc    Deactivate user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword } = req.body || {};

    const result = await deactivateUserInternal({
      userId,
      actingUserId: req.user?.id,
      currentPassword
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate user.'
    });
  }
};

// @desc    Deactivate user via patch endpoint
// @route   PATCH /api/users/:id/deactivate
// @access  Private/Admin
const deactivateUserByPatch = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword } = req.body || {};

    const result = await deactivateUserInternal({
      userId,
      actingUserId: req.user?.id,
      currentPassword
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Deactivate user (patch) error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate user.'
    });
  }
};

// @desc    Reset a user's password to the default value
// @route   PATCH /api/users/:id/reset-password
// @access  Private/Admin or Lab Custodian
const resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.'
      });
    }

    const user = await User.findById(userId).select('+passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Only an admin can reset another admin's password
    if (user.role === 'admin' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reset another admin\'s password.'
      });
    }

    // Set the password to the default value; pre-save hook will hash it
    const DEFAULT_PASSWORD = 'CLRS123!';
    user.passwordHash = DEFAULT_PASSWORD;
    await user.save();

    try {
      const emailContent = passwordResetByAdminTemplate(user.firstName || user.fullName || user.email, DEFAULT_PASSWORD);
      await sendEmail(user.email, emailContent.subject, emailContent.text, emailContent.html);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // We still consider the password reset successful even if email sending fails
    }

    return res.status(200).json({
      success: true,
      message: 'User password has been reset to the default value. A notification email will be sent to the user.'
    });
  } catch (error) {
    console.error('Reset user password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset user password.'
    });
  }
};

module.exports = {
  getUsers,
  getUserAnalytics,
  getUserById,
  createUserByAdmin,
  updateUser,
  deactivateUser,
  deactivateUserByPatch,
  resetUserPassword
};
