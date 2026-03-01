const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserAnalytics,
  getUserById,
  createUserByAdmin,
  updateUser,
  deactivateUser,
  deactivateUserByPatch,
  resetUserPassword
} = require('../controllers/userController');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUserByAdmin);

router.get('/analytics', protect, authorize('admin'), getUserAnalytics);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deactivateUser);

router.patch('/:id/deactivate', protect, authorize('admin'), deactivateUserByPatch);

// Allow admins and lab custodians to reset another user's password to the default value
router.patch('/:id/reset-password', protect, authorize('admin', 'lab_custodian'), resetUserPassword);

module.exports = router;
