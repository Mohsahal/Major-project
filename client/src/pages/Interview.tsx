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
     
        <InterviewContent />
      </div>
    </InterviewProvider>
  );
};

export default Interview;
