
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const InterviewSettings = () => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <CardDescription className="mb-4">Customize your interview experience with these advanced settings</CardDescription>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Interview Difficulty</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Beginner</span>
                <span className="text-sm text-gray-500">Advanced</span>
              </div>
              <Slider
                defaultValue={[50]}
                max={100}
                step={1}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Interview Focus Areas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-technical" defaultChecked />
                <Label htmlFor="focus-technical">Technical Skills</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-soft" defaultChecked />
                <Label htmlFor="focus-soft">Soft Skills</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-problemsolving" defaultChecked />
                <Label htmlFor="focus-problemsolving">Problem Solving</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-leadership" />
                <Label htmlFor="focus-leadership">Leadership</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-experience" defaultChecked />
                <Label htmlFor="focus-experience">Past Experience</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="focus-culture" />
                <Label htmlFor="focus-culture">Cultural Fit</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Interview Format</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realtime-feedback">Real-time Feedback</Label>
                  <p className="text-sm text-gray-500">Receive feedback during the interview</p>
                </div>
                <Switch id="realtime-feedback" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="strict-timing">Strict Timing</Label>
                  <p className="text-sm text-gray-500">Enforce time limits for answers</p>
                </div>
                <Switch id="strict-timing" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="followup">Follow-up Questions</Label>
                  <p className="text-sm text-gray-500">AI asks follow-up questions based on your responses</p>
                </div>
                <Switch id="followup" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">Interviewer Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="style-supportive" defaultChecked />
                <Label htmlFor="style-supportive">Supportive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="style-challenging" />
                <Label htmlFor="style-challenging">Challenging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="style-neutral" defaultChecked />
                <Label htmlFor="style-neutral">Neutral</Label>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InterviewSettings;
