import { useState, useEffect, useRef } from 'react';
import { useInterview, QuestionData, UserResponse, FeedbackData } from '../../contexts/InterviewContext';
import useVoiceRecognition from '../../hooks/useSpeechRecognition'
import { generateMockFeedback } from '../../utils/mockQuestions';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Play, ArrowRight, CheckCircle2 } from "lucide-react";
import WaveformVisualizer from '@/components/Mockinterview/WaveformVisualizationt'
import { motion, AnimatePresence } from 'framer-motion';

import ProgressTracker from './ProgressTracker';
import FeedbackPanel from './FeedbackPanel';

const InterviewInterface = () => {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    interviewMode,
    responses,
    addResponse,
    addFeedback,
    feedback,
    ambianceVolume,
    setAmbianceVolume,
    isMuted,
    setIsMuted,
    duration,
    setDuration,
    status,
    setStatus
  } = useInterview();

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackData | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  const ambianceAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Voice recognition hook with fixed type handling
  const {
    transcript,
    interimTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error: recognitionError
  } = useVoiceRecognition({
    onStart: () => {
      console.log('Voice recognition started');
      setMicPermissionError(null);
    },
    onEnd: () => {
      console.log('Voice recognition ended');
      if (!transcript && !interimTranscript) {
        setMicPermissionError('No speech detected. Please check your microphone.');
      }
    },
    language: 'en-US'
  });

  // Add new state for microphone permission
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  // Check for browser support
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setMicPermissionError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Load current question
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      setCurrentQuestion(questions[currentQuestionIndex]);
      setTextInput('');
      resetTranscript();
      setShowFeedback(false);
    } else if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setInterviewCompleted(true);
    }
  }, [questions, currentQuestionIndex, resetTranscript]);

  // Start duration timer when interview begins
  useEffect(() => {
    if (status === 'ongoing' && !interviewCompleted) {
      durationTimerRef.current = setInterval(() => {
        setDuration(duration + 1);
      }, 1000);
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [status, interviewCompleted, setDuration, duration]);

  // Play background ambiance
  useEffect(() => {
    if (ambianceAudioRef.current) {
      ambianceAudioRef.current.volume = isMuted ? 0 : ambianceVolume;
      ambianceAudioRef.current.loop = true;

      if (status === 'ongoing' && !interviewCompleted) {
        ambianceAudioRef.current.play().catch(error => {
          console.error('Error playing ambiance audio:', error);
        });
      } else {
        ambianceAudioRef.current.pause();
      }
    }

    return () => {
      if (ambianceAudioRef.current) {
        ambianceAudioRef.current.pause();
      }
    };
  }, [status, interviewCompleted, isMuted, ambianceVolume]);

  // Speak the question using text-to-speech with female voice
  const speakQuestion = () => {
    if (!currentQuestion) return;

    const speechSynthesis = window.speechSynthesis;
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    
    // Set female voice
    const voices = speechSynthesis.getVoices();
    // Find a female voice - typically voices with names containing 'female' or common female names
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.toLowerCase().includes('alice') ||
      voice.name.toLowerCase().includes('sarah') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('samantha')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  // Update handleStartAnswering to handle microphone permissions
  const handleStartAnswering = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
      
      setIsAnswering(true);
      setStartTime(new Date());
      setMicPermissionError(null);
      resetTranscript(); // Reset transcript before starting
      startListening();
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermissionError('Please allow microphone access to start the interview');
      setIsAnswering(false);
    }
  };

  // Add effect to handle speech recognition errors
  useEffect(() => {
    if (recognitionError) {
      console.error('Speech recognition error:', recognitionError);
      setMicPermissionError(recognitionError);
      setIsAnswering(false);
    }
  }, [recognitionError]);

  // Add effect to handle transcript updates
  useEffect(() => {
    if (transcript || interimTranscript) {
      setMicPermissionError(null);
    }
  }, [transcript, interimTranscript]);

  // Submit the answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !startTime) return;
    
    const endTime = new Date();
    
    // Save the response
    const response: UserResponse = {
      questionId: currentQuestion.id,
      transcription: transcript,
      textInput: interviewMode === 'hybrid' ? textInput : undefined,
      startTime,
      endTime
    };
    addResponse(response);
    
    // Generate mock feedback
    const feedbackData = generateMockFeedback(
      currentQuestion.id, 
      interviewMode === 'hybrid' ? transcript + ' ' + textInput : transcript
    );
    
    const fullFeedback: FeedbackData = {
      questionId: currentQuestion.id,
      ...feedbackData
    };
    
    addFeedback(fullFeedback);
    setCurrentFeedback(fullFeedback);
    
    // Stop listening and show feedback
    if (isListening) {
      stopListening();
    }
    setIsAnswering(false);
    setShowFeedback(true);
  };

  // Move to the next question
  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setInterviewCompleted(true);
    }
  };

  // Complete the interview and show summary
  const handleCompleteInterview = () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    setStatus('completed');
  };

  // Start a new interview
  const handleRestart = () => {
    setStatus('setup');
  };

  if (interviewCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 max-w-3xl mx-auto bg-white shadow-lg border-none">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-4"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Interview Completed!</h2>
            <p className="text-gray-600 text-lg">
              You've successfully completed all {questions.length} questions. Great job!
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleRestart}
              className="px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Start New Interview
            </Button>
            <Button 
              variant="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2" 
              onClick={handleCompleteInterview}
            >
              View Summary Report
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (showFeedback && currentFeedback) {
    return <FeedbackPanel feedback={currentFeedback} onNext={handleNextQuestion} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto w-full px-4"
    >
      <div className="mb-8">
        <ProgressTracker />
      </div>

      <Card className="mb-8 border-none shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              {currentQuestion.category}
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Question {currentQuestionIndex + 1}
            </h3>
            <p className="text-lg text-gray-700 mb-4">{currentQuestion.question}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
              onClick={speakQuestion}
            >
              <Play className="w-4 h-4" />
              <span>Listen to Question</span>
            </Button>
          </div>
          
          <div className="space-y-6">
            {micPermissionError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
                {micPermissionError}
              </div>
            )}
            
            {recognitionError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-4">
                {recognitionError}
              </div>
            )}
            
            <div className="p-4 bg-gray-50 rounded-xl">
              <WaveformVisualizer isActive={isListening} />
            </div>
            
            <div>
              <div className="mb-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Your Answer</span>
                {isListening && (
                  <span className="text-sm text-green-600 flex items-center gap-2">
                    <Mic className="w-4 h-4 animate-pulse" />
                    Listening...
                  </span>
                )}
              </div>
              
              <div className="bg-white border rounded-xl p-4 min-h-[120px] mb-4 shadow-sm">
                {isAnswering ? (
                  <div>
                    <p className="text-gray-800">{transcript}</p>
                    <p className="text-gray-400 mt-2">{interimTranscript}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    {transcript || "Your answer will appear here..."}
                  </p>
                )}
              </div>
              
              {interviewMode === 'hybrid' && (
                <Textarea
                  placeholder="You can also type your answer here..."
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full mb-4 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              )}
              
              <div className="flex gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!isMuted}
                      onCheckedChange={checked => setIsMuted(!checked)}
                      id="mute-toggle"
                      className="data-[state=checked]:bg-indigo-600"
                    />
                    <Label htmlFor="mute-toggle" className="cursor-pointer">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Label>
                  </div>
                  
                  {!isMuted && (
                    <div className="flex items-center gap-2 w-32">
                      <Slider
                        value={[ambianceVolume * 100]}
                        onValueChange={values => setAmbianceVolume(values[0] / 100)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  {!isAnswering ? (
                    <Button
                      onClick={handleStartAnswering}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Answer</span>
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          stopListening();
                          setIsAnswering(false);
                        }}
                        className="px-6 py-2 rounded-lg flex items-center gap-2"
                      >
                        <MicOff className="w-4 h-4" />
                        <span>Cancel</span>
                      </Button>
                      
                      <Button
                        onClick={handleSubmitAnswer}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                      >
                        <span>Submit Answer</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <audio ref={ambianceAudioRef} preload="auto" className="hidden">
        <source src="/interview-ambiance.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </motion.div>
  );
};

export default InterviewInterface;
