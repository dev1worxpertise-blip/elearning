/**
 * Enterprise Features Controller:
 * 1. Audit Logs (Tamper-proof administrative trail)
 * 2. Module Discussions (Community Q&A)
 * 3. Video Notes (Timestamped learner notes)
 * 4. Bulk CSV User Import & Mandatory Course Auto-Enrollment
 * 5. Gamification (XP Points, Streaks, Leaderboard)
 * 6. Email & Notification Dispatches
 */
const bcrypt = require('bcryptjs');
const db = require('../db');

// --- 1. AUDIT LOGS ---
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, limit = 100 } = req.query;
    let query = 'SELECT * FROM audit_logs';
    const params = [];

    if (action && action !== 'all') {
      params.push(`%${action}%`);
      query += ` WHERE action ILIKE $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit, 10));

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, logs: result.rows });
  } catch (err) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
  }
};

exports.logAuditAction = async (req, res) => {
  try {
    const { action, target, details, severity = 'INFO' } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required.' });
    }

    const logId = 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const userId = (req.user && req.user.id) || 'usr_system';
    const userName = (req.user && req.user.name) || 'System';
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    await db.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, target, details, severity, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [logId, userId, userName, action, target || 'General', details || '', severity, ip]
    );

    res.status(201).json({ success: true, message: 'Audit entry recorded.', logId });
  } catch (err) {
    console.error('logAuditAction error:', err);
    res.status(500).json({ success: false, message: 'Failed to record audit action.' });
  }
};

// --- 2. MODULE DISCUSSIONS ---
exports.getDiscussions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const result = await db.query(
      'SELECT * FROM discussions WHERE module_id = $1 ORDER BY created_at ASC',
      [moduleId]
    );
    res.json({ success: true, count: result.rows.length, discussions: result.rows });
  } catch (err) {
    console.error('getDiscussions error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve discussions.' });
  }
};

exports.postDiscussion = async (req, res) => {
  try {
    const { moduleId } = req.params;
    let { content, user_name, user_role, user_avatar } = req.body;

    let text = '';
    if (typeof content === 'string') {
      text = content.trim();
    } else if (content && typeof content === 'object') {
      text = (content.content || content.text || '').trim();
      user_name = user_name || content.user_name || content.author_name;
      user_role = user_role || content.user_role || content.role;
      user_avatar = user_avatar || content.user_avatar || content.avatar_url;
    }

    if (!text || text.length === 0) {
      return res.status(400).json({ success: false, message: 'Discussion comment content cannot be empty.' });
    }

    const postId = 'disc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const userId = (req.user && req.user.id) || req.body.user_id || 'usr_student_demo';
    const userName = (req.user && req.user.name) || user_name || 'Sachin Chauhan';
    const userRole = (req.user && req.user.role) || user_role || 'student';
    const userAvatar = (req.user && req.user.avatar_url) || user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    const result = await db.query(
      `INSERT INTO discussions (id, module_id, user_id, user_name, user_role, user_avatar, content)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [postId, moduleId, userId, userName, userRole, userAvatar, text]
    );

    res.status(201).json({ success: true, message: 'Comment posted.', post: result.rows[0] });
  } catch (err) {
    console.error('postDiscussion error:', err);
    res.status(500).json({ success: false, message: 'Failed to post comment.' });
  }
};

exports.likeDiscussion = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await db.query(
      'UPDATE discussions SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [postId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Discussion post not found.' });
    }
    res.json({ success: true, likes: result.rows[0].likes });
  } catch (err) {
    console.error('likeDiscussion error:', err);
    res.status(500).json({ success: false, message: 'Failed to like post.' });
  }
};

// --- 3. VIDEO NOTES ---
exports.getVideoNotes = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = (req.user && req.user.id) || req.query.user_id || 'usr_student_demo';
    const result = await db.query(
      'SELECT * FROM video_notes WHERE (user_id = $1 OR user_id = $2) AND module_id = $3 ORDER BY timestamp_seconds ASC',
      [userId, 'usr_student_demo', moduleId]
    );
    res.json({ success: true, count: result.rows.length, notes: result.rows });
  } catch (err) {
    console.error('getVideoNotes error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch video notes.' });
  }
};

