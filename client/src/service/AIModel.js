import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyCb4NZGfgyKPWsd4eG4kYuZ2RLKNbHY6Yw'; // (move to .env for security in real apps)

export async function generateSummaryWithAI(jobTitle) {
  try {
    const response = await fetch('http://localhost:5000/api/ai/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobTitle }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(error.message || 'Failed to generate summary');
  }
}

export async function generateExperienceDescription(position, company, industry = "Technology") {
  try {
    const response = await fetch('http://localhost:5000/api/ai/generate-experience', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        position,
        company,
        industry,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate experience description');
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error generating experience description:', error);
    throw error;
  }
}

export async function generateProjectDescription(projectName, technologies, role) {
  try {
    const response = await fetch('http://localhost:5000/api/ai/generate-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
        technologies,
        role,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate project description');
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error generating project description:', error);
    throw new Error(error.message || 'Failed to generate project description');
  }
}
  
  
  
