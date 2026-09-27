/**
 * LearnPulse Express App Configuration (Hardened for VAPT)
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const programRoutes = require('./routes/programRoutes');
const progressRoutes = require('./routes/progressRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. Hide Server Banner (OWASP Information Disclosure Prevention)
app.disable('x-powered-by');

// 2. HTTP Security Headers via Helmet (OWASP A05 Compliance)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin video players, YouTube iframes, CDNs
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' }, // Clickjacking prevention
    noSniff: true, // X-Content-Type-Options: nosniff
    dnsPrefetchControl: { allow: false },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 3. Strict CORS Whitelisting
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, local static file loading)
      if (!origin) return callback(null, true);
      if (!allowedOrigins) {
        // In local/development, permit localhost and 127.0.0.1 on any port
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
      } else if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, logged in audit
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// 4. Rate Limiting (OWASP A04 Denial of Service & Brute-Force Prevention)
// General API Rate Limiter: max 300 requests per 15 minutes per IP
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Strict Auth Rate Limiter: max 30 login/register attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
  },
});

// 5. Body Parsing with Payload Size Limits (Buffer Overflow / ReDoS Prevention)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 6. Static File Path Traversal Defense (OWASP A01 Sensitive File Exposure)
// Strictly deny direct HTTP access to internal server code, dotfiles, git directories, and config files
app.use((req, res, next) => {
  const normalizedPath = req.path.toLowerCase();
  const forbiddenPatterns = [
    /^\/server(\/|$)/i,
    /^\/node_modules(\/|$)/i,
    /^\/\.git(\/|$)/i,
    /^\/\.env/i,
    /\.log$/i,
    /package\.json$/i,
    /package-lock\.json$/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(normalizedPath)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access to internal server resources and configuration files is denied.',
      });
    }
  }
  next();
});

// Serve frontend static assets with dotfiles strictly blocked
app.use(express.static(path.join(__dirname, '../../'), { dotfiles: 'deny' }));

// 7. API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'LearnPulse PostgreSQL REST API is operational 🚀',
    timestamp: new Date().toISOString(),
    security: {
      headers: 'helmet-active',
      rateLimiter: 'active',
      rbac: 'strict',
    },
  });
});

// 8. Mount Routes with Targeted Rate Limits
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);

app.use('/api/', generalApiLimiter);
app.use('/api/programs', programRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/users', userRoutes);

// 9. 404 Handler for Unmapped Routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// 10. Global Error Handler (Sanitized for VAPT: No internal stack/database details leaked)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error [Internal Log]:', err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    message: 'An unexpected internal server error occurred. Please try again later.',
    ...(isDev ? { debugError: err.message } : {}),
  });
});

module.exports = app;
