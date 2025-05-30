import { ArrowRight, RefreshCw, Star, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type JobType = {
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  skills: string[];
  posted: string;
  isNew?: boolean;
};

export default function JobRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobType[]>([
    {
      title: "Senior Frontend Developer",
      company: "TechGlobal Inc.",
      location: "Remote",
      salary: "$120K - $150K",
      matchPercentage: 94,
      skills: ["React", "TypeScript", "Tailwind CSS"],
      posted: "2 days ago"
    },
    {
      title: "Full Stack Engineer",
      company: "InnovateTech",
      location: "San Francisco, CA",
      salary: "$130K - $160K",
      matchPercentage: 87,
      skills: ["React", "Node.js", "GraphQL"],
      posted: "1 day ago"
    },
    {
      title: "UX/UI Developer",
      company: "DesignSphere",
      location: "New York, NY",
      salary: "$110K - $140K",
      matchPercentage: 82,
      skills: ["Figma", "React", "CSS"],
      posted: "3 days ago"
    }
  ]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedResume(file);
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('resume', file);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:5000/api/resume/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      toast({
        title: "Resume uploaded successfully",
        description: "We'll use this to find better job matches for you",
      });

      // Trigger new recommendations after upload
      handleGetRecommendations();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResume = () => {
    setUploadedResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add new recommendations with animation
    const newJobs = [
      {
        title: "AI/ML Engineer",
        company: "FutureTech",
        location: "Boston, MA",
        salary: "$140K - $180K",
        matchPercentage: 91,
        skills: ["Python", "TensorFlow", "Machine Learning"],
        posted: "Just now",
        isNew: true
      },
      {
        title: "Cloud Architect",
        company: "CloudScale",
        location: "Remote",
        salary: "$150K - $190K",
        matchPercentage: 88,
        skills: ["AWS", "Docker", "Kubernetes"],
        posted: "Just now",
        isNew: true
      }
    ];
    
    setJobs(prev => [...newJobs, ...prev.slice(0, 3)]);
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Job Recommendations</h2>
          <Star className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 hover:bg-blue-50"
          >
            <Upload className={`h-4 w-4 ${isUploading ? 'animate-bounce' : ''}`} />
            {uploadedResume ? 'Change Resume' : 'Upload Resume'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2 hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Get New Recommendations
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-career-blue"
            onClick={() => navigate('/jobs')}
          >
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {uploadedResume && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-blue-700">{uploadedResume.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveResume}
            className="h-8 w-8 p-0 hover:bg-blue-100"
          >
            <X className="h-4 w-4 text-blue-500" />
          </Button>
        </motion.div>
      )}

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-200 group relative
              ${job.isNew ? 'bg-blue-50/50 border-blue-100' : ''}`}
          >
            {job.isNew && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-500 text-white">New</Badge>
              </div>
            )}
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold group-hover:text-career-blue transition-all duration-200">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
              </div>
              <div className="text-right">
                <div className="bg-green-50 text-green-700 font-medium rounded-full px-3 py-1 text-xs inline-block">
                  {job.matchPercentage}% Match
                </div>
                <p className="text-sm text-gray-500 mt-1">{job.salary}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {job.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                    className="bg-blue-50 text-career-blue border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-gray-500">{job.posted}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}