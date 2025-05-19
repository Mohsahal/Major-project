
import { useState } from 'react';
import { useInterview, InterviewType, InterviewMode } from '../../contexts/InterviewContext';
import { getQuestionsByType } from '../../utils/mockQuestions';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const InterviewSetup = () => {
  const {
    interviewType, setInterviewType,
    role, setRole,
    setQuestions, setStatus
  } = useInterview();
  
  const [activeTab, setActiveTab] = useState<string>("basic-settings");
  const [difficulty, setDifficulty] = useState<number>(50);
  const [duration, setDuration] = useState<"15" | "30" | "45">("15");
  const [focusAreas, setFocusAreas] = useState({
    technicalSkills: true,
    problemSolving: true,
    pastExperience: true,
    softSkills: true,
    leadership: false,
    culturalFit: false
  });
  const [interviewFormat, setInterviewFormat] = useState({
    realTimeFeedback: true,
    strictTiming: false,
    followUpQuestions: true
  });
  const [interviewerStyle, setInterviewerStyle] = useState({
    supportive: true,
    challenging: false,
    neutral: true
  });
  
  // Handler for duration changes with type safety
  const handleDurationChange = (value: string) => {
    // Validate that the value is one of the allowed options before setting it
    if (value === "15" || value === "30" || value === "45") {
      setDuration(value);
    }
  };
  
  // Start the interview
  const handleStartInterview = () => {
    const questions = getQuestionsByType(interviewType);
    setQuestions(questions);
    setStatus('ongoing');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto pb-10"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mock Interview Setup</h1>
        <p className="text-gray-600">Configure your AI-powered interview practice session</p>
      </motion.div>

      <Tabs defaultValue="basic-settings" className="w-full" onValueChange={setActiveTab}>
        <div className="sticky top-[65px] z-10 px-2 py-3 bg-indigo-50/80 backdrop-blur-md rounded-xl mb-8">
          <TabsList className="w-full">
            <TabsTrigger value="basic-settings" className="text-xs sm:text-sm">
              Basic Settings
            </TabsTrigger>
            <TabsTrigger value="advanced-settings" className="text-xs sm:text-sm">
              Advanced Settings
            </TabsTrigger>
            <TabsTrigger value="custom-questions" className="text-xs sm:text-sm">
              Custom Questions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic-settings">
          <Card className="border border-indigo-100 shadow-md bg-white rounded-xl overflow-hidden">
            <CardContent className="pt-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Enter your target role and interview preferences</p>
                
                <div className="space-y-6">
                  {/* Target Job Role */}
                  <div>
                    <Label htmlFor="role" className="text-base font-medium text-gray-700 block mb-2">Target Job Role</Label>
                    <Input 
                      id="role"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., Frontend Developer, Product Manager"
                    />
                  </div>
                  
                  {/* Interview Type */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interview Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 ${interviewType === 'technical' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => setInterviewType('technical')}>
                        <RadioGroup value={interviewType} onValueChange={(value) => setInterviewType(value as InterviewType)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="technical" id="technical" className="text-indigo-600" />
                            <Label htmlFor="technical" className="font-medium">Technical Interview</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Code, algorithms, system design</p>
                        </RadioGroup>
                      </div>
                      
                      <div className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 ${interviewType === 'behavioral' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => setInterviewType('behavioral')}>
                        <RadioGroup value={interviewType} onValueChange={(value) => setInterviewType(value as InterviewType)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="behavioral" id="behavioral" className="text-indigo-600" />
                            <Label htmlFor="behavioral" className="font-medium">Behavioral Interview</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Past experiences, soft skills</p>
                        </RadioGroup>
                      </div>
                      
                      <div className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 ${interviewType === 'hr' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => setInterviewType('hr')}>
                        <RadioGroup value={interviewType} onValueChange={(value) => setInterviewType(value as InterviewType)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hr" id="hr" className="text-indigo-600" />
                            <Label htmlFor="hr" className="font-medium">Leadership Interview</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Management, decision making</p>
                        </RadioGroup>
                      </div>
                      
                      <div className={`relative border rounded-xl p-4 cursor-pointer transition-all duration-200 ${interviewType === 'custom' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => setInterviewType('custom')}>
                        <RadioGroup value={interviewType} onValueChange={(value) => setInterviewType(value as InterviewType)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" className="text-indigo-600" />
                            <Label htmlFor="custom" className="font-medium">General Interview</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Mix of various question types</p>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interview Duration */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interview Duration</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${duration === '15' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => handleDurationChange('15')}>
                        <RadioGroup value={duration} onValueChange={handleDurationChange}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="15" id="15min" className="text-indigo-600" />
                            <Label htmlFor="15min" className="font-medium">15 minutes</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Short screening</p>
                        </RadioGroup>
                      </div>
                      
                      <div className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${duration === '30' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => handleDurationChange('30')}>
                        <RadioGroup value={duration} onValueChange={handleDurationChange}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="30" id="30min" className="text-indigo-600" />
                            <Label htmlFor="30min" className="font-medium">30 minutes</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Standard interview</p>
                        </RadioGroup>
                      </div>
                      
                      <div className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${duration === '45' ? 'border-indigo-500 bg-indigo-50 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => handleDurationChange('45')}>
                        <RadioGroup value={duration} onValueChange={handleDurationChange}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="45" id="45min" className="text-indigo-600" />
                            <Label htmlFor="45min" className="font-medium">45 minutes</Label>
                          </div>
                          <p className="mt-1 text-xs text-gray-500 ml-6">Extended session</p>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced-settings">
          <Card className="border border-indigo-100 shadow-md bg-white rounded-xl overflow-hidden">
            <CardContent className="pt-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Advanced Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Customize your interview experience with these advanced settings</p>
                
                <div className="space-y-8">
                  {/* Interview Difficulty */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interview Difficulty</Label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 min-w-20">Beginner</span>
                      <Slider 
                        value={[difficulty]} 
                        min={0} 
                        max={100} 
                        step={1} 
                        onValueChange={(values) => setDifficulty(values[0])}
                        className="flex-grow"
                      />
                      <span className="text-sm text-gray-600 min-w-20">Advanced</span>
                    </div>
                    <div className="mt-2 flex justify-center">
                      <div className="px-4 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-700 text-sm font-medium">
                        {difficulty < 25 ? "Beginner" : difficulty < 50 ? "Intermediate" : difficulty < 75 ? "Advanced" : "Expert"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Interview Focus Areas */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interview Focus Areas</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="technicalSkills"
                          checked={focusAreas.technicalSkills}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, technicalSkills: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="technicalSkills" className="font-medium text-gray-700">Technical Skills</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="softSkills"
                          checked={focusAreas.softSkills}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, softSkills: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="softSkills" className="font-medium text-gray-700">Soft Skills</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="problemSolving"
                          checked={focusAreas.problemSolving}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, problemSolving: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="problemSolving" className="font-medium text-gray-700">Problem Solving</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="leadership"
                          checked={focusAreas.leadership}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, leadership: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="leadership" className="font-medium text-gray-700">Leadership</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="pastExperience"
                          checked={focusAreas.pastExperience}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, pastExperience: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="pastExperience" className="font-medium text-gray-700">Past Experience</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="culturalFit"
                          checked={focusAreas.culturalFit}
                          onCheckedChange={(checked) => 
                            setFocusAreas({...focusAreas, culturalFit: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="culturalFit" className="font-medium text-gray-700">Cultural Fit</Label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interview Format */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interview Format</Label>
                    <div className="space-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Real-time Feedback</p>
                          <p className="text-xs text-gray-500">Receive feedback during the interview</p>
                        </div>
                        <Switch 
                          checked={interviewFormat.realTimeFeedback}
                          onCheckedChange={(checked) =>
                            setInterviewFormat({...interviewFormat, realTimeFeedback: checked})
                          }
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Strict Timing</p>
                          <p className="text-xs text-gray-500">Enforce time limits for answers</p>
                        </div>
                        <Switch 
                          checked={interviewFormat.strictTiming}
                          onCheckedChange={(checked) =>
                            setInterviewFormat({...interviewFormat, strictTiming: checked})
                          }
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Follow-up Questions</p>
                          <p className="text-xs text-gray-500">AI asks follow-up questions based on your responses</p>
                        </div>
                        <Switch 
                          checked={interviewFormat.followUpQuestions}
                          onCheckedChange={(checked) =>
                            setInterviewFormat({...interviewFormat, followUpQuestions: checked})
                          }
                          className="data-[state=checked]:bg-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Interviewer Style */}
                  <div>
                    <Label className="text-base font-medium text-gray-700 block mb-3">Interviewer Style</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="supportive"
                          checked={interviewerStyle.supportive}
                          onCheckedChange={(checked) => 
                            setInterviewerStyle({...interviewerStyle, supportive: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="supportive" className="font-medium text-gray-700">Supportive</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="challenging"
                          checked={interviewerStyle.challenging}
                          onCheckedChange={(checked) => 
                            setInterviewerStyle({...interviewerStyle, challenging: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="challenging" className="font-medium text-gray-700">Challenging</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="neutral"
                          checked={interviewerStyle.neutral}
                          onCheckedChange={(checked) => 
                            setInterviewerStyle({...interviewerStyle, neutral: checked === true})
                          }
                          className="text-indigo-600 border-indigo-400 data-[state=checked]:bg-indigo-600"
                        />
                        <Label htmlFor="neutral" className="font-medium text-gray-700">Neutral</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom-questions">
          <Card className="border border-indigo-100 shadow-md bg-white rounded-xl overflow-hidden">
            <CardContent className="pt-6">
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Custom Questions</h2>
                <p className="text-sm text-gray-500 mb-6">Add your own questions or choose from templates</p>
                
                <div className="p-10 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Custom Questions</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Add your own interview questions or choose from our library of industry-specific templates.</p>
                  <Button variant="outline" className="mt-6 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    Coming Soon
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <motion.div 
        variants={itemVariants}
        className="mt-8 flex justify-center"
      >
        <Button 
          onClick={handleStartInterview}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-6 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          Start Interview
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default InterviewSetup;
