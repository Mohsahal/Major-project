import { useState } from 'react';
import { useInterview, FeedbackData } from '../../contexts/InterviewContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, ThumbsUp, AlertTriangle, Play, Star as StarIcon } from 'lucide-react';

interface FeedbackPanelProps {
  feedback: FeedbackData;
  onNext: () => void;
}

const FeedbackPanel = ({ feedback, onNext }: FeedbackPanelProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // Handle text-to-speech for feedback with female voice
  const speakFeedback = () => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(feedback.overallFeedback);
    utterance.rate = 1.0;
    
    // Set female voice
    const voices = speechSynthesis.getVoices();
    // Find a female voice - prioritizing specific names known to be female voices
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.toLowerCase().includes('alice') ||
      voice.name.toLowerCase().includes('sarah') ||
      voice.name.toLowerCase().includes('victoria')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 border-0 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
        <div className="mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 p-0.5 rounded-full mb-4">
              <div className="bg-white rounded-full p-3 shadow-sm">
                <MessageCircle className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Question Feedback
            </h3>
          </motion.div>
          
          <div className="relative p-6 bg-blue-50/70 rounded-xl border border-blue-100 mb-8">
            <div className="absolute -top-3 left-4 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow-sm font-medium">
              <MessageCircle className="inline-block w-3 h-3 mr-1" /> Feedback
            </div>
            <p className="text-gray-700 leading-relaxed text-base">{feedback.overallFeedback}</p>
          </div>
          
          <div className="flex items-center justify-center gap-1 mt-6 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: star * 0.1, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <StarIcon
                  className={`w-10 h-10 transition-colors duration-200 ${
                    star <= feedback.score ? "text-yellow-400 drop-shadow" : "text-gray-300"
                  }`}
                  fill={star <= feedback.score ? "currentColor" : "none"}
                  stroke={star <= feedback.score ? "none" : "currentColor"}
                />
                {star <= feedback.score && (
                  <motion.div 
                    className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: star * 0.1 + 0.2 }}
                  />
                )}
              </motion.div>
            ))}
            <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              {feedback.score}/5
            </span>
          </div>
        </div>
        
        <Collapsible
          open={showDetails}
          onOpenChange={setShowDetails}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 mb-3 border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-lg"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show Details</span>
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <motion.div
              variants={container}
              initial="hidden"
              animate={showDetails ? "show" : "hidden"}
              className="mb-4 p-5 rounded-xl bg-green-50/70 border border-green-100"
            >
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <div className="bg-green-100 p-1.5 rounded-full mr-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                </div>
                Strengths
              </h4>
              <motion.ul className="list-none space-y-3 pl-3">
                {feedback.strengths.map((strength, index) => (
                  <motion.li 
                    key={index} 
                    variants={item} 
                    className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed"
                  >
                    <div className="min-w-4 min-h-4 w-4 h-4 bg-green-200 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-700 rounded-full"/>
                    </div>
                    <span>{strength}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            
            <motion.div
              variants={container}
              initial="hidden"
              animate={showDetails ? "show" : "hidden"}
              className="mb-4 p-5 rounded-xl bg-amber-50/70 border border-amber-100"
            >
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                <div className="bg-amber-100 p-1.5 rounded-full mr-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                Areas for Improvement
              </h4>
              <motion.ul className="list-none space-y-3 pl-3">
                {feedback.improvements.map((improvement, index) => (
                  <motion.li 
                    key={index} 
                    variants={item} 
                    className="text-sm text-gray-800 flex items-start gap-2 leading-relaxed"
                  >
                    <div className="min-w-4 min-h-4 w-4 h-4 bg-amber-200 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-amber-700 rounded-full"/>
                    </div>
                    <span>{improvement}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={speakFeedback}
            className="group border-gray-200 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-lg px-4 py-2"
          >
            <Play className="w-4 h-4 mr-2 group-hover:text-indigo-600 transition-colors" />
            Listen to Feedback
          </Button>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="ml-auto"
          >
            <Button 
              variant="default"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all text-white shadow-md rounded-lg px-6 py-3 text-base" 
              onClick={onNext}
            >
              Next Question
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeedbackPanel;
