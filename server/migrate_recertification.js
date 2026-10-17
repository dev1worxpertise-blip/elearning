const db = require('./src/db');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Running recertification schema migrations...');
    await db.query(`
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 365;
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT FALSE;
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS auto_reassigned BOOLEAN DEFAULT FALSE;
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS cycle_number INTEGER DEFAULT 1;

      ALTER TABLE programs ADD COLUMN IF NOT EXISTS validity_days INTEGER DEFAULT 365;
      ALTER TABLE programs ADD COLUMN IF NOT EXISTS auto_recertify BOOLEAN DEFAULT TRUE;

      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS cycle_number INTEGER DEFAULT 1;
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS recertified_at TIMESTAMP WITH TIME ZONE;

      -- Backfill existing certificates if any
      UPDATE certificates 
      SET expires_at = created_at + INTERVAL '365 days', validity_days = 365 
      WHERE expires_at IS NULL;

      -- Backfill programs
      UPDATE programs 
      SET validity_days = 365, auto_recertify = TRUE 
      WHERE validity_days IS NULL;
    `);

    console.log('✅ Recertification & Expiry schema migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
