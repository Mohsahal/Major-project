const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use environment variable with fallback for development
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCb4NZGfgyKPWsd4eG4kYuZ2RLKNbHY6Yw';
const ai = new GoogleGenerativeAI(apiKey);

// Generate professional summary
router.post('/generate-summary', async (req, res) => {
  try {
    const { jobTitle } = req.body;
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are an expert resume writer specializing in entry-level positions and fresh graduates. Write a compelling professional summary for a resume for the following job title: "${jobTitle}".

Focus on:
- Academic achievements and relevant coursework
- Key technical skills and tools learned
- Any internships, projects, or relevant experience
- Soft skills and learning capabilities
- Career goals and enthusiasm for the role

The summary should:
- Be 3-4 lines long
- Highlight potential and eagerness to learn
- Emphasize transferable skills
- Be tailored for an entry-level position
- Use professional but enthusiastic tone
- Not include any options, instructions, or extra text

Only return the summary itself, written in first person.
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ summary: summary.trim().split('\n').filter(Boolean).slice(0, 5).join(' ') });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Generate experience description
router.post('/generate-experience', async (req, res) => {
  try {
    const { position, company, industry } = req.body;
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are an expert resume writer. Write a compelling job description for the following position: "${position}" at "${company}" in the ${industry} industry.

Focus on:
- Key responsibilities and achievements
- Technical skills and tools used
- Impact and results
- Leadership and collaboration
- Innovation and problem-solving

The description should:
- Be 3-4 bullet points
- Use strong action verbs
- Include quantifiable achievements
- Be specific and detailed
- Use professional tone
- Not include any options, instructions, or extra text

Format as bullet points, starting each with a strong action verb.
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();
    
    res.json({ description: description.trim() });
  } catch (error) {
    console.error('Error generating experience description:', error);
    res.status(500).json({ error: 'Failed to generate experience description' });
  }
});

// Generate project description
router.post('/generate-project', async (req, res) => {
  try {
    const { projectName, technologies, role } = req.body;
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
You are an expert resume writer. Write a compelling project description for the following project: "${projectName}" using ${technologies.join(', ')} where the role was "${role}".

Focus on:
- Technical implementation details
- Key features and functionality
- Your specific contributions and role
- Technologies and tools used
- Problem-solving and challenges overcome
- Impact and results achieved

The description should:
- Be 3-4 bullet points
- Use strong action verbs
- Include technical details
- Highlight your specific contributions
- Be specific and detailed
- Use professional tone
- Not include any options, instructions, or extra text

Format as bullet points, starting each with a strong action verb.
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();
    
    res.json({ description: description.trim() });
  } catch (error) {
    console.error('Error generating project description:', error);
    res.status(500).json({ error: 'Failed to generate project description' });
  }
});

// AI Chat for interview feedback
router.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt is required' 
      });
    }
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ 
      success: true, 
      response: response.trim() 
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate AI response',
      error: error.message 
    });
  }
});

// Generate interview questions and answers array
router.post('/generate-questions', async (req, res) => {
  try {
    const { position, description, experience, techStack } = req.body;
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

[
  { "question": "<Question text>", "answer": "<Answer text>" },
  ...
]

Job Information:
- Job Position: ${position}
- Job Description: ${description}
- Years of Experience Required: ${experience}
- Tech Stacks: ${techStack}

The questions should assess skills in ${techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(400).json({ message: 'Failed to extract JSON array from AI response' });
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return res.status(400).json({ message: 'AI response is not a JSON array' });
    res.json({ questions: arr });
     } catch (error) {
     console.error('Error generating interview questions:', error);
     res.status(500).json({ message: 'Failed to generate questions' });
   }
 });

module.exports = router;