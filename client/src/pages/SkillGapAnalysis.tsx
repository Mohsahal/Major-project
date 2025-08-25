import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  Upload,
  FileText,
  Trash2,
  Play,
  ExternalLink,
  Eye,
  ArrowLeft,
  Home,
  PieChart,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FLASK_BASE_URL, ensureFlaskAwake } from "@/config/api";

type SkillAnalysis = {
  present_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  skill_analysis: Record<string, {
    status: string;
    importance: string;
    level: string;
  }>;
  summary: {
    total_skills_required: number;
    skills_present: number;
    skills_missing: number;
    completion_percentage: number;
  };
};

type LearningResource = {
  skill: string;
  type: string;
  resources: string[];
  estimated_time: string;
  priority: string;
};

type YouTubeVideo = {
  title: string;
  channel: string;
  videoId: string;
  url: string;
  thumbnail: string;
  description: string;
};

type SkillGapResponse = {
  success: boolean;
  message: string;
  analysis: SkillAnalysis;
  learning_resources: {
    youtube_videos: Record<string, YouTubeVideo[]>;
    recommendations: LearningResource[];
  };
  resume_text_preview: string;
};

// Demo data for skill gap analysis
const DEMO_DATA: SkillGapResponse = {
  success: true,
  message: "Demo analysis completed successfully",
  analysis: {
    present_skills: ["Python", "JavaScript", "React", "HTML", "CSS", "Git", "Node.js", "MongoDB"],
    missing_skills: ["Docker", "AWS", "Kubernetes", "Express.js", "Agile", "CI/CD", "Microservices", "GraphQL"],
    additional_skills: ["Flask", "REST APIs", "JWT", "OAuth"],
    skill_analysis: {
      "Python": { status: "present", importance: "high", level: "intermediate" },
      "JavaScript": { status: "present", importance: "high", level: "intermediate" },
      "React": { status: "present", importance: "high", level: "basic" },
      "Docker": { status: "missing", importance: "high", level: "basic" },
      "AWS": { status: "missing", importance: "medium", level: "basic" },
      "Kubernetes": { status: "missing", importance: "medium", level: "basic" }
    },
    summary: {
      total_skills_required: 16,
      skills_present: 8,
      skills_missing: 8,
      completion_percentage: 50
    }
  },
  learning_resources: {
    youtube_videos: {
      "Docker": [
        {
          title: "Docker Tutorial for Beginners",
          channel: "Tech With Tim",
          videoId: "dQw4w9WgXcQ",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          description: "Complete Docker tutorial for beginners"
        },
        {
          title: "Docker in 100 Seconds",
          channel: "Fireship",
          videoId: "Gjnup-HvLk8",
          url: "https://www.youtube.com/watch?v=Gjnup-HvLk8",
          thumbnail: "https://img.youtube.com/vi/Gjnup-HvLk8/mqdefault.jpg",
          description: "Quick Docker overview"
        }
      ],
      "AWS": [
        {
          title: "AWS Tutorial for Beginners",
          channel: "Simplilearn",
          videoId: "rVtELx8bUeE",
          url: "https://www.youtube.com/watch?v=rVtELx8bUeE",
          thumbnail: "https://img.youtube.com/vi/rVtELx8bUeE/mqdefault.jpg",
          description: "AWS fundamentals and services"
        }
      ],
      "Kubernetes": [
        {
          title: "Kubernetes Tutorial for Beginners",
          channel: "TechWorld with Nana",
          videoId: "s_o8dwzRlu4",
          url: "https://www.youtube.com/watch?v=s_o8dwzRlu4",
          thumbnail: "https://img.youtube.com/vi/s_o8dwzRlu4/mqdefault.jpg",
          description: "Kubernetes basics and deployment"
        }
      ]
    },
    recommendations: [
      {
        skill: "Docker",
        type: "Containerization",
        resources: [
          "Docker Official Documentation",
          "Docker Hub Tutorials",
          "Practice with simple containers"
        ],
        estimated_time: "2-3 weeks",
        priority: "high"
      },
      {
        skill: "AWS",
        type: "Cloud Platform",
        resources: [
          "AWS Free Tier Account",
          "AWS Cloud Practitioner Course",
          "Hands-on labs and projects"
        ],
        estimated_time: "1-2 months",
        priority: "medium"
      },
      {
        skill: "Kubernetes",
        type: "Container Orchestration",
        resources: [
          "Kubernetes Official Documentation",
          "Minikube for local development",
          "Practice deployments and scaling"
        ],
        estimated_time: "2-3 months",
        priority: "medium"
      },
      {
        skill: "Express.js",
        type: "Backend Framework",
        resources: [
          "Express.js Official Guide",
          "Node.js and Express Tutorials",
          "Build REST APIs with Express"
        ],
        estimated_time: "3-4 weeks",
        priority: "high"
      },
      {
        skill: "Agile",
        type: "Methodology",
        resources: [
          "Agile Manifesto",
          "Scrum Framework Guide",
          "Practice with team projects"
        ],
        estimated_time: "2-3 weeks",
        priority: "medium"
      }
    ]
  },
  resume_text_preview: "Demo resume content for demonstration purposes..."
};

