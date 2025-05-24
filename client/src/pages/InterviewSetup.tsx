import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  Clock,
  Zap,
  Star,
  Target,
  ArrowRight,
  Volume2,
  VolumeX,
  Settings,
  Play,
  Sparkles,
  Headphones,
  Lightbulb,
  Timer,
} from 'lucide-react';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [interviewType, setInterviewType] = useState('technical');
  const [duration, setDuration] = useState(30);
  const [ambianceVolume, setAmbianceVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  const handleStartInterview = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/interview/session');
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <Sparkles className="h-12 w-12 text-indigo-600" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
              Set Up Mock Interview
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Customize your interview experience to match your needs
            </p>
          </div>

          {/* New Layout based on Image */}
          <div className="space-y-8">
            {/* Interview Type Section */}
            <div>
              <Label className="text-lg font-medium text-gray-700 mb-4 block">
                Interview Type
              </Label>
              <div className="flex gap-4">
                <Button
                  variant={interviewType === 'technical' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('technical')}
                >
                  Technical
                </Button>
                <Button
                  variant={interviewType === 'behavioral' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('behavioral')}
                >
                  Behavioral
                </Button>
                <Button
                  variant={interviewType === 'leadership' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('leadership')}
                >
                  Leadership
                </Button>
                <Button
                  variant={interviewType === 'general' ? 'default' : 'outline'}
                  onClick={() => setInterviewType('general')}
                >
                  General
                </Button>
              </div>
            </div>

            {/* Interview Duration Section */}
            <div>
              <Label className="text-lg font-medium text-gray-700 mb-4 block">
                Interview Duration
              </Label>
              <div className="flex gap-4">
                <Button
                  variant={duration === 30 ? 'default' : 'outline'}
                  onClick={() => setDuration(30)}
                >
                  30 minutes
                </Button>
                <Button
                  variant={duration === 45 ? 'default' : 'outline'}
                  onClick={() => setDuration(45)}
                >
                  45 minutes
                </Button>
                <Button
                  variant={duration === 60 ? 'default' : 'outline'}
                  onClick={() => setDuration(60)}
                >
                  60 minutes
                </Button>
              </div>
            </div>

            {/* Advanced Settings Section */}
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}>
                <h2 className="text-xl font-semibold text-gray-800">Advanced Settings</h2>
                {advancedSettingsOpen ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>}
              </div>
              <AnimatePresence>
                {advancedSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    {/* Custom Questions */}
                    <div>
                      <Label className="text-lg font-medium text-gray-700 mb-4 block">
                        Custom Questions
                      </Label>
                      <p className="text-gray-500 text-sm mb-2">Add your own questions to the interview.</p>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        rows={4}
                        placeholder="Enter your custom questions here..."
                      ></textarea>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Start Interview Button - Moved outside the card */}
            <div className="pt-4">
              <Button
                onClick={handleStartInterview}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Preparing Interview...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-5 w-5" />
                    <span>Start Interview</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewSetup; 