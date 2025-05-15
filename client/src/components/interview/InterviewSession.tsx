import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Volume, VolumeX, Settings, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import FeedbackPanel from './FeedbackPanel';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

interface InterviewSessionProps {
  jobRole: string;
  interviewType: string;
  duration: number;
  onEndInterview: () => void;
}

// Helper to shuffle array for random selection
const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const InterviewSession = ({ 
  jobRole, 
  interviewType, 
  duration,
  onEndInterview
}: InterviewSessionProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<null | {
    communication: number;
    relevance: number;
    technical: number;
    strengths: string[];
    improvements: string[];
  }>(null);

  // Use our enhanced speech recognition hook with advanced NLP processing
  const {
    transcript: currentResponse,
    isRecording,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported: isRecognitionSupported
  } = useSpeechRecognition({
    language: 'en-US',
    enhancedProcessing: true,
    onError: (error) => toast.error(`Microphone error: ${error}`)
  });

  // Speech synthesis
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Sample questions based on interview type - keep current questions
  const technicalQuestions = [
    `Tell me about your experience with modern front-end frameworks for this ${jobRole} position.`,
    'How would you optimize a web application for performance?',
    'Explain how you would implement a secure authentication system.'
  ];
  
  const behavioralQuestions = [
    `Tell me about a time you demonstrated leadership in a previous role relevant to ${jobRole}.`,
    'Describe a challenging project you worked on and how you overcame obstacles.',
    'Where do you see yourself in 5 years?'
  ];
  
  const questions = interviewType === 'technical' ? technicalQuestions : behavioralQuestions;

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (!isPaused && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPaused, timeRemaining]);

  // Speech synthesis for questions with improved voices
  useEffect(() => {
    if (!synth) return;
    
    // Cancel any ongoing speech when component unmounts
    return () => {
      if (synth.speaking) synth.cancel();
    };
  }, [synth]);

  // Function to speak the current question with better voice
  const speakQuestion = () => {
    if (!synth) {
      toast.error("Speech synthesis not supported by your browser");
      return;
    }
    
    // Cancel any ongoing speech
    if (synth.speaking) synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(questions[currentQuestion]);
    speechRef.current = utterance;
    
    // Set a more natural speaking rate
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Natural pitch
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Automatically start recording when question finishes
      setTimeout(() => {
        console.log("Starting recording after question");
        startRecording();
      }, 500);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      toast.error("Error speaking question");
      setIsSpeaking(false);
    };
    
    // Get available voices and use a more natural one if available
    const voices = synth.getVoices();
    if (voices.length > 0) {
      // Try to find a good English voice
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || 
         voice.name.includes('Natural') || 
         voice.name.includes('Premium'))
      );
      utterance.voice = preferredVoice || voices[0];
      console.log("Using voice:", utterance.voice?.name);
    }
    
    synth.speak(utterance);
  };
  
  // Fallback for browsers that don't support SpeechRecognition
  const simulateRecording = () => {
    toast.info("Recording simulated... (Speech recognition not available)");
    
    // Simulate recording for a few seconds
    setTimeout(() => {
      resetTranscript();
      toast.info("Recording completed (simulated)");
    }, 5000);
  };
  
  // Handle next/previous question navigation
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      stopRecording();
      setCurrentQuestion(curr => curr + 1);
      setResponseSubmitted(false);
      resetTranscript();
      setFeedback(null);
      
      // Automatically speak the next question
      setTimeout(speakQuestion, 500);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      stopRecording();
      setCurrentQuestion(curr => curr - 1);
      setResponseSubmitted(false);
      resetTranscript();
      setFeedback(null);
      
      // Automatically speak the previous question
      setTimeout(speakQuestion, 500);
    }
  };
  
  // Mock feedback generators with improved analytics
  const generateMockFeedback = () => {
    // Random feedback scores between 60-95%
    const communication = Math.floor(Math.random() * 35) + 60;
    const relevance = Math.floor(Math.random() * 35) + 60;
    const technical = Math.floor(Math.random() * 35) + 60;
    
    // Predefined feedback points
    const strengthOptions = [
      "Strong introduction and good examples provided",
      "Clear articulation of technical concepts",
      "Good use of the STAR method in your response",
      "Effective communication of past experiences",
      "Well-structured answer with logical flow"
    ];
    
    const improvementOptions = [
      "Consider using more specific metrics when discussing results",
      "Your response could benefit from using the STAR method more clearly",
      "Try to be more specific to the question asked",
      "Consider providing more concrete examples",
      "Focus on highlighting your direct contributions to outcomes"
    ];
    
    // Pick 2-3 random strengths and improvements
    const strengths = shuffleArray(strengthOptions).slice(0, 2 + Math.floor(Math.random() * 2));
    const improvements = shuffleArray(improvementOptions).slice(0, 2 + Math.floor(Math.random() * 2));
    
    return {
      communication,
      relevance,
      technical,
      strengths,
      improvements
    };
  };
  
  // Submit response for feedback with improved NLP processing
  const handleSubmitResponse = () => {
    // Stop any ongoing recording
    stopRecording();
    
    if (currentResponse.trim().length < 10) {
      toast.error("Please provide a more detailed response");
      return;
    }
    
    setResponseSubmitted(true);
    setFeedback(generateMockFeedback());
    toast.success("Response submitted for evaluation");
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
    
    if (!isPaused) {
      // Pausing
      if (synth && synth.speaking) synth.pause();
      if (isRecording) stopRecording();
    } else {
      // Resuming
      if (synth && speechRef.current) synth.resume();
    }
    
    toast(isPaused ? "Interview resumed" : "Interview paused");
  };

  // Start the first question automatically when the component mounts
  useEffect(() => {
    // Short delay to ensure components are fully loaded
    setTimeout(speakQuestion, 1000);
  }, []);
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="w-full md:w-3/5">
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-900 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* This would be replaced with actual video feed */}
                  <div className="text-white text-center">
                    <Volume className={`w-16 h-16 mx-auto mb-3 opacity-30 ${isSpeaking ? 'text-green-400' : ''}`} />
                    <p className="text-lg opacity-50">
                      {isSpeaking 
                        ? "AI interviewer is speaking..." 
                        : isRecording 
                          ? "Listening to your response..." 
                          : "Your camera feed will appear here"}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`bg-gray-800/50 hover:bg-gray-800 text-white border-gray-700 ${isRecording ? 'bg-red-900/70' : ''}`}
                    onClick={() => isRecording ? stopRecording() : startRecording()}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className={`bg-gray-800/50 hover:bg-gray-800 text-white border-gray-700 ${isSpeaking ? 'bg-green-900/70' : ''}`}
                    onClick={() => {
                      if (synth) {
                        synth.speaking ? synth.cancel() : speakQuestion();
                      }
                    }}
                  >
                    {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-gray-800/50 hover:bg-gray-800 text-white border-gray-700"
                    onClick={togglePause}
                  >
                    {isPaused ? 
                      <PlayCircle className="h-4 w-4 text-green-500" /> : 
                      <PauseCircle className="h-4 w-4" />
                    }
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-gray-800/50 hover:bg-gray-800 text-white border-gray-700"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="absolute bottom-4 left-4 bg-gray-800/50 text-white text-sm px-3 py-1 rounded-full flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold text-lg">Current Question</h2>
                  <span className="text-sm text-gray-500">Question {currentQuestion + 1} of {questions.length}</span>
                </div>
                <p className="text-lg mb-4">{questions[currentQuestion]}</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="response">Your Response:</Label>
                    {isRecording && (
                      <span className="text-sm text-red-500 flex items-center gap-1">
                        <span className="animate-pulse">●</span> Recording...
                      </span>
                    )}
                  </div>
                  
                  <textarea 
                    id="response"
                    className="w-full min-h-[120px] p-3 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your voice response will appear here after speaking..."
                    value={currentResponse}
                    onChange={(e) => resetTranscript()}
                    disabled={isRecording}
                  />
                  
                  {!responseSubmitted ? (
                    <div className="flex gap-3">
                      <Button
                        onClick={startRecording}
                        className="flex-1"
                        variant="outline"
                        disabled={isRecording}
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        {currentResponse ? 'Re-record Response' : 'Record Response'}
                      </Button>
                      <Button 
                        onClick={handleSubmitResponse} 
                        className="flex-1"
                        disabled={currentResponse.trim().length < 10 || isRecording}
                      >
                        Submit Response
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              disabled={currentQuestion === 0}
              onClick={handlePreviousQuestion}
            >
              Previous Question
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
            >
              Next Question
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-2/5">
          <FeedbackPanel 
            feedback={feedback} 
            responseSubmitted={responseSubmitted} 
          />
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="destructive"
              onClick={() => {
                toast.success('Interview completed! Generating comprehensive feedback...');
                onEndInterview();
              }}
            >
              End Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
