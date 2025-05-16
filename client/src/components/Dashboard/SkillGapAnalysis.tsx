import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  TrendingUp,
  Target,
  BookOpen,
  Users,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";

type Skill = {
  name: string;
  current: number;
  required: number;
  category: string;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  demand: 'Low' | 'Medium' | 'High';
  trend: 'Growing' | 'Stable' | 'Declining';
};

export default function SkillGapAnalysis() {
  const skills: Skill[] = [
    { 
      name: "React", 
      current: 85, 
      required: 90, 
      category: "Framework",
      level: "Advanced",
      demand: "High",
      trend: "Stable"
    },
    { 
      name: "TypeScript", 
      current: 70, 
      required: 85, 
      category: "Language",
      level: "Intermediate",
      demand: "High",
      trend: "Growing"
    },
    { 
      name: "UI/UX Design", 
      current: 65, 
      required: 80, 
      category: "Design",
      level: "Intermediate",
      demand: "Medium",
      trend: "Stable"
    },
    { 
      name: "System Architecture", 
      current: 60, 
      required: 75, 
      category: "Technical",
      level: "Advanced",
      demand: "High",
      trend: "Growing"
    },
    { 
      name: "Team Leadership", 
      current: 75, 
      required: 70, 
      category: "Soft Skills",
      level: "Intermediate",
      demand: "Medium",
      trend: "Stable"
    }
  ];

  const getSkillPriority = (skill: Skill) => {
    if (skill.level === 'Advanced' && skill.demand === 'High') return 'Critical';
    if (skill.level === 'Advanced' || skill.demand === 'High') return 'High';
    if (skill.level === 'Intermediate' || skill.demand === 'Medium') return 'Medium';
    return 'Low';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Growing':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'Declining':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <Star className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skill Gap Analysis</h2>
          <p className="text-gray-500">Track and improve your professional skills</p>
        </div>
        <Button variant="outline" size="sm" className="text-career-purple">
          View Detailed Report <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skill Progress Cards */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Skill Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div 
                      key={skill.name}
                      className="space-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline">{skill.category}</Badge>
                          <Badge variant="outline" className={
                            skill.demand === 'High' ? 'bg-red-100 text-red-800' :
                            skill.demand === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {skill.demand} Demand
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={skill.current >= skill.required ? "text-green-600" : "text-amber-600"}>
                            {skill.current}%
                          </span>
                          <span className="text-gray-400">/ {skill.required}%</span>
                          {getTrendIcon(skill.trend)}
                        </div>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={skill.current} 
                          className={`h-2 ${skill.current >= skill.required ? 'bg-green-100' : 'bg-amber-100'}`}
                        />
                        <div 
                          className="absolute top-0 h-4 w-0.5 bg-gray-400 transform -translate-y-1"
                          style={{ left: `${skill.required}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Skill Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Skills at Target Level</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {skills.filter(s => s.current >= s.required).length} / {skills.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Critical Skills</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {skills.filter(s => getSkillPriority(s) === 'Critical').length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growing Skills</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {skills.filter(s => s.trend === 'Growing').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.map((skill) => (
              <Card key={skill.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{skill.name}</h3>
                      <Badge variant="outline" className={
                        getSkillPriority(skill) === 'Critical' ? 'bg-red-100 text-red-800' :
                        getSkillPriority(skill) === 'High' ? 'bg-orange-100 text-orange-800' :
                        getSkillPriority(skill) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {getSkillPriority(skill)} Priority
                      </Badge>
                    </div>
                    {getTrendIcon(skill.trend)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span>Gap: {skill.required - skill.current}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>Level: {skill.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Category: {skill.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <Card key={skill.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{skill.name}</h3>
                    <Badge variant="outline" className={
                      getSkillPriority(skill) === 'Critical' ? 'bg-red-100 text-red-800' :
                      getSkillPriority(skill) === 'High' ? 'bg-orange-100 text-orange-800' :
                      getSkillPriority(skill) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {getSkillPriority(skill)} Priority
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span>Complete {skill.name} certification</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span>Build 2-3 projects using {skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Join {skill.name} community forums</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Estimated time: {
                        skill.level === 'Advanced' ? '6-8 months' :
                        skill.level === 'Intermediate' ? '3-4 months' :
                        '1-2 months'
                      }</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
