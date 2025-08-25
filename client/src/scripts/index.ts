// AI Chat Session for Mock Interview Feedback
import { API_BASE_URL } from '@/config/api';

class ChatSession {
  async sendMessage(prompt: string) {
    try {
      const token = localStorage.getItem('futurefind_token');
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return {
        response: {
          text: () => data.response || data.message || 'No response received'
        }
      };
    } catch (error) {
      console.error('AI Chat error:', error);
      return {
        response: {
          text: () => 'Sorry, I encountered an error. Please try again.'
        }
      };
    }
  }
}

export const chatSession = new ChatSession();
