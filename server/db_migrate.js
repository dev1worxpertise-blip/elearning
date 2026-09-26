/**
 * Database Migration Script:
 * 1. Adds failed_login_attempts, is_blocked, blocked_at to users table
 * 2. Seeds default admin user if not exists
 */
const bcrypt = require('bcryptjs');
const db = require('./src/db');

async function migrate() {
  console.log('🚀 Running user security & lockout migration...');
  
  await db.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;
  `);
  console.log('✅ Added failed_login_attempts, is_blocked, blocked_at columns to users table.');

  // Check if admin user exists
  const adminCheck = await db.query("SELECT id, email, role FROM users WHERE role = 'admin' OR email = 'admin@learnpulse.dev'");
  if (adminCheck.rows.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash('Admin@123', salt);
    await db.query(`
      INSERT INTO users (id, name, email, password_hash, role, headline, is_blocked, failed_login_attempts)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET role = 'admin', is_blocked = FALSE, failed_login_attempts = 0
    `, [
      'usr_admin_master',
      'System Administrator',
      'admin@learnpulse.dev',
      passHash,
      'admin',
      'Chief Platform & Compliance Administrator',
      false,
      0
    ]);
    console.log('✅ Default Admin account created: admin@learnpulse.dev / Admin@123');
  } else {
    console.log(`ℹ️ Admin user already exists: ${adminCheck.rows[0].email} (${adminCheck.rows[0].role})`);
  }

  const cols = await db.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `);
  console.log('📋 Current users table columns:', cols.rows.map(c => c.column_name).join(', '));
  
  const allUsers = await db.query("SELECT id, name, email, role, is_blocked, failed_login_attempts FROM users");
  console.log('👥 Current registered users:', allUsers.rows);

  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
