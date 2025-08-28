import { ArrowRight, RefreshCw, Loader2, Star, Upload, FileText, X, MapPin, Building2, DollarSign, Clock, TrendingUp, Filter, Search, Bookmark, Share2, Eye, Sparkles, Zap, Target, Users, Briefcase, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { FLASK_ENDPOINTS, ensureFlaskAwake } from "@/config/api";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

type JobType = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  skills: string[];
  posted: string;
  description?: string;
  isNew?: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  experience: string;
  logo?: string;
  benefits: string[];
  urgency: 'High' | 'Medium' | 'Low';
  applyLink?: string;
};

type JobRecommendationsProps = {
  onJobsUpdated?: (jobs: JobType[]) => void;
};

export default function JobRecommendations({ onJobsUpdated }: JobRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [csvDownload, setCsvDownload] = useState<string | null>(null);
  const [autoQuery, setAutoQuery] = useState<string | null>(null);
  const [jobLocation, setJobLocation] = useState<string>('Bangalore');
  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const suggestedLocations: string[] = [
    'Bangalore',
    'Remote',
    'San Francisco',
    'New York',
    'London',
    'Toronto',
    'Sydney',
    'Berlin',
    'Singapore',
    'Dubai'
  ];

  // Demo data with realistic job information
  const [jobs, setJobs] = useState<JobType[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      matchPercentage: 95,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      posted: '2 hours ago',
      description: 'Join our dynamic team to build cutting-edge web applications. We\'re looking for a passionate developer who loves clean code and user experience.',
      isNew: true,
      type: 'Full-time',
      experience: '5+ years',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Stock Options'],
      urgency: 'High'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'InnovateLab',
      location: 'New York, NY',
      salary: '$130,000 - $160,000',
      matchPercentage: 88,
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      posted: '1 day ago',
      description: 'Lead product development from concept to launch. Work with cross-functional teams to deliver exceptional user experiences.',
      isNew: true,
      type: 'Full-time',
      experience: '3+ years',
      benefits: ['Health Insurance', '401k', 'Flexible PTO', 'Learning Budget'],
      urgency: 'Medium'
    }
  ]);

  // Demo job for when no resume is uploaded
  const demoJob: JobType = {
    id: 'demo',
    title: 'Full Stack Developer',
    company: 'DemoTech Solutions',
    location: 'Remote / Anywhere',
    salary: '$100,000 - $130,000',
    matchPercentage: 85,
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    posted: '1 week ago',
    description: 'This is a demo job recommendation to show you what you can expect after uploading your resume. Upload your resume to get personalized AI-powered job matches!',
    isNew: false,
    type: 'Full-time',
    experience: '3+ years',
    benefits: ['Health Insurance', '401k', 'Remote Work', 'Learning Budget'],
    urgency: 'Medium'
  };

  // Get featured jobs (top 2 by match percentage)
  const featuredJobs = jobs.slice(0, 2);
  const totalJobsCount = 10; // Total available jobs

  const filters = [
    { id: 'all', label: 'All Jobs', count: jobs.length },
    { id: 'new', label: 'New Matches', count: jobs.filter(job => job.isNew).length },
    { id: 'high-match', label: 'High Match', count: jobs.filter(job => job.matchPercentage >= 90).length },
    { id: 'remote', label: 'Remote', count: jobs.filter(job => job.type === 'Remote').length }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'new' && job.isNew) ||
      (selectedFilter === 'high-match' && job.matchPercentage >= 90) ||
      (selectedFilter === 'remote' && job.type === 'Remote');
    
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const validateFile = (file: File): boolean => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX or TXT file",
        variant: "destructive"
      });
      return false;
    }


    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setUploadedResume(file);
    setShowRecommendations(false); // Reset recommendations when new resume is uploaded
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);
        
        toast({
          title: "Resume uploaded successfully",
          description: "Click 'Get AI Recommendations' to see personalized job matches",
        });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveResume = () => {
    setUploadedResume(null);
    setShowRecommendations(false); // Hide recommendations when resume is removed
    onJobsUpdated?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetRecommendations = async () => {
    if (!uploadedResume) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume first to get personalized recommendations",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecommendations(true);
    
    try {
      await ensureFlaskAwake();
      const formData = new FormData();
      formData.append('resume', uploadedResume);
      if (jobLocation) {
        formData.append('location', jobLocation);
      }
      // Request only LinkedIn direct links from Flask API
      formData.append('provider', 'linkedin');
      formData.append('only_provider', 'true');

      const response = await fetch(FLASK_ENDPOINTS.UPLOAD_RESUME, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch recommendations');
      }

      if (data && data.success && Array.isArray(data.top_jobs)) {
        const mapped: JobType[] = data.top_jobs.map((j: any, idx: number) => ({
          id: `${idx + 1}`,
          title: j.title || 'Untitled Role',
          company: j.company || 'Unknown Company',
          location: j.location || '—',
          salary: '$0',
          matchPercentage: typeof j.similarity === 'number' ? Math.round(j.similarity) : 0,
          skills: [],
          posted: 'Recently',
          description: j.description || '',
          isNew: true,
          type: 'Full-time',
          experience: '—',
          benefits: [],
          urgency: (j.similarity || 0) >= 85 ? 'High' : (j.similarity || 0) >= 70 ? 'Medium' : 'Low',
          applyLink: (j.apply_link && typeof j.apply_link === 'string' && j.apply_link.trim().length > 0)
            ? j.apply_link
            : `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(`${j.title || ''} ${j.company || ''}`.trim())}`
        }));
        

        setJobs(mapped);
        setCsvDownload(data.csv_download || null);
        setAutoQuery(data.query || null);
      setShowRecommendations(true);
      onJobsUpdated?.(mapped);
      toast({
        title: "Recommendations Generated! 🎯",
          description: `Found ${mapped.length} jobs${data.query ? ` for "${data.query}"` : ''}`,
      });
      } else {
        throw new Error('Unexpected response format from recommender');
      }
      
      // Scroll to recommendations
      setTimeout(() => {
        const element = document.getElementById('job-listings');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "There was an error generating recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const JobCardSkeleton = () => (
    <div className="border-2 border-gray-100 rounded-lg bg-white p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="flex items-center gap-4 text-sm mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (percentage >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-white to-indigo-50">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Job Recommendations</CardTitle>
                <p className="text-gray-600 text-sm">AI-powered job matches based on your resume</p>
              </div>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Location</span>
            <Popover open={isLocationOpen} onOpenChange={(open)=>{ setIsLocationOpen(open); if (!open) setLocationQuery(''); }}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 min-w-[180px] justify-between">
                  <span className="flex items-center gap-2 truncate">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">{jobLocation || 'Select location'}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Search city or type Remote..." value={locationQuery} onValueChange={setLocationQuery} />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {locationQuery && !suggestedLocations.some(l=>l.toLowerCase()===locationQuery.toLowerCase()) && (
                      <CommandItem key="__custom_loc__" onSelect={() => { setJobLocation(locationQuery); setIsLocationOpen(false); setLocationQuery(''); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Use "{locationQuery}"
                      </CommandItem>
                    )}
                    {suggestedLocations.filter(loc=> loc.toLowerCase().includes(locationQuery.toLowerCase())).map((loc) => (
                      <CommandItem key={loc} onSelect={() => { setJobLocation(loc); setIsLocationOpen(false); setLocationQuery(''); }}>
                        <MapPin className="mr-2 h-4 w-4" />
                        {loc}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {jobLocation && (
              <Button variant="ghost" size="sm" onClick={() => setJobLocation('')} className="px-2">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
            }}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isGeneratingRecommendations}
            className="flex items-center gap-2 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploadedResume ? 'Change Resume' : 'Upload Resume'}
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isGeneratingRecommendations}
          >
            {isGeneratingRecommendations ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Jobs
              </>
            ) : (
              <>
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
        </CardHeader>

        {/* Upload / Loading Progress */}
        {(isUploading || isGeneratingRecommendations) && (
          <CardContent className="pt-0">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {isUploading ? 'Uploading resume...' : 'Generating recommendations...'}
                </span>
                {isUploading && (
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                )}
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${isUploading ? uploadProgress : 90}%` }}
                />
              </div>
            </div>
          </CardContent>
        )}

        {/* Uploaded Resume Display with Get Recommendations Button */}
        {uploadedResume && !isUploading && (
          <CardContent className="pt-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Resume Info */}
              <div className="bg-white rounded-lg border border-blue-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{uploadedResume.name}</p>
                    <p className="text-sm text-blue-600">Resume uploaded successfully</p>
                  </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveResume}
            className="h-8 w-8 p-0 hover:bg-blue-100"
          >
            <X className="h-4 w-4 text-blue-500" />
          </Button>
              </div>

              {/* Perfect Get Recommendations Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-center shadow-xl"
              >
                <div className="flex flex-col items-center gap-4">
                  {/* Icon and Title */}
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">Ready for AI-Powered Recommendations?</h3>
                      <p className="text-blue-100 text-sm">Get personalized job matches based on your skills and experience</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="lg"
                    onClick={handleGetRecommendations}
                    disabled={isGeneratingRecommendations || isUploading}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGeneratingRecommendations ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Finding the best matches...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2" />
                        Get AI Recommendations
                      </>
                    )}
                  </Button>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    <div className="flex items-center gap-2 text-blue-100">
                      <Target className="h-4 w-4" />
                      <span className="text-sm">Smart Matching</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Top Companies</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-100">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">Best Opportunities</span>
                    </div>
                  </div>
                </div>
              </motion.div>
        </motion.div>
          </CardContent>
      )}
      </Card>

      {/* Demo Job Recommendation - Show when no resume is uploaded */}
      {!uploadedResume && !showRecommendations && (
          <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Sample Job Recommendation</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Demo Preview
            </Badge>
          </div>
          
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              {/* Demo Job Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {demoJob.title}
                    </h3>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 animate-pulse">
                      Demo
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {demoJob.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {demoJob.location}
                    </div>
              </div>
              </div>
              <div className="text-right">
                  <Badge className={`mb-2 ${getMatchColor(demoJob.matchPercentage)}`}>
                    {demoJob.matchPercentage}% Match
                  </Badge>
                  <div className="text-sm font-medium text-gray-900">{demoJob.salary}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {demoJob.type}
                  </Badge>
              </div>
            </div>

              {/* Demo Job Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">{demoJob.description}</p>

              {/* Demo Job Skills */}
              <div className="mb-4">
              <div className="flex gap-2 flex-wrap">
                  {demoJob.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              </div>

              {/* Demo Call to Action */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Upload your resume to see personalized recommendations like this!</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Our AI will analyze your skills and experience to find the perfect job matches.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Success Message */}
      {showRecommendations && !isGeneratingRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800">AI Analysis Complete! 🎯</h3>
          </div>
          <p className="text-green-700 mb-4">
            We've analyzed your resume and found {totalJobsCount} job matches with up to 95% skill alignment.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Personalized Matches
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Skill-Based Ranking
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Real-time Updates
            </span>
          </div>
        </motion.div>
      )}

      {/* Featured Recommendations Section */}
      {showRecommendations && (
        <motion.div
          id="job-listings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Featured Recommendations</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
              className="text-blue-600 hover:text-blue-700 border-blue-200"
            >
              View All {totalJobsCount} Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Featured Job Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="group"
              >
                <Card className={`border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                  job.isNew ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                }`}>
                  <CardContent className="p-6">
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          {job.isNew && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              New Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`mb-2 ${getMatchColor(job.matchPercentage)}`}>
                          {job.matchPercentage}% Match
                        </Badge>
                        <div className="text-sm font-medium text-gray-900">{job.salary}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {job.type}
                        </Badge>
                      </div>
            </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {job.skills.slice(0, 3).map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            +{job.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                        const link = job.applyLink || '#';
                        if (link && link !== '#') {
                          const w = window.open(link, '_blank', 'noopener,noreferrer');
                          if (w) { w.opener = null; }
                        }
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>
          </motion.div>
        ))}
      </div>
        </motion.div>
      )}

      {/* View All Section */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200"
        >
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-full">
                <Briefcase className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-900">Discover More Opportunities</h3>
                <p className="text-indigo-700">Explore all {totalJobsCount} job recommendations with advanced filtering</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-indigo-600">
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Advanced Filters
              </span>
              <span className="flex items-center gap-1">
                <Search className="h-4 w-4" />
                Smart Search
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Sort Options
              </span>
            </div>

            <Button
              size="lg"
              onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
              className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="h-5 w-5 mr-2" />
              View All {totalJobsCount} Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Actions Section */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
              className="text-blue-600 hover:text-blue-700 border-blue-200"
            >
              View All {totalJobsCount} Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Quick Filter Tabs */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedFilter === filter.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filtered Job Results */}
      {showRecommendations && searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
              className="text-blue-600 hover:text-blue-700 border-blue-200"
            >
              View All Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Filtered Job Cards */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.slice(0, 3).map((job, index) => (
                <motion.div 
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className={`border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${
                    job.isNew ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'
                  }`}>
                    <CardContent className="p-6">
                      {/* Job Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {job.title}
                            </h3>
                            {job.isNew && (
                              <Badge className="bg-green-500 text-white animate-pulse">
                                New Match
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.posted}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`mb-2 ${getMatchColor(job.matchPercentage)}`}>
                            {job.matchPercentage}% Match
                          </Badge>
                          <div className="text-sm font-medium text-gray-900">{job.salary}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {job.type}
                          </Badge>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-4">
                        <div className="flex gap-2 flex-wrap">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge 
                              key={skill} 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                          const link = job.applyLink || '#';
                          if (link && link !== '#') {
                            const w = window.open(link, '_blank', 'noopener,noreferrer');
                            if (w) { w.opener = null; }
                          }
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredJobs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300"
              >
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No jobs found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear Search
                </Button>
              </motion.div>
            )}

            {filteredJobs.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/view-all-jobs', { state: { jobs, csvDownload, query: autoQuery } })}
                  className="text-blue-600 hover:text-blue-700 border-blue-200"
                >
                  View All {filteredJobs.length} Results
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}