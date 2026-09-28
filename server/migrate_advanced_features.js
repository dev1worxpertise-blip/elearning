/**
 * Migration Script: Advanced Enterprise & LMS Features
 * Creates audit_logs, discussions, video_notes, and email_dispatches tables
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const db = require('./src/db');

async function migrate() {
  console.log('🚀 Running Advanced Enterprise Features Database Migration...');

  try {
    await db.query('BEGIN');

    // 1. Audit Logs Table (Tamper-proof administrative activity trail)
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        user_name VARCHAR(150),
        action VARCHAR(100) NOT NULL,
        target VARCHAR(150),
        details TEXT,
        severity VARCHAR(30) DEFAULT 'INFO',
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ audit_logs table ready.');

    // 2. Module Discussions Table (Community Q&A)
    await db.query(`
      CREATE TABLE IF NOT EXISTS discussions (
        id VARCHAR(100) PRIMARY KEY,
        module_id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        user_role VARCHAR(50) DEFAULT 'student',
        user_avatar TEXT,
        content TEXT NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ discussions table ready.');

    // 3. Learner Video Notes Table (Interactive timestamped notes)
    await db.query(`
      CREATE TABLE IF NOT EXISTS video_notes (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        module_id VARCHAR(100) NOT NULL,
        timestamp_seconds INT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ video_notes table ready.');

    // 4. Email / Notification Dispatches Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS email_dispatches (
        id VARCHAR(100) PRIMARY KEY,
        recipient VARCHAR(150) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        email_type VARCHAR(50) NOT NULL,
        status VARCHAR(30) DEFAULT 'DELIVERED',
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ email_dispatches table ready.');

    // 5. Add playback_position column to module_progress if not exists
    await db.query(`
      ALTER TABLE module_progress
      ADD COLUMN IF NOT EXISTS playback_position_seconds INT DEFAULT 0;
    `);
    console.log('✅ module_progress playback_position_seconds column ready.');

    // 6. Add xp_points and streak_days to users table if not exists
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS xp_points INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS streak_days INT DEFAULT 1,
      ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
    `);
    console.log('✅ users gamification columns (xp_points, streak_days, badges) ready.');

    await db.query('COMMIT');
    console.log('🎉 Advanced Enterprise Features Migration successfully completed!');
    process.exit(0);
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrate();
