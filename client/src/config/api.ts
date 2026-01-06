// API Configuration
export const FLASK_BASE_URL =
  import.meta.env.VITE_FLASK_BASE_URL || "http://localhost:2000";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:1000/api";

// Flask endpoints
export const FLASK_ENDPOINTS = {
  SKILL_GAP_ANALYSIS: `${FLASK_BASE_URL}/skill-gap-analysis`,
  JOB_RECOMMENDATIONS: `${FLASK_BASE_URL}/job-recommendations`,
  RESUME_ANALYSIS: `${FLASK_BASE_URL}/resume-analysis`,
  JOBS: `${FLASK_BASE_URL}/jobs`,
  UPLOAD_RESUME: `${FLASK_BASE_URL}/upload-resume`,
} as const;

// API endpoints for Node.js backend
export const API_ENDPOINTS = {
  // Direct endpoints (for backward compatibility with AuthContext)
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/signup`,
  PROFILE_ME: `${API_BASE_URL}/auth/me`,
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
  GOOGLE_SIGNUP: `${API_BASE_URL}/auth/google-signup`,
  RESUMES: `${API_BASE_URL}/resume`,
  RESUME_BY_ID: (id: string) => `${API_BASE_URL}/resume/${id}`,
  INTERVIEWS: `${API_BASE_URL}/interviews`,

  // Nested structure for new code
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/signup`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    PROFILE: `${API_BASE_URL}/auth/me`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
    GOOGLE_SIGNUP: `${API_BASE_URL}/auth/google-signup`,
  },
  QUESTIONS: {
    GENERATE: `${API_BASE_URL}/ai/generate-questions`,
    GET_BY_INTERVIEW: (interviewId: string) =>
      `${API_BASE_URL}/questions/interview/${interviewId}`,
  },
  FEEDBACK: {
    SUBMIT: `${API_BASE_URL}/feedback`,
    GET_BY_INTERVIEW: (interviewId: string) =>
      `${API_BASE_URL}/feedback/interview/${interviewId}`,
  },
  AI: {
    GENERATE_SUMMARY: `${API_BASE_URL}/ai/generate-summary`,
    GENERATE_EXPERIENCE: `${API_BASE_URL}/ai/generate-experience`,
    GENERATE_PROJECT: `${API_BASE_URL}/ai/generate-project`,
  },
} as const;

// Interview type definition
export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  techStack: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  questions?: any[];
}

// API Client class for making requests
export class ApiClient {
  private static baseUrl = API_BASE_URL;

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available (prefer AuthContext key, fallback to legacy key)
    const token =
      localStorage.getItem("futurefind_token") ||
      localStorage.getItem("authToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return response.text() as unknown as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Interview-specific methods
  static async createInterview(
    interview: Omit<Interview, "id" | "createdAt">
  ): Promise<Interview> {
    return this.post<Interview>(`${API_BASE_URL}/interviews`, interview);
  }

  static async getInterviews(): Promise<Interview[]> {
    return this.get<Interview[]>(`${API_BASE_URL}/interviews`);
  }

  static async getInterview(id: string): Promise<Interview> {
    return this.get<Interview>(`${API_BASE_URL}/interviews/${id}`);
  }

  static async updateInterview(
    id: string,
    interview: Partial<Interview>
  ): Promise<Interview> {
    return this.put<Interview>(`${API_BASE_URL}/interviews/${id}`, interview);
  }

  static async deleteInterview(id: string): Promise<void> {
    return this.delete<void>(`${API_BASE_URL}/interviews/${id}`);
  }

  // Get interview by ID (returns {success, data} format)
  static async getInterviewById(
    id: string,
    token?: string
  ): Promise<{ success: boolean; data?: Interview; message?: string }> {
    const endpoint = `${API_BASE_URL}/interviews/${id}`;
    const config: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    // Use token from parameter or fallback to localStorage
    if (!token) {
      token =
        localStorage.getItem("futurefind_token") ||
        localStorage.getItem("authToken") ||
        undefined;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get user answers by interview ID (returns {success, data} format)
  static async getUserAnswersByInterview(
    interviewId: string,
    token?: string
  ): Promise<{ success: boolean; data?: any[]; message?: string }> {
    const endpoint = `${API_BASE_URL}/user-answers/interview/${interviewId}`;
    const config: RequestInit = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    // Use token from parameter or fallback to localStorage
    if (!token) {
      token =
        localStorage.getItem("futurefind_token") ||
        localStorage.getItem("authToken") ||
        undefined;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Save user answer (returns {success, data} format)
  static async saveUserAnswer(
    answerData: {
      mockIdRef: string;
      question: string;
      correct_ans: string;
      user_ans: string;
      feedback: string;
      rating: number;
      userId: string;
      confidence?: number;
      areas?: string[];
      answerLength?: number;
      relevanceScore?: number;
      timestamp?: Date;
    },
    token?: string
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    const endpoint = `${API_BASE_URL}/user-answers`;
    const config: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(answerData),
    };

    // Use token from parameter or fallback to localStorage
    if (!token) {
      token =
        localStorage.getItem("futurefind_token") ||
        localStorage.getItem("authToken") ||
        undefined;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Utility function to ensure Flask backend is awake
export const ensureFlaskAwake = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.warn("Flask backend is not responding:", error);
    return false;
  }
};

// Default export for convenience
export default {
  FLASK_BASE_URL,
  API_BASE_URL,
  FLASK_ENDPOINTS,
  API_ENDPOINTS,
  ApiClient,
  ensureFlaskAwake,
};
