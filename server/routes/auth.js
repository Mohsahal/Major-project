const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Use the Google Client ID from environment variables
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send response without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      name
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send response without password
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login route
router.post('/google-login', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: 'Access token is missing' });
    }

    console.log('Verifying Google access token...');
    
    // Get user info from Google using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userInfoResponse.json();
    console.log('Google user info:', userInfo);

    const { sub: googleId, email, name, picture } = userInfo;

    if (!email) {
      return res.status(401).json({ message: 'Invalid Google user info' });
    }

    // Check if user exists in your database
    let user = await User.findOne({ email });

    if (user) {
      // Update user's Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name
      };

      res.json({
        token,
        user: userResponse
      });
    } else {
      // Create new user
      user = new User({
        email,
        name,
        googleId,
      });

      await user.save();

      // Generate JWT for the new user
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name
      };

      res.status(201).json({
        token,
        user: userResponse
      });
    }
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed',
      error: error.message 
    });
  }
});

module.exports = router; 