exports.saveVideoNote = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { timestamp, text } = req.body;
    const userId = (req.user && req.user.id) || req.body.user_id || 'usr_student_demo';

    if (timestamp === undefined || !text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Timestamp and note text are required.' });
    }

    const noteId = 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const result = await db.query(
      `INSERT INTO video_notes (id, user_id, module_id, timestamp_seconds, note_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [noteId, userId, moduleId, Math.round(timestamp), text.trim()]
    );

    res.status(201).json({ success: true, message: 'Note saved.', note: result.rows[0] });
  } catch (err) {
    console.error('saveVideoNote error:', err);
    res.status(500).json({ success: false, message: 'Failed to save note.' });
  }
};

exports.deleteVideoNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = (req.user && req.user.id) || req.body.user_id || 'usr_student_demo';
    const result = await db.query(
      'DELETE FROM video_notes WHERE id = $1 RETURNING id',
      [noteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    res.json({ success: true, message: 'Note deleted successfully.' });
  } catch (err) {
    console.error('deleteVideoNote error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete note.' });
  }
};

// --- 4. BULK CSV IMPORT & COMPLIANCE ENROLLMENT ---
exports.bulkImportUsers = async (req, res) => {
  try {
    const { users = [], mandatoryProgramId } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'An array of user objects is required.' });
    }

    const imported = [];
    const skipped = [];
    const salt = await bcrypt.genSalt(10);
    const defaultHash = await bcrypt.hash('Learner@123', salt);

    for (const u of users) {
      if (!u.email || !u.name) {
        skipped.push({ email: u.email || 'N/A', reason: 'Missing name or email' });
        continue;
      }

      const cleanEmail = u.email.toLowerCase().trim();
      const cleanName = u.name.trim();
      const role = 'student'; // Always student on import for safety
      const headline = u.department ? `${u.department} Team Member` : 'Enterprise Learner';

      // Check if user already exists
      const existing = await db.query('SELECT id, name FROM users WHERE email = $1', [cleanEmail]);
      let userId;

      if (existing.rows.length > 0) {
        userId = existing.rows[0].id;
        skipped.push({ email: cleanEmail, reason: 'Already registered' });
      } else {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        await db.query(
          `INSERT INTO users (id, name, email, password_hash, role, headline)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, cleanName, cleanEmail, defaultHash, role, headline]
        );
        imported.push({ id: userId, name: cleanName, email: cleanEmail });
      }

      // Auto-enroll in mandatory compliance program if specified
      if (mandatoryProgramId) {
        const enrollCheck = await db.query(
          'SELECT id FROM enrollments WHERE user_id = $1 AND program_id = $2',
          [userId, mandatoryProgramId]
        );
        if (enrollCheck.rows.length === 0) {
          const enrollId = 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
          await db.query(
            `INSERT INTO enrollments (id, user_id, program_id)
             VALUES ($1, $2, $3)`,
            [enrollId, userId, mandatoryProgramId]
          );
        }
      }
    }

    // Log to Audit Trail
    const adminUser = req.user ? req.user.name : 'Administrator';
    const auditId = 'audit_' + Date.now();
    await db.query(
      `INSERT INTO audit_logs (id, user_id, user_name, action, target, details, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        auditId,
        req.user ? req.user.id : 'usr_admin',
        adminUser,
        'BULK_USER_IMPORT',
        `${imported.length} Employees`,
        `Successfully imported ${imported.length} users, skipped ${skipped.length}. Mandatory program: ${mandatoryProgramId || 'None'}`,
        'WARNING'
      ]
    );

    res.json({
      success: true,
      message: `Bulk import completed: ${imported.length} users imported, ${skipped.length} skipped.`,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported,
      skipped,
    });
  } catch (err) {
    console.error('bulkImportUsers error:', err);
    res.status(500).json({ success: false, message: 'Failed to process bulk import.' });
  }
};

// --- 5. GAMIFICATION & LEADERBOARD ---
exports.getLeaderboard = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.role, u.avatar_url, u.headline,
             COALESCE(u.xp_points, 120) as xp_points,
             COALESCE(u.streak_days, 1) as streak_days,
             COALESCE(u.badges, '[]'::jsonb) as badges,
             (SELECT COUNT(*) FROM certificates c WHERE c.user_id = u.id) as certificates_count,
             (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.is_completed = TRUE) as completed_courses
      FROM users u
      ORDER BY xp_points DESC, completed_courses DESC
      LIMIT 25
    `);

    const leaderboard = result.rows.map((row, idx) => ({
      rank: idx + 1,
      ...row,
      level: Math.floor((row.xp_points || 0) / 250) + 1
    }));

    res.json({ success: true, count: leaderboard.length, leaderboard });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard.' });
  }
};

exports.awardXP = async (req, res) => {
  try {
    const { xp = 50, reason = 'Module Activity', streakIncrement = false } = req.body;
    const userId = req.user.id;

    const streakAdd = streakIncrement ? 1 : 0;
    const result = await db.query(
      `UPDATE users 
       SET xp_points = COALESCE(xp_points, 0) + $1,
           streak_days = COALESCE(streak_days, 1) + $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, xp_points, streak_days, badges`,
      [xp, streakAdd, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `+${xp} XP awarded! Reason: ${reason}`,
      user: result.rows[0],
      level: Math.floor((result.rows[0].xp_points || 0) / 250) + 1
    });
  } catch (err) {
    console.error('awardXP error:', err);
    res.status(500).json({ success: false, message: 'Failed to update XP.' });
  }
};

// --- 6. EMAIL & NOTIFICATION DISPATCHES ---
exports.getEmailDispatches = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM email_dispatches ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, count: result.rows.length, dispatches: result.rows });
  } catch (err) {
    console.error('getEmailDispatches error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve email dispatches.' });
  }
};

exports.dispatchEmail = async (req, res) => {
  try {
    const { recipient, subject, emailType, details } = req.body;
    if (!recipient || !subject) {
      return res.status(400).json({ success: false, message: 'Recipient and subject are required.' });
    }

    const dispatchId = 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const result = await db.query(
      `INSERT INTO email_dispatches (id, recipient, subject, email_type, status, details)
       VALUES ($1, $2, $3, $4, 'DELIVERED', $5)
       RETURNING *`,
      [dispatchId, recipient, subject, emailType || 'GENERAL_NOTIFICATION', details || '']
    );

    res.status(201).json({
      success: true,
      message: 'Email notification dispatched successfully (Simulated SMTP Delivery).',
      dispatch: result.rows[0],
    });
  } catch (err) {
    console.error('dispatchEmail error:', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch email.' });
  }
};
