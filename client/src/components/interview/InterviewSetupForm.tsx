import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Volume2, VolumeX, Headphones } from 'lucide-react';

interface InterviewSetupFormProps {
  interviewType: string;
  setInterviewType: (type: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  onComplete: () => void;
}

const InterviewSetupForm = ({
  interviewType,
  setInterviewType,
  duration,
  setDuration,
  onComplete
}: InterviewSetupFormProps) => {
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [ambianceVolume, setAmbianceVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const handleStartInterview = () => {
    toast.success('Interview setup complete!');
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
          Set Up Mock Interview
        </h1>
        <p className="text-xl md:text-2xl text-gray-600">
          Customize your interview experience to match your needs
        </p>
      </div>
      
      <div className="space-y-8">
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

        <div>
          <Label className="text-lg font-medium text-gray-700 mb-4 block">
            Interview Duration
          </Label>
          <div className="flex gap-4">
            <Button
              variant={duration === '30' ? 'default' : 'outline'}
              onClick={() => setDuration('30')}
            >
              30 minutes
            </Button>
            <Button
              variant={duration === '45' ? 'default' : 'outline'}
              onClick={() => setDuration('45')}
            >
              45 minutes
            </Button>
            <Button
              variant={duration === '60' ? 'default' : 'outline'}
              onClick={() => setDuration('60')}
            >
              60 minutes
            </Button>
          </div>
        </div>

        <div className="border rounded-md p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}>
            <h2 className="text-xl font-semibold text-gray-800">Advanced Settings</h2>
            {advancedSettingsOpen ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
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

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <Label className="text-lg font-medium text-gray-700 flex items-center gap-2">
                      <Headphones className="h-5 w-5 text-indigo-600" />
                      Background Ambiance
                    </Label>
                    <Switch
                      checked={!isMuted}
                      onCheckedChange={checked => setIsMuted(!checked)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>

                  <AnimatePresence>
                    {!isMuted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <Label className="text-lg font-medium text-gray-700 mb-4 block flex items-center gap-2">
                            <Volume2 className="h-5 w-5 text-indigo-600" />
                            Ambiance Volume
                          </Label>
                          <div className="flex items-center gap-4">
                            <VolumeX className="h-5 w-5 text-gray-400" />
                            <Slider
                              value={[ambianceVolume * 100]}
                              onValueChange={([value]) => setAmbianceVolume(value / 100)}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <Volume2 className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-4">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700"
            onClick={handleStartInterview}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="h-5 w-5" />
              <span>Start Interview</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupForm;
