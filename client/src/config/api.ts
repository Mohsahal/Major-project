// API Configuration and endpoints
export const API_BASE_URL = (import.meta as ImportMeta).env.VITE_API_BASE_URL || 'http://localhost:1000/api';
export const FLASK_BASE_URL = (import.meta as ImportMeta).env.VITE_FLASK_BASE_URL || 'http://localhost:2000';

// API Endpoints
export const API_ENDPOINTS = {
  // Interviews
  INTERVIEWS: `${API_BASE_URL}/interviews`,
  INTERVIEW_BY_ID: (id: string) => `${API_BASE_URL}/interviews/${id}`,
  
  // Resumes
  RESUMES: `${API_BASE_URL}/resumes`,
  RESUME_BY_ID: (id: string) => `${API_BASE_URL}/resumes/${id}`,
  
  // User Answers
  USER_ANSWERS: `${API_BASE_URL}/user-answers`,
  USER_ANSWERS_BY_INTERVIEW: (interviewId: string) => `${API_BASE_URL}/user-answers/interview/${interviewId}`,
  
  // AI Generation
  AI_GENERATE_QUESTIONS: `${API_BASE_URL}/ai/generate-questions`,
  AI_GENERATE_SUMMARY: `${API_BASE_URL}/ai/generate-summary`,
  AI_GENERATE_EXPERIENCE: `${API_BASE_URL}/ai/generate-experience`,
  AI_GENERATE_PROJECT: `${API_BASE_URL}/ai/generate-project`,
  
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/signup`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  PROFILE_ME: `${API_BASE_URL}/auth/me`,
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
  GOOGLE_SIGNUP: `${API_BASE_URL}/auth/google-signup`,
};

export const FLASK_ENDPOINTS = {
  UPLOAD_RESUME: `${FLASK_BASE_URL}/upload`,
  DOWNLOAD_CSV: (filename: string) => `${FLASK_BASE_URL}/download/${filename}`,
};

// Utility: Ensure Flask server is awake and reachable (Render cold start mitigation)
export async function ensureFlaskAwake(maxRetries = 2, delayMs = 1200): Promise<void> {
  const healthUrl = `${FLASK_BASE_URL}/health`;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(healthUrl, { method: 'GET' });
      if (res.ok) {
        return;
      }
    } catch (_) {
      // swallow and retry
    }
    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  // If still not reachable, proceed and let the main request surface the error
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  question: string;
  answer: string;
}

export interface UserAnswer {
  id: string;
  mockIdRef: string;
  question: string;
  correct_ans: string;
  user_ans: string;
  feedback: string;
  rating: number;
  userId: string;
  confidence?: number;
  areas?: string[];
  timestamp?: string;
  answerLength?: number;
  relevanceScore?: number;
  createdAt: string;
  updatedAt: string;
}


// API Helper functions
export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log('API Request:', {
        endpoint,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body
      });
      
      console.log('Request options:', JSON.stringify(options, null, 2));
      console.log('Body type:', typeof options.body);
      console.log('Body content:', options.body);
      
      const requestConfig = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };
      
      // Ensure Content-Type is set correctly
      if (requestConfig.body && typeof requestConfig.body === 'string') {
        requestConfig.headers = {
          ...requestConfig.headers,
          'Content-Type': 'application/json',
        };
      }
      
            console.log('Final request config:', JSON.stringify(requestConfig, null, 2));
      console.log('Content-Type header:', requestConfig.headers['Content-Type']);
      console.log('Body length:', requestConfig.body ? (requestConfig.body as string).length : 0);
      
      const response = await fetch(endpoint, requestConfig);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const responseData = await response.json();

      if (!response.ok) {
        // Handle error responses
        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Handle successful responses
      if (responseData.success === true) {
        // Server returns { success: true, data: {...} }
        return {
          success: true,
          data: responseData.data,
          message: responseData.message
        };
      } else if (responseData.success === false) {
        // Server returns { success: false, message: "..." }
        return {
          success: false,
          error: responseData.message || responseData.error || 'Request failed'
        };
      } else {
        // Legacy format or direct data response
        return {
          success: true,
          data: responseData
        };
      }
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Interview methods
  static async getInterviews(token: string): Promise<ApiResponse<Interview[]>> {
    return this.request(API_ENDPOINTS.INTERVIEWS, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async getInterviewById(id: string, token: string): Promise<ApiResponse<Interview>> {
    return this.request(API_ENDPOINTS.INTERVIEW_BY_ID(id), {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async createInterview(data: Partial<Interview>, token: string): Promise<ApiResponse<Interview>> {
    return this.request(API_ENDPOINTS.INTERVIEWS, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateInterview(id: string, data: Partial<Interview>, token: string): Promise<ApiResponse<Interview>> {
    return this.request(API_ENDPOINTS.INTERVIEW_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async deleteInterview(id: string, token: string): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.INTERVIEW_BY_ID(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Profile methods
  static async getProfile(token: string): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.PROFILE_ME, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async updateProfile(data: { name?: string; profileImage?: string }, token: string): Promise<ApiResponse<any>> {
    return this.request(API_ENDPOINTS.PROFILE_ME, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }

  // User Answer methods
  static async saveUserAnswer(data: Partial<UserAnswer>, token: string): Promise<ApiResponse<UserAnswer>> {
    console.log('saveUserAnswer called with:', { data, token: token ? 'Token exists' : 'No token' });
    console.log('Data to be sent:', JSON.stringify(data, null, 2));
    
    // Create a simple fetch request to test
    try {
      const response = await fetch(API_ENDPOINTS.USER_ANSWERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      console.log('Direct fetch response status:', response.status);
      console.log('Direct fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseData = await response.json();
      console.log('Direct fetch response data:', responseData);
      
      if (!response.ok) {
        return {
          success: false,
          error: responseData.message || responseData.error || `HTTP ${response.status}`
        };
      }
      
      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message
      };
    } catch (error) {
      console.error('Direct fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getUserAnswersByInterview(interviewId: string, token: string): Promise<ApiResponse<UserAnswer[]>> {
    return this.request(API_ENDPOINTS.USER_ANSWERS_BY_INTERVIEW(interviewId), {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // AI Generation methods
  static async generateQuestions(data: {
    position: string;
    description: string;
    experience: number;
    techStack: string;
  }): Promise<ApiResponse<Question[]>> {
    return this.request(API_ENDPOINTS.AI_GENERATE_QUESTIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Validation utilities
export const validateInterviewData = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null) return false;
  const interviewData = data as Record<string, unknown>;
  return !!(
    interviewData.position &&
    interviewData.description &&
    typeof interviewData.experience === 'number' &&
    interviewData.techStack
  );
};

export const validateUserAnswerData = (data: unknown): boolean => {
  if (typeof data !== 'object' || data === null) return false;
  const answerData = data as Record<string, unknown>;
  return !!(
    answerData.mockIdRef &&
    answerData.question &&
    answerData.correct_ans &&
    answerData.user_ans &&
    answerData.feedback &&
    typeof answerData.rating === 'number'
  );
};
