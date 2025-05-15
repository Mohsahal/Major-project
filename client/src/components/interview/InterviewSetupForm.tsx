
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewSettings from '@/components/interview/InterviewSettings';
import InterviewQuestions from '@/components/interview/InterviewQuestions';
import { toast } from 'sonner';

interface InterviewSetupFormProps {
  jobRole: string;
  setJobRole: (role: string) => void;
  interviewType: string;
  setInterviewType: (type: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  onComplete: () => void;
}

const InterviewSetupForm = ({
  jobRole,
  setJobRole,
  interviewType,
  setInterviewType,
  duration,
  setDuration,
  onComplete
}: InterviewSetupFormProps) => {
  const handleStartInterview = () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }
    
    toast.success('Interview setup complete!');
    onComplete();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mock Interview Setup</h1>
        <p className="text-gray-500 dark:text-gray-400">Configure your AI-powered interview practice session</p>
      </div>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <CardDescription>Enter your target role and interview preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="job-role">Target Job Role</Label>
              <Input 
                id="job-role" 
                placeholder="e.g., Frontend Developer, Product Manager" 
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Interview Type</Label>
              <RadioGroup 
                defaultValue="technical" 
                value={interviewType}
                onValueChange={setInterviewType}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical" className="flex-1 cursor-pointer">Technical Interview</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="behavioral" id="behavioral" />
                  <Label htmlFor="behavioral" className="flex-1 cursor-pointer">Behavioral Interview</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="leadership" id="leadership" />
                  <Label htmlFor="leadership" className="flex-1 cursor-pointer">Leadership Interview</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="general" id="general" />
                  <Label htmlFor="general" className="flex-1 cursor-pointer">General Interview</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-3">
              <Label>Interview Duration</Label>
              <RadioGroup 
                defaultValue="15" 
                value={duration}
                onValueChange={setDuration}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="15" id="duration-15" />
                  <Label htmlFor="duration-15" className="flex-1 cursor-pointer">15 minutes</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="30" id="duration-30" />
                  <Label htmlFor="duration-30" className="flex-1 cursor-pointer">30 minutes</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                  <RadioGroupItem value="45" id="duration-45" />
                  <Label htmlFor="duration-45" className="flex-1 cursor-pointer">45 minutes</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="settings">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
            <TabsTrigger value="questions">Custom Questions</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <InterviewSettings />
          </TabsContent>
          <TabsContent value="questions">
            <InterviewQuestions />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700"
            onClick={handleStartInterview}
          >
            Set Up Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupForm;
