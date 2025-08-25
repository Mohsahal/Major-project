

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: string | Date;
  updateAt: string | Date;
}

export interface Interview {
  id: string;
  position: string;
  description: string;
  experience: number;
  userId: string;
  techStack: string;
  questions: { question: string; answer: string }[];
  createdAt: string | Date;
  updatedAt: string | Date;
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
  answerLength?: number;
  relevanceScore?: number;
  timestamp?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}
