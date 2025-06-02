const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeResume, findMatchingJobs } = require('../services/geminiService');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Extract text from document based on file type
async function extractTextFromDocument(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdf(file.buffer);
    return data.text;
  } else {
    // Handle Word documents
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
}

// Upload resume and get job recommendations
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from document
    const resumeContent = await extractTextFromDocument(req.file);
    console.log('Extracted Resume Content:', resumeContent.substring(0, 500) + '...'); // Log first 500 characters

    // Analyze resume using Gemini
    const resumeAnalysis = await analyzeResume(resumeContent);

    // Get job recommendations
    const jobRecommendations = await findMatchingJobs(resumeAnalysis);

    res.json({
      success: true,
      jobs: jobRecommendations.jobs
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

module.exports = router; 