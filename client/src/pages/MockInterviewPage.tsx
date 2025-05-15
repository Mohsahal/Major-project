
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import InterviewSetupForm from '@/components/interview/InterviewSetupForm';
import InterviewReadyScreen from '@/components/interview/InterviewReadyScreen';
import InterviewSession from '@/components/interview/InterviewSession';

const MockInterviewPage = () => {
  const [step, setStep] = useState<'settings' | 'ready' | 'interview'>('settings');
  const [jobRole, setJobRole] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [duration, setDuration] = useState('15');
  
  // Check browser compatibility on mount
  useEffect(() => {
    const checkSpeechSupport = () => {
      const isSpeechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      const isSpeechSynthesisSupported = 'speechSynthesis' in window;
      
      if (!isSpeechRecognitionSupported) {
        toast.warning("Your browser doesn't fully support speech recognition. For the best experience, try Chrome browser.");
      }
      
      if (!isSpeechSynthesisSupported) {
        toast.warning("Your browser doesn't support text-to-speech. Some interview features may be limited.");
      }
      
      // Return true if at least one is supported
      return isSpeechRecognitionSupported || isSpeechSynthesisSupported;
    };
    
    checkSpeechSupport();
  }, []);
  
  const renderStepContent = () => {
    switch (step) {
      case 'settings':
        return (
          <InterviewSetupForm 
            jobRole={jobRole}
            setJobRole={setJobRole}
            interviewType={interviewType}
            setInterviewType={setInterviewType}
            duration={duration}
            setDuration={setDuration}
            onComplete={() => setStep('ready')}
          />
        );
      case 'ready':
        return (
          <InterviewReadyScreen
            jobRole={jobRole}
            interviewType={interviewType}
            duration={duration}
            onBegin={() => setStep('interview')}
            onBack={() => setStep('settings')}
          />
        );
      case 'interview':
        return (
          <InterviewSession 
            jobRole={jobRole} 
            interviewType={interviewType} 
            duration={parseInt(duration)} 
            onEndInterview={() => setStep('settings')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {renderStepContent()}
    </div>
  );
};

export default MockInterviewPage;
