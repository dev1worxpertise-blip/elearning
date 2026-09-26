/**
 * User Management & Administration Routes
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Public/Admin list of users for administration
router.get('/', userController.getAllUsers);

// Role assignment
router.put('/:id/role', userController.updateUserRole);

// Block/Unblock toggle & lockout reset
router.put('/:id/block', userController.toggleBlockStatus);

// Password reset by admin
router.put('/:id/reset-password', userController.resetPassword);

// Create new user with specific role
router.post('/', userController.createUser);

// Delete user account
router.delete('/:id', userController.deleteUser);

module.exports = router;
