// API Configuration
export const FLASK_BASE_URL = import.meta.env.VITE_FLASK_BASE_URL || "http://localhost:2000";
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:1000/api";
// Flask endpoints
export const FLASK_ENDPOINTS = {
    SKILL_GAP_ANALYSIS: `${FLASK_BASE_URL}/skill-gap-analysis`,
    JOB_RECOMMENDATIONS: `${FLASK_BASE_URL}/job-recommendations`,
    RESUME_ANALYSIS: `${FLASK_BASE_URL}/resume-analysis`,
    JOBS: `${FLASK_BASE_URL}/jobs`,
    UPLOAD_RESUME: `${FLASK_BASE_URL}/upload-resume`,
};
// API endpoints for Node.js backend
export const API_ENDPOINTS = {
    // Direct endpoints (for backward compatibility with AuthContext)
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/signup`,
    PROFILE_ME: `${API_BASE_URL}/auth/me`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google-login`,
    GOOGLE_SIGNUP: `${API_BASE_URL}/auth/google-signup`,
    RESUMES: `${API_BASE_URL}/resume`,
    RESUME_BY_ID: (id) => `${API_BASE_URL}/resume/${id}`,
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
        GET_BY_INTERVIEW: (interviewId) => `${API_BASE_URL}/questions/interview/${interviewId}`,
    },
    FEEDBACK: {
        SUBMIT: `${API_BASE_URL}/feedback`,
        GET_BY_INTERVIEW: (interviewId) => `${API_BASE_URL}/feedback/interview/${interviewId}`,
    },
    AI: {
        GENERATE_SUMMARY: `${API_BASE_URL}/ai/generate-summary`,
        GENERATE_EXPERIENCE: `${API_BASE_URL}/ai/generate-experience`,
        GENERATE_PROJECT: `${API_BASE_URL}/ai/generate-project`,
    },
};
// API Client class for making requests
export class ApiClient {
    static baseUrl = API_BASE_URL;
    static async request(endpoint, options = {}) {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        };
        // Add auth token if available (prefer AuthContext key, fallback to legacy key)
        const token = localStorage.getItem("futurefind_token") ||
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
            return response.text();
        }
        catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }
    static async get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    }
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }
    static async delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }
    // Interview-specific methods
    static async createInterview(interview) {
        return this.post(`${API_BASE_URL}/interviews`, interview);
    }
    static async getInterviews() {
        return this.get(`${API_BASE_URL}/interviews`);
    }
    static async getInterview(id) {
        return this.get(`${API_BASE_URL}/interviews/${id}`);
    }
    static async updateInterview(id, interview) {
        return this.put(`${API_BASE_URL}/interviews/${id}`, interview);
    }
    static async deleteInterview(id) {
        return this.delete(`${API_BASE_URL}/interviews/${id}`);
    }
    // Get interview by ID (returns {success, data} format)
    static async getInterviewById(id, token) {
        const endpoint = `${API_BASE_URL}/interviews/${id}`;
        const config = {
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
        }
        catch (error) {
            console.error("API request failed:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    // Get user answers by interview ID (returns {success, data} format)
    static async getUserAnswersByInterview(interviewId, token) {
        const endpoint = `${API_BASE_URL}/user-answers/interview/${interviewId}`;
        const config = {
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
        }
        catch (error) {
            console.error("API request failed:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    // Save user answer (returns {success, data} format)
    static async saveUserAnswer(answerData, token) {
        const endpoint = `${API_BASE_URL}/user-answers`;
        const config = {
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
        }
        catch (error) {
            console.error("API request failed:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
/** Submit resume via form (FormData) for AI job recommendations. Server handles Gemini/ML. */
export const submitResumeForJobs = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("provider", "all");
  formData.append("only_provider", "false");

  const res = await fetch(FLASK_ENDPOINTS.UPLOAD_RESUME, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type");
  if (!ct?.includes("application/json")) {
    throw new Error("Invalid response format");
  }
  return res.json();
};

// Utility function to ensure Flask backend is awake
export const ensureFlaskAwake = async () => {
    try {
        const response = await fetch(`${FLASK_BASE_URL}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.ok;
    }
    catch (error) {
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
    submitResumeForJobs,
};
