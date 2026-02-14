import { useState, useEffect, useCallback } from 'react';
const useVoiceRecognition = (options = {}) => {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [recognition, setRecognition] = useState(null);
    useEffect(() => {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = options.language || 'en-US';
        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            options.onStart?.();
        };
        recognition.onend = () => {
            setIsListening(false);
            options.onEnd?.();
        };
        recognition.onresult = (event) => {
            let finalTranscript = transcript;
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                }
                else {
                    interimTranscript += transcript;
                }
            }
            setTranscript(finalTranscript.trim());
            setInterimTranscript(interimTranscript);
        };
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError(`Error: ${event.error}`);
            setIsListening(false);
        };
        setRecognition(recognition);
        return () => {
            if (recognition) {
                recognition.abort();
            }
        };
    }, [options.language, transcript]);
    const startListening = useCallback(async () => {
        if (!recognition) {
            setError('Speech recognition is not initialized');
            return;
        }
        try {
            // Request microphone permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
            recognition.start();
        }
        catch (error) {
            console.error('Error starting speech recognition:', error);
            setError('Please allow microphone access to start the interview');
        }
    }, [recognition]);
    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);
    return {
        transcript,
        interimTranscript,
        isListening,
        startListening,
        stopListening,
        resetTranscript,
        error
    };
};
export default useVoiceRecognition;
