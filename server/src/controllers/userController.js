/**
 * User Management & Administration Controller
 * Enables administrators to manage users, assign roles, unblock/lock accounts,
 * and reset credentials directly from the frontend Admin Panel.
 */
const bcrypt = require('bcryptjs');
const db = require('../db');

// Get all registered users
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT id, name, email, role, avatar_url, headline, is_blocked, 
             failed_login_attempts, blocked_at, created_at, updated_at
      FROM users
      ORDER BY created_at ASC
    `;
    const result = await db.query(query);
    res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: err.message });
  }
};

// Update user role (student <-> instructor <-> admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['student', 'instructor', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed roles are: ${validRoles.join(', ')}`,
      });
    }

    const normalizedRole = role.toLowerCase();
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, name, email, role, avatar_url, is_blocked, failed_login_attempts, created_at
    `;
    const result = await db.query(query, [normalizedRole, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `Role for ${result.rows[0].name} updated to ${normalizedRole.toUpperCase()} successfully!`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ success: false, message: 'Failed to update user role.', error: err.message });
  }
};

// Toggle user account block/lock status (or unblock locked user)
exports.toggleBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    let query;
    let params;

    if (isBlocked) {
      query = `
        UPDATE users 
        SET is_blocked = TRUE, failed_login_attempts = 3, blocked_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, email, role, is_blocked, failed_login_attempts, blocked_at
      `;
      params = [id];
    } else {
      // Unblock: reset failed attempts counter to 0 and clear blocked_at
      query = `
        UPDATE users 
        SET is_blocked = FALSE, failed_login_attempts = 0, blocked_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, email, role, is_blocked, failed_login_attempts, blocked_at
      `;
      params = [id];
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updatedUser = result.rows[0];
    const actionText = updatedUser.is_blocked ? 'LOCKED / SUSPENDED' : 'UNBLOCKED & RESTORED';

    res.json({
      success: true,
      message: `Account for ${updatedUser.name} (${updatedUser.email}) has been ${actionText} successfully!`,
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error toggling user block status:', err);
    res.status(500).json({ success: false, message: 'Failed to update user account status.', error: err.message });
  }
};

// Admin resets user's password directly from the panel
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'A valid password of at least 4 characters is required.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    // Also auto-unblocks user upon admin password reset
    const query = `
      UPDATE users 
      SET password_hash = $1, is_blocked = FALSE, failed_login_attempts = 0, blocked_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role, is_blocked
    `;
    const result = await db.query(query, [passwordHash, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `Password for ${result.rows[0].name} has been reset and account unblocked successfully!`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password.', error: err.message });
  }
};

// Admin creates a new user with designated role
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const validRoles = ['student', 'instructor', 'admin'];
    const assignedRole = validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'student';

    // Check if user already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + Date.now();

    const insertQuery = `
      INSERT INTO users (id, name, email, password_hash, role, is_blocked, failed_login_attempts)
      VALUES ($1, $2, $3, $4, $5, FALSE, 0)
      RETURNING id, name, email, role, avatar_url, is_blocked, failed_login_attempts, created_at
    `;
    const result = await db.query(insertQuery, [userId, name.trim(), email.toLowerCase().trim(), passwordHash, assignedRole]);

    res.status(201).json({
      success: true,
      message: `User ${name.trim()} successfully created with role ${assignedRole.toUpperCase()}!`,
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: 'Server error while creating user.', error: err.message });
  }
};

// Admin deletes a user account
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the primary admin account if needed
    const check = await db.query('SELECT email, role FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (check.rows[0].email === 'admin@learnpulse.dev') {
      return res.status(400).json({ success: false, message: 'Cannot delete the master System Administrator account.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User removed successfully from the platform.',
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user.', error: err.message });
  }
};