export default function SkillGapAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SkillGapResponse | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !jobDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a resume file and enter a job description.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      await ensureFlaskAwake();
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('job_description', jobDescription);

      const response = await fetch(`${FLASK_BASE_URL}/skill-gap-analysis`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data);
        setShowDemo(false);
        toast({
          title: "Analysis Complete",
          description: data.message,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'An error occurred during analysis',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showDemoData = () => {
    setAnalysisResult(DEMO_DATA);
    setShowDemo(true);
    toast({
      title: "Demo Mode",
      description: "Showing sample skill gap analysis data",
    });
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setJobDescription("");
    setAnalysisResult(null);
    setShowDemo(false);
  };

  const getSkillPriority = (skillName: string) => {
    if (!analysisResult) return 'Medium';
    
    const recommendation = analysisResult.learning_resources.recommendations.find(
      rec => rec.skill.toLowerCase() === skillName.toLowerCase()
    );
    return recommendation?.priority || 'Medium';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analysis</h1>
              <p className="text-gray-500">Analyze your skills against job requirements</p>
            </div>
            <div className="flex gap-2">
              {!analysisResult && (
                <Button variant="outline" size="sm" onClick={showDemoData}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Demo
                </Button>
              )}
              {analysisResult && (
                <Button variant="outline" size="sm" onClick={resetAnalysis}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {showDemo ? 'Close Demo' : 'New Analysis'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Demo Notice */}
          {showDemo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Eye className="h-5 w-5" />
                <span className="font-medium">Demo Mode</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                This is sample data to demonstrate the skill gap analysis feature. Upload your actual resume and job description to get personalized results.
              </p>
            </div>
          )}

          {/* Resume Upload Section */}
          {!analysisResult && (
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <FileText className="h-8 w-8" />
                  Resume Upload for Skill Analysis
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Upload your resume and provide a job description to analyze your skill gaps
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="resume-file" className="text-base font-medium">Upload Resume</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">
                          Drag and drop your resume here, or click to browse
                        </p>
                        <Input
                          id="resume-file"
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => document.getElementById('resume-file')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="job-description" className="text-base font-medium">Job Description</Label>
                      <Textarea
                        id="job-description"
                        placeholder="Paste the job description you want to analyze against..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[200px] text-base"
                      />
                      <p className="text-sm text-gray-500">
                        This helps us identify skills you need to develop for this position
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || !jobDescription.trim() || isAnalyzing}
                      size="lg"
                      className="px-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Skills...
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5 mr-2" />
                          Analyze Skill Gap
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={showDemoData}
                      size="lg"
                      className="px-8"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Try Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {analysisResult.analysis.summary.completion_percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Skill Match</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analysisResult.analysis.summary.skills_present}
                    </div>
                    <div className="text-sm text-gray-600">Skills Present</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {analysisResult.analysis.summary.skills_missing}
                    </div>
                    <div className="text-sm text-gray-600">Skills Missing</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {analysisResult.analysis.summary.total_skills_required}
                    </div>
                    <div className="text-sm text-gray-600">Total Required</div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">Overall Skill Match</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {analysisResult.analysis.summary.completion_percentage}%
                      </span>
                    </div>
                    <Progress 
                      value={analysisResult.analysis.summary.completion_percentage} 
                      className="h-4"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
                  <TabsTrigger value="recommendations">Learning Plan</TabsTrigger>
                  <TabsTrigger value="videos">Video Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Present Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-5 w-5" />
                          Skills You Have
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.present_skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Missing Skills */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="h-5 w-5" />
                          Skills to Develop
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.analysis.missing_skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="bg-red-100 text-red-800 text-sm px-3 py-1">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="charts">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Skills Distribution Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Skills Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <span>Present Skills</span>
                            </div>
                            <span className="font-bold text-green-600">
                              {analysisResult.analysis.summary.skills_present}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <span>Missing Skills</span>
                            </div>
                            <span className="font-bold text-red-600">
                              {analysisResult.analysis.summary.skills_missing}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              <span>Additional Skills</span>
                            </div>
                            <span className="font-bold text-blue-600">
                              {analysisResult.analysis.additional_skills.length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Priority Skills Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Priority Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <span>High Priority</span>
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              {analysisResult.learning_resources.recommendations.filter(r => r.priority === 'high').length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <span>Medium Priority</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              {analysisResult.learning_resources.recommendations.filter(r => r.priority === 'medium').length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span>Low Priority</span>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {analysisResult.learning_resources.recommendations.filter(r => r.priority === 'low').length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="gaps">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.analysis.missing_skills.map((skill, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-lg">{skill}</h3>
                              <Badge variant="outline" className={
                                getSkillPriority(skill) === 'high' ? 'bg-red-100 text-red-800' :
                                getSkillPriority(skill) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }>
                                {getSkillPriority(skill)} Priority
                              </Badge>
                            </div>
                            <AlertCircle className="h-6 w-6 text-red-500" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="h-4 w-4 text-gray-400" />
                              <span>Required for this position</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4 text-gray-400" />
                              <span>Not found in your resume</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Estimated time to learn: 2-4 months</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysisResult.learning_resources.recommendations.map((recommendation, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-lg">{recommendation.skill}</h3>
                            <Badge variant="outline" className={
                              recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {recommendation.priority} Priority
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {recommendation.resources.map((resource, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span>{resource}</span>
                              </div>
                            ))}
                            <div className="flex items-center gap-2 text-sm pt-2 border-t">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Estimated time: {recommendation.estimated_time}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="videos">
                  <div className="space-y-8">
                    {Object.entries(analysisResult.learning_resources.youtube_videos).map(([skill, videos]) => (
                      <Card key={skill}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5" />
                            {skill} Tutorials
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map((video, index) => (
                              <div key={index} className="border rounded-lg overflow-hidden bg-white">
                                <div className="aspect-video bg-gray-100">
                                  <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-4">
                                  <h4 className="font-medium text-sm line-clamp-2 mb-2">
                                    {video.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-3">
                                    {video.channel}
                                  </p>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => window.open(video.url, '_blank')}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Watch
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
