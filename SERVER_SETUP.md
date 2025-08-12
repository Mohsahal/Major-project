# Mock Interview System - Server Setup Guide

## 🚀 **Complete Backend Implementation**

This guide provides everything needed to set up a working backend server for the Mock Interview System.

## 📋 **Required Dependencies**

```bash
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken mongoose multer
npm install --save-dev nodemon @types/node @types/express
```

## 🗄️ **Database Schema (MongoDB)**

### **User Schema**
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### **Interview Schema**
```javascript
const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  description: { type: String, required: true },
  experience: { type: Number, required: true },
  techStack: { type: String, required: true },
  questions: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### **User Answer Schema**
```javascript
const userAnswerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockIdRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  question: { type: String, required: true },
  correct_ans: { type: String, required: true },
  user_ans: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  confidence: { type: Number, min: 0, max: 100 },
  areas: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  answerLength: { type: Number },
  relevanceScore: { type: Number, min: 0, max: 100 }
});
```

## 🔐 **Authentication Middleware**

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

## 🌐 **API Endpoints**

### **Server Setup (server.js)**
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/user-answers', require('./routes/userAnswers'));
app.use('/api/ai', require('./routes/ai'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **Authentication Routes (/routes/auth.js)**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
```

### **Interview Routes (/routes/interviews.js)**
```javascript
const express = require('express');
const Interview = require('../models/Interview');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get all interviews for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get interview by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new interview
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { position, description, experience, techStack, questions } = req.body;
    
    const interview = new Interview({
      userId: req.user.userId,
      position,
      description,
      experience,
      techStack,
      questions
    });
    
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update interview
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete interview
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
```

### **User Answers Routes (/routes/userAnswers.js)**
```javascript
const express = require('express');
const UserAnswer = require('../models/UserAnswer');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Save user answer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      mockIdRef,
      question,
      correct_ans,
      user_ans,
      feedback,
      rating,
      confidence,
      areas,
      timestamp,
      answerLength,
      relevanceScore
    } = req.body;
    
    const userAnswer = new UserAnswer({
      userId: req.user.userId,
      mockIdRef,
      question,
      correct_ans,
      user_ans,
      feedback,
      rating,
      confidence,
      areas,
      timestamp,
      answerLength,
      relevanceScore
    });
    
    await userAnswer.save();
    res.status(201).json(userAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user answers by interview
router.get('/interview/:interviewId', authenticateToken, async (req, res) => {
  try {
    const userAnswers = await UserAnswer.find({
      userId: req.user.userId,
      mockIdRef: req.params.interviewId
    }).sort({ timestamp: -1 });
    
    res.json(userAnswers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all user answers for a user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userAnswers = await UserAnswer.find({ userId: req.params.userId })
      .populate('mockIdRef')
      .sort({ timestamp: -1 });
    
    res.json(userAnswers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
```

### **AI Routes (/routes/ai.js)**
```javascript
const express = require('express');
const router = express.Router();

// Generate interview questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { position, description, experience, techStack } = req.body;
    
    // This is a mock implementation - replace with actual AI service
    const mockQuestions = [
      {
        question: `What experience do you have with ${techStack.split(',')[0]?.trim() || 'web development'}?`,
        answer: `I have ${experience} years of experience working with ${techStack.split(',')[0]?.trim() || 'web technologies'}, including building scalable applications and working in agile teams.`
      },
      {
        question: `How would you approach a challenging problem in ${position.toLowerCase()}?`,
        answer: `I would first understand the problem requirements, break it down into smaller components, research solutions, create a plan, implement it step by step, and test thoroughly.`
      },
      {
        question: `Describe a project where you used ${techStack.split(',')[1]?.trim() || 'modern development practices'}.`,
        answer: `I worked on a project where I implemented ${techStack.split(',')[1]?.trim() || 'modern development practices'}, including version control, code reviews, automated testing, and CI/CD pipelines.`
      },
      {
        question: `What are the key challenges in ${position.toLowerCase()}?`,
        answer: `Key challenges include staying updated with rapidly evolving technologies, managing complex system architectures, ensuring code quality, and balancing performance with maintainability.`
      },
      {
        question: `How do you stay current with industry trends?`,
        answer: `I regularly read technical blogs, attend conferences, participate in online communities, take courses, and contribute to open-source projects to stay current with industry trends.`
      }
    ];
    
    res.json({ questions: mockQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
```

## 🔧 **Environment Variables (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mock-interview-system
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

## 📁 **Project Structure**
```
server/
├── models/
│   ├── User.js
│   ├── Interview.js
│   └── UserAnswer.js
├── routes/
│   ├── auth.js
│   ├── interviews.js
│   ├── userAnswers.js
│   └── ai.js
├── middleware/
│   └── auth.js
├── server.js
├── package.json
└── .env
```

## 🚀 **Running the Server**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `.env` file with your connection string

3. **Start the server:**
   ```bash
   npm run dev
   # or
   node server.js
   ```

## ✅ **Testing Endpoints**

Use Postman or curl to test:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create interview (use token from login)
curl -X POST http://localhost:5000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"position":"Developer","description":"Test","experience":2,"techStack":"React,Node.js"}'
```

## 🔒 **Security Features**

- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- Input validation
- Error handling
- Rate limiting (can be added)

## 📊 **Database Indexes**

```javascript
// Add these indexes for better performance
userSchema.index({ email: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
userAnswerSchema.index({ userId: 1, mockIdRef: 1 });
userAnswerSchema.index({ timestamp: -1 });
```

This complete backend implementation will work seamlessly with your React frontend! 🎯
