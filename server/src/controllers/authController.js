/**
 * Authentication Controller
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'learnpulse_jwt_secret_key_default';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + Date.now();

    const insertQuery = `
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, avatar_url, created_at
    `;
    const result = await db.query(insertQuery, [userId, name.trim(), email.toLowerCase().trim(), passwordHash, role]);
    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Check if account is currently blocked
    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        attemptsLeft: 0,
        message: 'Security Alert: This account is LOCKED due to 3 failed login attempts. Please contact your platform Administrator to unblock or reset your account from the Admin Panel.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const currentAttempts = Number(user.failed_login_attempts || 0);
      const newAttempts = currentAttempts + 1;

      if (newAttempts >= 3) {
        // Lock account immediately
        await db.query(
          'UPDATE users SET failed_login_attempts = $1, is_blocked = TRUE, blocked_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newAttempts, user.id]
        );
        return res.status(403).json({
          success: false,
          isBlocked: true,
          attemptsLeft: 0,
          message: 'Account Locked! You have entered the wrong password 3 times. Your account has been locked for security. Please contact your platform Administrator to unblock your account.',
        });
      } else {
        // Increment failed attempts
        await db.query('UPDATE users SET failed_login_attempts = $1 WHERE id = $2', [newAttempts, user.id]);
        const remaining = 3 - newAttempts;
        return res.status(401).json({
          success: false,
          isBlocked: false,
          attemptsLeft: remaining,
          message: `Invalid password. You have ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before your account is locked.`,
        });
      }
    }

    // Password is correct: reset failed login attempts
    await db.query(
      'UPDATE users SET failed_login_attempts = 0, is_blocked = FALSE, blocked_at = NULL WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    delete user.password_hash;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, avatar_url, headline, bio, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, headline, bio, avatar_url } = req.body;
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          headline = COALESCE($2, headline),
          bio = COALESCE($3, bio),
          avatar_url = COALESCE($4, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, email, role, avatar_url, headline, bio
    `;
    const result = await db.query(query, [name, headline, bio, avatar_url, req.user.id]);
    res.json({ success: true, message: 'Profile updated successfully!', user: result.rows[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};
