/**
 * LearnPulse Express App Configuration
 */
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const progressRoutes = require('./routes/progressRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const instructorRoutes = require('./routes/instructorRoutes');

const path = require('path');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend assets and local video streams
app.use(express.static(path.join(__dirname, '../../')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'LearnPulse PostgreSQL REST API is operational 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/instructor', instructorRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

module.exports = app;
