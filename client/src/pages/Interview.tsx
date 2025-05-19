import { InterviewProvider } from '../contexts/InterviewContext'
import InterviewSetup from '../components/Mockinterview/InterviewSetup';
import InterviewInterface from '../components/Mockinterview/InterviewInterface';
import SummaryReport from '../components/Mockinterview/SummaryReport';
import { useInterview } from '../contexts/InterviewContext';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const InterviewContent = () => {
  const { status } = useInterview();
  
  return (
    <motion.div 
      className="container py-8 px-4 max-w-5xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {status === 'setup' && <InterviewSetup />}
      {status === 'ongoing' && <InterviewInterface />}
      {status === 'completed' && <SummaryReport />}
    </motion.div>
  );
};

const Interview = () => {
  return (
    <InterviewProvider>
      <div className="min-h-screen bg-gradient-to-br via-purple-100 to-blue-100">
        <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 py-4 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Mock Interview
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Perfect your skills, ace your interviews</p>
              </div>
            </motion.div>
            
           
          </div>
        </header>
        
        <InterviewContent />
      </div>
    </InterviewProvider>
  );
};

export default Interview;
