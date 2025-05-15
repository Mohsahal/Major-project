
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface FeedbackData {
  communication: number;
  relevance: number;
  technical: number;
  strengths: string[];
  improvements: string[];
}

interface FeedbackPanelProps {
  feedback: FeedbackData | null;
  responseSubmitted: boolean;
}

const FeedbackPanel = ({ feedback, responseSubmitted }: FeedbackPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Feedback</CardTitle>
        <CardDescription>Real-time AI analysis of your responses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback ? (
          <>
            <div className="border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-1 text-sm">Communication Skills</h3>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${feedback.communication}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {feedback.communication > 80 ? "Excellent clarity and articulation" : 
                 feedback.communication > 70 ? "Good communication skills" : 
                 "Room for improvement in communication"}
              </p>
            </div>
            
            <div className="border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-1 text-sm">Relevance to Question</h3>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${feedback.relevance}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {feedback.relevance > 80 ? "Highly relevant response" : 
                 feedback.relevance > 70 ? "Mostly on-topic" : 
                 "Try to be more specific to the question"}
              </p>
            </div>
            
            <div className="border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-1 text-sm">Technical Accuracy</h3>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${feedback.technical}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {feedback.technical > 80 ? "Excellent technical knowledge" : 
                 feedback.technical > 70 ? "Good technical understanding" : 
                 "Consider deepening technical knowledge"}
              </p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Strengths:</h3>
              <ul className="space-y-1 text-sm">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Areas for Improvement:</h3>
              <ul className="space-y-1 text-sm">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {responseSubmitted ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Analyzing your response...</p>
              </div>
            ) : (
              <p>Submit your response to receive feedback</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackPanel;
