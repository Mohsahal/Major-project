import { QuestionData, FeedbackData } from '../contexts/InterviewContext';

// Technical Interview Questions
export const technicalQuestions: QuestionData[] = [
  {
    id: 1,
    question: "Can you explain the difference between let, const, and var in JavaScript?",
    category: "JavaScript Fundamentals",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "What are React hooks and how do they improve component development?",
    category: "React",
    difficulty: "medium"
  },
  {
    id: 3,
    question: "Explain the concept of closures in JavaScript with an example.",
    category: "JavaScript Advanced",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "How would you optimize the performance of a React application?",
    category: "React Performance",
    difficulty: "hard"
  },
  {
    id: 5,
    question: "Describe how you would implement authentication in a web application.",
    category: "Web Security",
    difficulty: "medium"
  }
];

// HR Interview Questions
export const hrQuestions: QuestionData[] = [
  {
    id: 1,
    question: "Tell me about yourself and your background.",
    category: "Introduction",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "Why are you interested in joining our company?",
    category: "Motivation",
    difficulty: "medium"
  },
  {
    id: 3,
    question: "Where do you see yourself professionally in five years?",
    category: "Career Goals",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "What are your salary expectations for this position?",
    category: "Compensation",
    difficulty: "medium"
  },
  {
    id: 5,
    question: "Do you have any questions for us about the company or role?",
    category: "Questions",
    difficulty: "easy"
  }
];

// Behavioral Interview Questions
export const behavioralQuestions: QuestionData[] = [
  {
    id: 1,
    question: "Tell me about a time when you faced a significant challenge at work and how you overcame it.",
    category: "Problem Solving",
    difficulty: "medium"
  },
  {
    id: 2,
    question: "Describe a situation where you had to work with a difficult team member or manager.",
    category: "Teamwork",
    difficulty: "medium"
  },
  {
    id: 3,
    question: "Give an example of a time when you had to meet a tight deadline.",
    category: "Time Management",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "Describe a project where you demonstrated leadership skills.",
    category: "Leadership",
    difficulty: "hard"
  },
  {
    id: 5,
    question: "Tell me about a time when you had to learn something new in a short period.",
    category: "Adaptability",
    difficulty: "medium"
  }
];

// Custom Interview Questions (placeholder for user-defined questions)
export const customQuestions: QuestionData[] = [
  {
    id: 1,
    question: "What makes you unique and how does it relate to this position?",
    category: "Custom",
    difficulty: "medium"
  },
  {
    id: 2,
    question: "How do you approach learning new technologies or methodologies?",
    category: "Custom",
    difficulty: "medium"
  },
  {
    id: 3,
    question: "Describe your ideal work environment.",
    category: "Custom",
    difficulty: "easy"
  },
  {
    id: 4,
    question: "What is your approach to giving and receiving feedback?",
    category: "Custom",
    difficulty: "medium"
  },
  {
    id: 5,
    question: "How do you balance multiple priorities and responsibilities?",
    category: "Custom",
    difficulty: "medium"
  }
];

// Get questions based on interview type
export const getQuestionsByType = (type: string): QuestionData[] => {
  switch (type) {
    case 'technical':
      return [...technicalQuestions];
    case 'hr':
      return [...hrQuestions];
    case 'behavioral':
      return [...behavioralQuestions];
    case 'custom':
      return [...customQuestions];
    default:
      return [...technicalQuestions];
  }
};

// Generate mock feedback based on a transcript
export const generateMockFeedback = (questionId: number, transcript: string): FeedbackData => {
  const wordCount = transcript.split(' ').length;
  let score = 3; // Default medium score
  
  // Simple scoring based on answer length
  if (wordCount < 10) {
    score = 1; // Too short
  } else if (wordCount > 50) {
    score = 4; // Good length
  } else if (wordCount > 100) {
    score = 5; // Excellent length
  }
  
  const strengths = [
    "Good articulation of ideas",
    "Clear structure to your answer",
    "Used specific examples to illustrate points",
    "Demonstrated good technical knowledge",
    "Showed good problem-solving approach"
  ];
  
  const improvements = [
    "Consider providing more specific examples",
    "Try to be more concise in your explanation",
    "Remember to address all parts of the question",
    "Could include more technical details",
    "Consider adding more context to your examples"
  ];
  
  const overallFeedback = `Your answer was ${
    score >= 4 ? 'strong' : score >= 3 ? 'good' : 'satisfactory'
  }. ${
    score >= 4 
      ? 'You demonstrated good knowledge and communication skills.' 
      : 'There is room for improvement in how you structure your responses.'
  }`;
  
  return {
    questionId,
    score,
    strengths: strengths.slice(0, score),
    improvements: improvements.slice(0, 6 - score),
    overallFeedback
  };
};



  
