const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5500,http://127.0.0.1:5500,https://profitgym-ten.vercel.app')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser with strict size limits to prevent payload abuse
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Connect to Database
connectDB();

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'online',
    service: 'PROFIT Training Club API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      connected: mongoose.connection.readyState === 1,
    },
  });
});

// Redirect root to /api info
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Root API information
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'PROFIT Training Club REST API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      bookings: '/api/bookings',
      contact: '/api/contact',
      memberships: '/api/memberships',
      auth: '/api/auth',
      admin: '/api/admin',
    },
  });
});

// Mount Public API Routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/memberships', require('./routes/memberships'));
app.use('/api/contact', require('./routes/contact'));

// Mount Admin & Authentication Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));


// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);

  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error occurred.' : err.message,
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `==============================================`);
  console.log('\x1b[32m%s\x1b[0m', `⚡ PROFIT Training Club API running on port ${PORT}`);
  console.log('\x1b[36m%s\x1b[0m', `⚡ Health check: http://localhost:${PORT}/api/health`);
  console.log('\x1b[36m%s\x1b[0m', `==============================================`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[Server] Gracefully shutting down...');
  server.close(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed.');
    }
    process.exit(0);
  });
});

module.exports = app;
