
import { useState } from 'react';
import { useInterview, FeedbackData } from '../../contexts/InterviewContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const SummaryReport = () => {
  const { questions, responses, feedback, duration, resetInterview } = useInterview();
  
  // Calculate overall score
  const overallScore = feedback.length
    ? Math.round((feedback.reduce((sum, item) => sum + item.score, 0) / feedback.length) * 10) / 10
    : 0;
  
  // Format duration time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get all unique strengths and improvement areas
  const allStrengths = feedback.flatMap(item => item.strengths);
  const allImprovements = feedback.flatMap(item => item.improvements);
  
  // Count occurrences to find most common themes
  const strengthCounts = allStrengths.reduce((acc, strength) => {
    acc[strength] = (acc[strength] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const improvementCounts = allImprovements.reduce((acc, improvement) => {
    acc[improvement] = (acc[improvement] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top strengths and improvements
  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([strength]) => strength);
    
  const topImprovements = Object.entries(improvementCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([improvement]) => improvement);
  
  // Handle print/save as PDF
  const handlePrint = () => {
    window.print();
  };
  
  // Handle restart
  const handleRestart = () => {
    resetInterview();
  };
  
  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in print:p-8">
      <Card className="p-6 shadow-lg mb-8 print:shadow-none">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-interview-primary mb-2">Interview Summary Report</h1>
          <p className="text-interview-muted">
            Duration: {formatTime(duration)} | Questions: {questions.length} | Overall Score: {overallScore}/5
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-interview-primary">Key Strengths</h2>
            <ul className="space-y-2">
              {topStrengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 text-green-800 h-6 w-6 text-sm font-medium mr-2">
                    +
                  </span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-interview-primary">Areas for Improvement</h2>
            <ul className="space-y-2">
              {topImprovements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 h-6 w-6 text-sm font-medium mr-2">
                    !
                  </span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-interview-primary mb-4">Question Details</h2>
          <Accordion type="multiple" className="w-full">
            {questions.map((question, index) => {
              const response = responses.find(r => r.questionId === question.id);
              const feedbackItem = feedback.find(f => f.questionId === question.id);
              
              return (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center">
                      <span className="mr-2">Question {index + 1}:</span>
                      <span className="font-normal truncate max-w-[400px]">
                        {question.question}
                      </span>
                      {feedbackItem && (
                        <span className="ml-auto text-sm text-interview-muted whitespace-nowrap">
                          Score: {feedbackItem.score}/5
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                      <div>
                        <h4 className="font-medium text-interview-primary">Your Answer:</h4>
                        <p className="text-sm mt-1">{response?.transcription || "No answer recorded"}</p>
                        {response?.textInput && (
                          <p className="text-sm mt-1"><strong>Written:</strong> {response.textInput}</p>
                        )}
                      </div>
                      
                      {feedbackItem && (
                        <div>
                          <h4 className="font-medium text-interview-primary mt-2">Feedback:</h4>
                          <p className="text-sm mt-1">{feedbackItem.overallFeedback}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <h5 className="text-sm font-medium">Strengths:</h5>
                              <ul className="text-xs list-disc pl-4 mt-1">
                                {feedbackItem.strengths.map((strength, i) => (
                                  <li key={i}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium">Improvements:</h5>
                              <ul className="text-xs list-disc pl-4 mt-1">
                                {feedbackItem.improvements.map((improvement, i) => (
                                  <li key={i}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center print:hidden">
          <Button 
            variant="outline" 
            onClick={handleRestart}
          >
            Start New Interview
          </Button>
          
          <Button 
            className="bg-interview-primary hover:bg-interview-primary/90"
            onClick={handlePrint}
          >
            Save as PDF / Print
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SummaryReport;
