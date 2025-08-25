import React, { createContext, useContext, useState, ReactNode } from 'react';

export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'custom';
export type InterviewMode = 'voice' | 'hybrid';
export type InterviewStatus = 'setup' | 'ongoing' | 'completed';

export interface QuestionData {
  id: number;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserResponse {
  questionId: number;
  transcription: string;
  textInput?: string;
  startTime: Date;
  endTime: Date;
}

export interface FeedbackData {
  questionId: number;
  score: number;
  strengths: string[];
  improvements: string[];
  overallFeedback: string;
}

interface InterviewContextType {
  // Configuration
  interviewType: InterviewType;
  setInterviewType: (type: InterviewType) => void;
  role: string;
  setRole: (role: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  interviewMode: InterviewMode;
  setInterviewMode: (mode: InterviewMode) => void;
  
  // Status
  status: InterviewStatus;
  setStatus: (status: InterviewStatus) => void;
  
  // Questions and responses
  questions: QuestionData[];
  setQuestions: (questions: QuestionData[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  responses: UserResponse[];
  addResponse: (response: UserResponse) => void;
  updateResponse: (questionId: number, data: Partial<UserResponse>) => void;
  
  // Feedback
  feedback: FeedbackData[];
  addFeedback: (feedback: FeedbackData) => void;
  
  // Audio settings
  ambianceVolume: number;
  setAmbianceVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  
  // Timer
  duration: number;
  setDuration: (duration: number) => void;
  
  // Reset interview
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};

interface InterviewProviderProps {
  children: ReactNode;
}

export const InterviewProvider: React.FC<InterviewProviderProps> = ({ children }) => {
  // Configuration
  const [interviewType, setInterviewType] = useState<InterviewType>('technical');
  const [role, setRole] = useState<string>('Frontend Developer');
  const [language, setLanguage] = useState<string>('English');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('voice');
  
  // Status
  const [status, setStatus] = useState<InterviewStatus>('setup');
  
  // Questions and responses
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<UserResponse[]>([]);
  
  // Feedback
  const [feedback, setFeedback] = useState<FeedbackData[]>([]);
  
  // Audio settings
  const [ambianceVolume, setAmbianceVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Timer
  const [duration, setDuration] = useState<number>(0);
  
  const addResponse = (response: UserResponse) => {
    setResponses(prev => [...prev, response]);
  };
  
  const updateResponse = (questionId: number, data: Partial<UserResponse>) => {
    setResponses(prev => prev.map(response => 
      response.questionId === questionId ? { ...response, ...data } : response
    ));
  };
  
  const addFeedback = (feedbackData: FeedbackData) => {
    setFeedback(prev => [...prev, feedbackData]);
  };
  
  const resetInterview = () => {
    setStatus('setup');
    setCurrentQuestionIndex(0);
    setResponses([]);
    setFeedback([]);
    setDuration(0);
  };
  
  const value = {
    interviewType,
    setInterviewType,
    role,
    setRole,
    language,
    setLanguage,
    interviewMode,
    setInterviewMode,
    status,
    setStatus,
    questions,
    setQuestions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    responses,
    addResponse,
    updateResponse,
    feedback,
    addFeedback,
    ambianceVolume,
    setAmbianceVolume,
    isMuted,
    setIsMuted,
    duration,
    setDuration,
    resetInterview
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
