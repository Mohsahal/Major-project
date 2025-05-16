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
You are an expert resume writer. Write a single, concise, professional summary for a resume for the following job title: "${jobTitle}".
The summary should be 4-5 lines, tailored for a resume, and should not include any options, instructions, or extra text. Only return the summary itself.
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
  
  
  
