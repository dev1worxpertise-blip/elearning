/**
 * LearnPulse REST API - Server Entry Point
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const db = require('./src/db');

const PORT = process.env.PORT || 5000;

// Resilient DB Connection with auto-retry
async function connectWithRetry(maxRetries = 5, retryDelayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await db.query('SELECT NOW() as current_time');
      console.log('----------------------------------------------------');
      console.log('✅ PostgreSQL Database connected successfully!');
      console.log('🕒 DB Server Time:', res.rows[0].current_time);
      console.log('----------------------------------------------------');

      app.listen(PORT, () => {
        console.log(`🚀 LearnPulse API Server running at: http://localhost:${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`📚 Programs API: http://localhost:${PORT}/api/programs`);
        console.log('----------------------------------------------------');
      });
      return;
    } catch (err) {
      console.warn(`⏳ [Attempt ${attempt}/${maxRetries}] Waiting for PostgreSQL (${err.message})...`);
      if (attempt === maxRetries) {
        console.error('❌ Failed to connect to PostgreSQL database after multiple attempts:', err.message);
        console.error('Please check server/.env settings (DB_USER, DB_PASSWORD, DB_NAME) and ensure PostgreSQL service is active.');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, retryDelayMs));
    }
  }
}

connectWithRetry();
