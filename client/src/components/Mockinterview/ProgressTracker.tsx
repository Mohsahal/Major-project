
import { useInterview } from '../../contexts/InterviewContext';
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { Clock, MessageSquare } from 'lucide-react';

interface ProgressTrackerProps {
  className?: string;
}

const ProgressTracker = ({ className = '' }: ProgressTrackerProps) => {
  const { questions, currentQuestionIndex, duration } = useInterview();
  
  // Format duration time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = questions.length > 0 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : 0;
  
  return (
    <motion.div 
      className={`w-full rounded-xl bg-white shadow-lg ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4 p-5">
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">
              Question <span className="font-bold text-indigo-600">{currentQuestionIndex + 1}</span> of {questions.length}
            </span>
            <div className="text-xs text-gray-500 mt-0.5">
              {Math.floor((currentQuestionIndex / questions.length) * 100)}% complete
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="bg-indigo-100 p-2 rounded-full mr-3">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">
              {formatTime(duration)}
            </span>
            <div className="text-xs text-gray-500 mt-0.5">
              Interview duration
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative px-5 pb-5">
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-gray-100 rounded-full" 
          indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-in-out rounded-full"
        />
        
        <div className="flex justify-between mt-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <div className="text-xs text-gray-500 mt-1">Start</div>
          </div>
          
          <motion.div 
            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-200"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {Math.round(progressPercentage)}% complete
          </motion.div>
          
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${progressPercentage >= 100 ? 'bg-violet-600' : 'bg-gray-200'}`}>
            </div>
            <div className="text-xs text-gray-500 mt-1">End</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default ProgressTracker;



