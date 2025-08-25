require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const aiRoutes = require('./routes/ai');

const resumeParserRouter = require('./routes/resumeParser');
const interviewsRouter = require('./routes/interviews');
const userAnswersRouter = require('./routes/user-answers');

const app = express();

// Manual CORS headers as backup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// CORS debugging middleware
app.use((req, res, next) => {
  console.log('=== CORS DEBUG ===');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  next();
});

// Simple CORS configuration - allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Raw body logging for debugging
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/user-answers')) {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      console.log('=== RAW BODY DEBUG ===');
      console.log('Raw body received:', data);
      console.log('Raw body length:', data.length);
      console.log('Raw body type:', typeof data);
      console.log('Is JSON parseable:', (() => {
        try {
          JSON.parse(data);
          return true;
        } catch (e) {
          return false;
        }
      })());
    });
  }
  next();
});

// Middleware - Body parsing after CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
  }
  next();
});

// Connect to MongoDB (optional for testing)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MongoDB URI not provided, skipping database connection');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);

app.use('/api/resume-parser', resumeParserRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/user-answers', userAnswersRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Request details:', {
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user
  });
  
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('API Key configured:', process.env.GOOGLE_AI_KEY ? 'Yes' : 'No (using fallback)');
  console.log('Available routes:');
  console.log('  - /api/auth');
  console.log('  - /api/resumes');
  console.log('  - /api/ai');
  console.log('  - /api/job-recommendations');
  console.log('  - /api/resume-parser');
  console.log('  - /api/interviews');
  console.log('  - /api/user-answers');
});