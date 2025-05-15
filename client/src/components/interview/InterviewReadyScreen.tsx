
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Volume, Headphones, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewReadyScreenProps {
  jobRole: string;
  interviewType: string;
  duration: string;
  onBegin: () => void;
  onBack: () => void;
}

const InterviewReadyScreen = ({
  jobRole,
  interviewType,
  duration,
  onBegin,
  onBack
}: InterviewReadyScreenProps) => {
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [audioOutputPermission, setAudioOutputPermission] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isRecognitionSupported, setIsRecognitionSupported] = useState<boolean | null>(null);

  // Check for microphone, audio output permissions, and speech recognition support
  const checkAudioPermissions = async () => {
    setIsChecking(true);
    
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsRecognitionSupported(!!SpeechRecognition);
    
    try {
      // Check microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      
      // Close the stream after checking
      stream.getTracks().forEach(track => track.stop());
      
      // Check audio output (can only verify if audio API is available)
      if ('AudioContext' in window) {
        setAudioOutputPermission(true);
      } else {
        setAudioOutputPermission(false);
      }
      
      toast.success("Audio permissions granted!");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMicPermission(false);
      toast.error("Microphone access denied. Please allow microphone access to proceed.");
    } finally {
      setIsChecking(false);
    }
  };
  
  // Check permissions when component mounts
  useEffect(() => {
    checkAudioPermissions();
  }, []);
  
  // Test the audio output
  const testAudioOutput = () => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      toast.error("Speech synthesis not supported by your browser");
      return;
    }
    
    // Simple test message
    const utterance = new SpeechSynthesisUtterance("This is a test of your audio output. If you can hear this, your speakers are working.");
    
    utterance.onstart = () => toast.info("Playing test audio...");
    utterance.onend = () => toast.success("Audio test complete!");
    utterance.onerror = () => toast.error("Audio test failed");
    
    synth.speak(utterance);
  };

  // Test voice recognition
  const testVoiceRecognition = () => {
    if (!isRecognitionSupported) {
      toast.error("Speech recognition is not supported in your browser. Try using Chrome.");
      return;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      toast.info("Please speak a test phrase...");
      
      recognition.start();
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        toast.success(`Recognized: "${transcript}"`);
      };
      
      recognition.onerror = (event) => {
        toast.error(`Error during recognition test: ${event.error}`);
      };
      
      recognition.onend = () => {
        console.log("Speech recognition test ended");
      };
    } catch (error) {
      console.error("Error testing speech recognition:", error);
      toast.error("Could not test voice recognition");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-3">Ready to Begin Your Interview</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Your AI interviewer is prepared to conduct a {duration}-minute {interviewType} interview for the {jobRole} position.
        </p>
      </div>
      
      {(micPermission === false || audioOutputPermission === false) && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Voice interview requires both microphone and audio output permissions.
            Please grant access to continue.
          </AlertDescription>
        </Alert>
      )}
      
      {!isRecognitionSupported && micPermission !== null && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Speech recognition is not supported in your browser. The interview will use a simulated response mode.
            For the best experience, try using Google Chrome.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-8">
        <CardContent className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 ${micPermission === true ? 'bg-green-100 dark:bg-green-900' : micPermission === false ? 'bg-red-100 dark:bg-red-900' : 'bg-brand-50 dark:bg-gray-800'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Mic className={`h-8 w-8 ${micPermission === true ? 'text-green-600 dark:text-green-400' : micPermission === false ? 'text-red-600 dark:text-red-400' : 'text-brand-600 dark:text-brand-400'}`} />
              </div>
              <h3 className="font-medium mb-1">Microphone Check</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {micPermission === true 
                  ? "Microphone is working properly" 
                  : micPermission === false 
                    ? "Microphone access denied" 
                    : "Checking microphone..."}
              </p>
              {micPermission === false && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={checkAudioPermissions}
                  disabled={isChecking}
                >
                  Retry
                </Button>
              )}
              
              {micPermission === true && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={testVoiceRecognition}
                >
                  Test Voice Recognition
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 ${audioOutputPermission === true ? 'bg-green-100 dark:bg-green-900' : audioOutputPermission === false ? 'bg-red-100 dark:bg-red-900' : 'bg-brand-50 dark:bg-gray-800'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <Volume className={`h-8 w-8 ${audioOutputPermission === true ? 'text-green-600 dark:text-green-400' : audioOutputPermission === false ? 'text-red-600 dark:text-red-400' : 'text-brand-600 dark:text-brand-400'}`} />
              </div>
              <h3 className="font-medium mb-1">Audio Output</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {audioOutputPermission === true 
                  ? "Audio output is available" 
                  : audioOutputPermission === false 
                    ? "Audio output not available" 
                    : "Checking audio output..."}
              </p>
              {audioOutputPermission === true && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={testAudioOutput}
                >
                  Test Audio
                </Button>
              )}
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Headphones className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-medium mb-1">Best Experience</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use headphones for the best interview experience</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline"
          onClick={onBack}
          className="order-2 sm:order-1"
        >
          Back to Settings
        </Button>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 order-1 sm:order-2"
          onClick={onBegin}
          disabled={micPermission !== true || audioOutputPermission !== true}
        >
          Begin Voice Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewReadyScreen;
