/**
 * LearnPulse REST API - Server Entry Point
 */
const app = require('./src/app');
const db = require('./src/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting
db.query('SELECT NOW() as current_time')
  .then((res) => {
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
  })
  .catch((err) => {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    console.error('Please check server/.env settings (DB_USER, DB_PASSWORD, DB_NAME).');
    process.exit(1);
  });
