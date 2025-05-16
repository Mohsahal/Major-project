import { Mic, Play, ArrowRight, Clock, Users, Target, Star, Trophy, Brain, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type InterviewType = {
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  duration: string;
  color: string;
  topics: string[];
  successRate: number;
  attempts: number;
  lastAttempt?: string;
  rating: number;
};

export default function MockInterviews() {
  const navigate = useNavigate();
  
  const handleNavigateToInterview = () => {
    navigate("/mock-interview");
  };

  const interviews: InterviewType[] = [
    {
      title: "Frontend Development",
      category: "Technical",
      difficulty: "Medium",
      questions: 15,
      duration: "30 mins",
      color: "bg-indigo-500",
      topics: ["React", "JavaScript", "CSS", "HTML", "Web Performance"],
      successRate: 75,
      attempts: 120,
      lastAttempt: "2 days ago",
      rating: 4.5
    },
    {
      title: "Behavioral Questions",
      category: "Soft Skills",
      difficulty: "Easy",
      questions: 12,
      duration: "25 mins",
      color: "bg-green-500",
      topics: ["Leadership", "Teamwork", "Problem Solving", "Communication"],
      successRate: 85,
      attempts: 95,
      lastAttempt: "1 week ago",
      rating: 4.8
    },
    {
      title: "System Design",
      category: "Technical",
      difficulty: "Hard",
      questions: 8,
      duration: "45 mins",
      color: "bg-purple-500",
      topics: ["Architecture", "Scalability", "Database Design", "API Design"],
      successRate: 60,
      attempts: 75,
      lastAttempt: "3 days ago",
      rating: 4.2
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700";
      case "Medium": return "bg-amber-100 text-amber-700";
      case "Hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">Mock Interviews</h2>
          <p className="text-gray-500">Practice with AI-powered interview simulations</p>
        </div>
        <Button variant="outline" size="sm" className="text-indigo-600" onClick={handleNavigateToInterview}>
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Attempts</p>
                <p className="text-xl font-bold">{interviews.reduce((acc, curr) => acc + curr.attempts, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-xl font-bold">
                  {Math.round(interviews.reduce((acc, curr) => acc + curr.successRate, 0) / interviews.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-xl font-bold">{new Set(interviews.map(i => i.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Rating</p>
                <p className="text-xl font-bold">
                  {(interviews.reduce((acc, curr) => acc + curr.rating, 0) / interviews.length).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All Interviews</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="system">System Design</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {interviews.map((interview, index) => (
              <Card 
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-3px]"
              >
                <div className={`h-2 w-full ${interview.color}`}></div>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium group-hover:text-indigo-600 transition-all duration-200">
                        {interview.title}
                      </h3>
                      <p className="text-sm text-gray-500">{interview.category}</p>
                    </div>
                    <Badge variant="outline" className={getDifficultyColor(interview.difficulty)}>
                      {interview.difficulty}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{interview.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{interview.attempts} attempts</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Success Rate</span>
                        <span className="font-medium">{interview.successRate}%</span>
                      </div>
                      <Progress value={interview.successRate} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {interview.topics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 group"
                      onClick={handleNavigateToInterview}
                    >
                      <Play className="h-4 w-4 mr-2 group-hover:animate-pulse" /> Start Practice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Interview Coach Banner */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <Mic className="h-8 w-8 animate-float" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Interview Coach</h3>
                <p className="text-sm opacity-90">Get real-time feedback and personalized tips</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white"></div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="whitespace-nowrap bg-white text-indigo-700 hover:bg-gray-100">
                <Sparkles className="h-4 w-4 mr-2" /> Try Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
