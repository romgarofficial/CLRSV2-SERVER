const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Permissive CORS configuration to support browser + Postman + Vercel
const corsOptions = {
  origin: true, // Reflect request origin
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

// Global CORS handling (including preflight for all routes)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'CLRS Backend Server is running successfully!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API status route
app.get('/api/status', (req, res) => {
  res.json({ server: 'running' });
});

// Test email route (for development/testing)
app.post('/api/test-email', async (req, res) => {
  try {
    const { sendEmail } = require('./utils/emailService');
    const { welcomeOTPTemplate } = require('./templates/emails');

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const testOTP = '123456';
    const emailContent = welcomeOTPTemplate('Test User', testOTP);

    const result = await sendEmail(
      email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        email,
        provider: result.provider || 'Development',
        messageId: result.messageId,
        timestamp: result.timestamp
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// API Routes
console.log('🔗 Loading API routes...');

// Debug middleware to log all API requests (before routes)
app.use('/api', (req, res, next) => {
  console.log(`🔍 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', require('./routes/authRoutes'));
console.log('✅ Auth routes loaded');

try {
  const laboratoryRoutes = require('./routes/laboratoryRoutes');
  app.use('/api/laboratories', laboratoryRoutes);
  console.log('✅ Laboratory routes loaded and mounted at /api/laboratories');
} catch (error) {
  console.error('❌ Error loading laboratory routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const newsRoutes = require('./routes/newsRoutes');
  app.use('/api/news', newsRoutes);
  console.log('✅ News routes loaded and mounted at /api/news');
} catch (error) {
  console.error('❌ Error loading news routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const reportRoutes = require('./routes/reportRoutes');
  app.use('/api/reports', reportRoutes);
  console.log('✅ Report routes loaded and mounted at /api/reports');
} catch (error) {
  console.error('❌ Error loading report routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded and mounted at /api/notifications');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const analyticsRoutes = require('./routes/analyticsRoutes');
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Analytics routes loaded and mounted at /api/analytics');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded and mounted at /api/users');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
  console.error('Stack:', error.stack);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'CORS policy does not allow this origin' });
  } else {
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
