/**
 * User Management & Administration Routes
 * All routes are strictly protected with Admin authentication & authorization.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Strict Protection: Only verified Administrators can access user directory and administrative controls
router.use(verifyToken, requireRole('admin'));

// Admin: List all registered users
router.get('/', userController.getAllUsers);

// Admin: Role assignment (student <-> instructor <-> admin)
router.put('/:id/role', userController.updateUserRole);

// Admin: Block/Unblock toggle & lockout reset
router.put('/:id/block', userController.toggleBlockStatus);

// Admin: Password reset
router.put('/:id/reset-password', userController.resetPassword);

// Admin: Create new user with specific role
router.post('/', userController.createUser);

// Admin: Delete user account
router.delete('/:id', userController.deleteUser);

module.exports = router;
