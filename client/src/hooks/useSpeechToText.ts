import { useState, useEffect, useCallback } from 'react';

export interface ResultType {
  transcript: string;
  confidence: number;
}

interface UseSpeechToTextOptions {
  continuous?: boolean;
  useLegacyResults?: boolean;
}

interface UseSpeechToTextReturn {
  isRecording: boolean;
  results: ResultType[];
  interimResult: string | null;
  startSpeechToText: () => void;
  stopSpeechToText: () => void;
  resetTranscript: () => void;
}

export const useSpeechToText = (options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<ResultType[]>([]);
  const [interimResult, setInterimResult] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = options.continuous || false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsRecording(true);
        setInterimResult(null);
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setResults(prev => [...prev, { transcript, confidence }]);
          } else {
            interimTranscript += transcript;
          }
        }

        setInterimResult(interimTranscript || null);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [options.continuous]);

  const startSpeechToText = useCallback(() => {
    if (recognition) {
      recognition.start();
    } else {
      console.error('Speech recognition not supported');
    }
  }, [recognition]);

  const stopSpeechToText = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setResults([]);
    setInterimResult(null);
  }, []);

  return {
    isRecording,
    results,
    interimResult,
    startSpeechToText,
    stopSpeechToText,
    resetTranscript,
  };
};

export default useSpeechToText;
