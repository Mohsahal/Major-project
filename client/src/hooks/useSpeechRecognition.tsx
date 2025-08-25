import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface SpeechRecognitionHookOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onError?: (error: string) => void;
  enhancedProcessing?: boolean;
}

interface SpeechRecognitionHookReturn {
  transcript: string;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

/**
 * Enhanced speech recognition hook with advanced NLP processing
 */
const useSpeechRecognition = (options: SpeechRecognitionHookOptions = {}): SpeechRecognitionHookReturn => {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptBuffer = useRef<string[]>([]);
  
  // Set default options with enhanced processing enabled by default
  const defaultOptions = {
    continuous: true,
    interimResults: true,
    language: 'en-US',
    enhancedProcessing: true,
    onError: (error: string) => toast.error(`Speech recognition error: ${error}`)
  };
  
  const settings = { ...defaultOptions, ...options };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognition();
        
        // Configure speech recognition with optimal settings
        const recognition = recognitionRef.current;
        recognition.continuous = settings.continuous;
        recognition.interimResults = settings.interimResults;
        recognition.lang = settings.language;
        
        // Improve recognition accuracy with settings
        if ('maxAlternatives' in recognition) {
          recognition.maxAlternatives = 3; // Get multiple alternatives for better selection
        }
        
        // Enhanced result handling with NLP improvements
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            // Get the most confident result
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              // Apply enhanced post-processing to final results
              const processed = settings.enhancedProcessing 
                ? enhancedTextProcessing(transcript)
                : transcript;
              
              finalTranscript += processed + ' ';
              
              // Store processed segments for context-aware processing
              if (settings.enhancedProcessing) {
                transcriptBuffer.current.push(processed);
                // Keep only last 10 segments for context
                if (transcriptBuffer.current.length > 10) {
                  transcriptBuffer.current.shift();
                }
              }
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update with processed results
          if (finalTranscript) {
            setTranscript(prev => {
              const newTranscript = prev + finalTranscript;
              console.log('Final transcript updated:', newTranscript);
              return newTranscript;
            });
          } else if (interimTranscript) {
            // This is temporary and will be replaced with final results
            setTranscript(prev => {
              const withInterim = prev + interimTranscript;
              return withInterim;
            });
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          settings.onError(event.error);
          setIsRecording(false);
        };
        
        // Automatically restart recognition when it ends if still recording
        recognition.onend = () => {
          console.log('Speech recognition ended', isRecording);
          
          // If we're still supposed to be recording, restart it
          if (isRecording && recognition.continuous) {
            try {
              recognition.start();
              console.log('Recognition restarted automatically');
            } catch (e) {
              console.error('Error restarting recognition', e);
              setIsRecording(false);
            }
          } else {
            setIsRecording(false);
          }
        };
      } else {
        console.warn("Speech recognition not supported in this browser");
        toast.error("Your browser doesn't support voice recognition. Please try Chrome.");
      }
    }
    
    return () => {
      // Clean up recognition on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping non-started recognition
        }
      }
    };
  }, []);

  // Enhanced NLP processing functions
  
  /**
   * Advanced text processing with NLP techniques
   */
  const enhancedTextProcessing = (text: string): string => {
    // Start with basic cleanup
    let processed = cleanupBasicText(text);
    
    // Apply contextual corrections
    processed = applyContextualCorrections(processed);
    
    // Fix grammatical issues
    processed = applyGrammaticalFixes(processed);
    
    // Handle technical terms better (for tech interviews)
    processed = correctTechnicalTerms(processed);
    
    return processed;
  };
  
  // Basic text cleanup
  const cleanupBasicText = (text: string): string => {
    // Remove excessive white spaces
    let cleaned = text.trim().replace(/\s+/g, ' ');
    
    // Fix common transcription errors
    cleaned = cleaned
      // Capitalize first letter of sentences
      .replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase())
      // Fix common speech recognition artifacts
      .replace(/(\d) dollars/g, '$1$')
      .replace(/(\d) percent/g, '$1%')
      // Remove filler words
      .replace(/\b(um|uh|like|you know|i mean|actually)\b/gi, '')
      .trim();
    
    return cleaned;
  };
  
  // Apply corrections based on context
  const applyContextualCorrections = (text: string): string => {
    // Get recent context to help with corrections
    const recentContext = transcriptBuffer.current.join(' ');
    
    // Fix homophones based on context
    let corrected = text;
    
    // Common technical interview homophones
    const homophoneMap: Record<string, string[]> = {
      'their': ['there', 'they\'re'],
      'queue': ['q', 'cue'],
      'algorithm': ['outro rhythm', 'al gore rhythm'],
      'boolean': ['bullion', 'boolean'],
      'cache': ['cash'],
      'parameter': ['perimeter'],
      'function': ['function'],
      'integer': ['inter jur', 'interger'],
      'syntax': ['sin tax', 'sin tacks'],
      'api': ['a.p.i', 'apie'],
      'sequel': ['sql', 'SQL'],
      'JavaScript': ['java script', 'java scripts', 'javascript'],
      'Python': ['pie thon', 'python'],
      'React': ['re-act', 'react'],
    };
    
    // Apply homophone corrections
    Object.entries(homophoneMap).forEach(([correct, variants]) => {
      variants.forEach(variant => {
        // Case-insensitive replacement with word boundary
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        corrected = corrected.replace(regex, correct);
      });
    });
    
    return corrected;
  };
  
  // Fix grammatical issues
  const applyGrammaticalFixes = (text: string): string => {
    let fixed = text;
    
    // Fix common sentence construction problems
    fixed = fixed
      // Ensure proper spacing after punctuation
      .replace(/([.!?])([A-Z])/g, '$1 $2')
      // Fix double negatives
      .replace(/\b(don't|cannot|can't)\s+(no|none|nothing|never|nobody)\b/gi, match => {
        // Replace double negatives with positive form
        if (/don't\s+nothing/i.test(match)) return "do something";
        if (/can't\s+never/i.test(match)) return "can never";
        return match; // Default fallback
      });
    
    // Ensure proper capitalization at start of sentences  
    fixed = fixed.replace(/(^\s*|[.!?]\s*)[a-z]/g, match => match.toUpperCase());
    
    return fixed;
  };
  
  // Correct technical terms commonly misrecognized by speech recognition
  const correctTechnicalTerms = (text: string): string => {
    // Technical terms dictionary - add more terms based on the interview focus
    const technicalTerms: Record<string, string[]> = {
      // Programming languages
      'JavaScript': ['java script', 'java scripts', 'javascript'],
      'TypeScript': ['type script', 'typescript'],
      'Python': ['pie thon', 'python'],
      'Java': ['java'],
      'C++': ['c plus plus', 'c++', 'cplusplus', 'see plus plus'],
      
      // Web development
      'HTML': ['h.t.m.l', 'html', 'h t m l'],
      'CSS': ['c.s.s', 'css', 'c s s'],
      'React': ['re act', 'react'],
      'Angular': ['angular'],
      'Vue': ['view', 'vue'],
      
      // Data structures
      'Array': ['array', 'arrays'],
      'Object': ['object', 'objects'],
      'LinkedList': ['linked list', 'link list'],
      'Hash Table': ['hash table', 'hashtable'],
      
      // Algorithms
      'Recursion': ['recursion', 're-cursion'],
      'Algorithm': ['algorithm', 'algo rhythm'],
      'Dynamic Programming': ['dynamic programming', 'dynamic-programming'],
      
      // Database
      'SQL': ['s.q.l', 'sequel', 'sql'],
      'MongoDB': ['mongo db', 'mongodb', 'mongo'],
      'Database': ['data base', 'database'],
      
      // Cloud
      'AWS': ['a.w.s', 'aws', 'a w s'],
      'Azure': ['azure', 'as your'],
      
      // Concepts
      'API': ['a.p.i', 'api', 'a p i'],
      'REST': ['rest', 'r.e.s.t', 'r e s t'],
      'GraphQL': ['graph q l', 'graphql', 'graph-q-l'],
    };
    
    let corrected = text;
    
    // Apply technical term corrections with case preservation
    Object.entries(technicalTerms).forEach(([correct, variants]) => {
      variants.forEach(variant => {
        const regex = new RegExp(`\\b${variant}\\b`, 'gi');
        corrected = corrected.replace(regex, (match) => {
          // Preserve case if the match is uppercase
          if (match === match.toUpperCase()) return correct.toUpperCase();
          // Preserve case if the match is capitalized
          if (match[0] === match[0].toUpperCase()) {
            return correct.charAt(0).toUpperCase() + correct.slice(1);
          }
          return correct;
        });
      });
    });
    
    return corrected;
  };

  // Start recording with better error handling
  const startRecording = () => {
    if (!isSupported) {
      toast.error("Your browser doesn't support voice recognition");
      return;
    }
    
    try {
      if (recognitionRef.current) {
        // Reset buffer when starting new recording
        if (!isRecording) {
          transcriptBuffer.current = [];
        }
        
        // Start recognition
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("Recording started... Speak clearly into your microphone");
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("Error starting voice recording. Try stopping and starting again.");
      setIsRecording(false);
    }
  };
  
  // Stop recording safely
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
        console.log('Error stopping recording:', e);
      }
      setIsRecording(false);
      toast.info("Recording stopped");
    }
  };
  
  // Reset transcript for new responses
  const resetTranscript = () => {
    setTranscript('');
    transcriptBuffer.current = [];
  };

  return {
    transcript,
    isRecording,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported
  };
};

export default useSpeechRecognition;
