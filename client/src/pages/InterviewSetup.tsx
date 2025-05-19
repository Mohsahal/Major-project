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
              Configure Your Interview
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Customize your interview experience to match your needs
            </p>
          </div>

          {/* Tabs for settings */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              <TabsTrigger value="custom">Custom Questions</TabsTrigger>
            </TabsList>

            {/* Basic Settings Tab Content */}
            <TabsContent value="basic">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Interview Type Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-white shadow-xl border-none hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Settings className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Interview Settings</h2>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <Label className="text-lg font-medium text-gray-700 mb-4 block">
                            Interview Type
                          </Label>
                          <RadioGroup
                            value={interviewType}
                            onValueChange={setInterviewType}
                            className="grid grid-cols-2 gap-4"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="relative"
                            >
                              <RadioGroupItem
                                value="technical"
                                id="technical"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="technical"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all duration-300"
                              >
                                <div className="p-2 bg-blue-50 rounded-lg mb-2">
                                  <Zap className="h-8 w-8 text-blue-600" />
                                </div>
                                <span className="font-medium">Technical</span>
                              </Label>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="relative"
                            >
                              <RadioGroupItem
                                value="behavioral"
                                id="behavioral"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="behavioral"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all duration-300"
                              >
                                <div className="p-2 bg-green-50 rounded-lg mb-2">
                                  <Star className="h-8 w-8 text-green-600" />
                                </div>
                                <span className="font-medium">Behavioral</span>
                              </Label>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="relative"
                            >
                              <RadioGroupItem
                                value="hr"
                                id="hr"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="hr"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all duration-300"
                              >
                                <div className="p-2 bg-purple-50 rounded-lg mb-2">
                                  <Target className="h-8 w-8 text-purple-600" />
                                </div>
                                <span className="font-medium">HR / Screening</span>
                              </Label>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="relative"
                            >
                              <RadioGroupItem
                                value="custom"
                                id="custom"
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor="custom"
                                className="flex flex-col items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600 cursor-pointer transition-all duration-300"
                              >
                                <div className="p-2 bg-orange-50 rounded-lg mb-2">
                                  <Clock className="h-8 w-8 text-orange-600" />
                                </div>
                                <span className="font-medium">Custom</span>
                              </Label>
                            </motion.div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-lg font-medium text-gray-700 mb-4 block flex items-center gap-2">
                            <Timer className="h-5 w-5 text-indigo-600" />
                            Interview Duration
                          </Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[duration]}
                              onValueChange={([value]) => setDuration(value)}
                              max={60}
                              step={5}
                              className="flex-1"
                            />
                            <span className="text-lg font-medium text-gray-700 min-w-[60px] bg-indigo-50 px-3 py-1 rounded-full">
                              {duration} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Column - Audio Settings */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-white shadow-xl border-none hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Volume2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800">Audio Settings</h2>
                      </div>

                      <div className="space-y-8">
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
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Advanced Settings Tab Content */}
            <TabsContent value="advanced">
              <Card className="bg-white shadow-xl border-none h-full p-8 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Advanced Settings coming soon!</p>
              </Card>
            </TabsContent>

            {/* Custom Questions Tab Content */}
            <TabsContent value="custom">
               <Card className="bg-white shadow-xl border-none h-full p-8 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Custom Questions coming soon!</p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tips Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-white shadow-xl border-none hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Lightbulb className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">Quick Tips</h3>
                </div>
                <ul className="space-y-4 text-gray-600">
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Find a quiet environment for the best experience</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Use headphones for better audio quality</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Make sure your microphone is working properly</span>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>Take your time to think before answering</span>
                  </motion.li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewSetup; 