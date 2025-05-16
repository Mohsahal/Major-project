import {
    GoogleGenAI,
  } from '@google/genai';
  
  const apiKey = 'AIzaSyBrUrqEtzwXAPT8huCcrg7tAZFyFtrwLUM'; // (move to .env for security in real apps)
  
  export async function generateSummaryWithAI(jobTitle) {
    const ai = new GoogleGenAI({ apiKey });
    const config = {
      responseMimeType: 'text/plain',
    };
    const model = 'gemini-1.5-flash';
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
  
    const contents = [
      { role: 'user', parts: [{ text: prompt }] }
    ];
  
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });
  
    let summary = '';
    for await (const chunk of response) {
      summary += chunk.text;
    }
    // Optional: Trim to 5 lines max if needed
    return summary.trim().split('\n').filter(Boolean).slice(0, 5).join(' ');
  }
  
  
  
