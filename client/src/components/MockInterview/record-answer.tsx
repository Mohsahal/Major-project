/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@/contexts/AuthContext";
import {
  CircleStop,
  Loader,
  Mic,
  MicOff,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import useSpeechToText, { ResultType } from "@/hooks/useSpeechToText";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { SaveModal } from "./save-modal";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { ApiClient } from "@/config/api";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
  interviewId: string;
  onQuestionComplete?: () => void; // Callback to move to next question
  currentQuestionIndex?: number;
  totalQuestions?: number;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
  interviewId,
  onQuestionComplete,
  currentQuestionIndex = 0,
  totalQuestions = 1,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Track speaker state
  const [isCameraOn, setIsCameraOn] = useState(true); // Track camera state
  const webcamRef = useRef<WebCam>(null);

  const { user, getToken } = useAuth();

  // Auto-start camera when component mounts
  useEffect(() => {
    setIsCameraOn(true);
    setIsWebCam(true);
  }, []);

  // Auto-read question when component mounts or question changes
  useEffect(() => {
    if (question.question && isSpeakerOn) {
      speakQuestion(question.question);
    }
  }, [question.question, isSpeakerOn]);

  // Function to speak the question
  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window && isSpeakerOn) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Toggle speaker on/off
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn) {
      speechSynthesis.cancel(); // Stop current speech
    } else {
      speakQuestion(question.question); // Start speaking when turned on
    }
  };

  // Toggle camera on/off
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setIsWebCam(!isCameraOn);
  };

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });
        return;
      }

      // Generate AI result
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSession.sendMessage(prompt);

      const responseText = aiResult.response.text();
      console.log('AI Response text:', responseText);
      
      try {
        const parsedResult: AIResponse = cleanJsonResponse(responseText);
        console.log('Parsed AI result:', parsedResult);
        
        // Validate the parsed result
        if (typeof parsedResult.ratings !== 'number' || typeof parsedResult.feedback !== 'string') {
          throw new Error('Invalid AI response format');
        }
        
        return parsedResult;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Return a default response if parsing fails
        return {
          ratings: 5,
          feedback: 'Unable to generate feedback. Please try again.'
        };
      }
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null);
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult || !user) {
      return;
    }

    const currentQuestion = question.question;
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Check if user already answered this question
      const existingAnswers = await ApiClient.getUserAnswersByInterview(interviewId, token);
      const alreadyAnswered = existingAnswers.data?.some(
        (answer) => answer.question === currentQuestion
      );

      if (alreadyAnswered) {
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      }

      // Save the user answer
      const saveData = {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        userId: user.id,
      };
      
      console.log('Saving user answer data:', saveData);
      const result = await ApiClient.saveUserAnswer(saveData, token);

      if (result.success) {
        toast("Saved", { description: "Your answer has been saved successfully!" });
        
        // Reset state
        setUserAnswer("");
        setAiResult(null);
        stopSpeechToText();
        
        // Auto-advance to next question if callback exists
        if (onQuestionComplete) {
          setTimeout(() => {
            onQuestionComplete();
          }, 1500); // Wait 1.5 seconds before moving to next question
        }
      } else {
        throw new Error(result.message || "Failed to save answer");
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while saving your answer.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      {/* Question Progress */}
      <div className="w-full max-w-2xl text-center">
        <div className="text-sm text-gray-600 mb-2">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Camera Section */}
      <div className="w-1/2 h-[200px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam && isCameraOn ? (
          <WebCam
            ref={webcamRef}
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => {
              setIsWebCam(false);
              setIsCameraOn(false);
              toast.error("Camera Error", {
                description: "Unable to access camera. Please check permissions.",
              });
            }}
            className="w-full h-full object-cover rounded-md"
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 400,
              height: 300,
              facingMode: "user"
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground mb-2" />
            <p className="text-sm text-gray-500">
              {isCameraOn ? "Camera is starting..." : "Camera is off"}
            </p>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
          icon={
            isCameraOn ? (
              <Video className="min-w-5 min-h-5" />
            ) : (
              <VideoOff className="min-w-5 min-h-5" />
            )
          }
          onClick={toggleCamera}
          buttonClassName={isCameraOn ? "bg-green-100 hover:bg-green-200 text-green-700" : "bg-red-100 hover:bg-red-200 text-red-700"}
        />

        <TooltipButton
          content={isSpeakerOn ? "Turn Speaker Off" : "Turn Speaker On"}
          icon={
            isSpeakerOn ? (
              <Volume2 className="min-w-5 min-h-5" />
            ) : (
              <VolumeX className="min-w-5 min-h-5" />
            )
          }
          onClick={toggleSpeaker}
          buttonClassName={isSpeakerOn ? "bg-blue-100 hover:bg-blue-200 text-blue-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
          buttonClassName={isRecording ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-blue-100 hover:bg-blue-200 text-blue-700"}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
          buttonClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(true)}
          disabled={!aiResult || isAiGenerating}
          buttonClassName="bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Answer Display */}
      <div className="w-full max-w-4xl mt-4 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-3">Your Answer:</h2>
        
        <div className="bg-white p-4 rounded-md border">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {userAnswer || "Start recording to see your answer here..."}
          </p>
        </div>

        {interimResult && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
            <p className="text-sm text-blue-700">
              <strong>Currently speaking:</strong> {interimResult}
            </p>
          </div>
        )}

        {/* AI Feedback Display */}
        {aiResult && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold text-gray-800">AI Feedback</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {aiResult.ratings}/10
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{aiResult.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};
