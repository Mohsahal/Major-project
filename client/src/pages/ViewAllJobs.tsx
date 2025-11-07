import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Filter, 
  Search, 
  Bookmark, 
  Share2, 
  Eye, 
  Star,
  Briefcase,
  Users,
  Target,
  Zap,
  SlidersHorizontal,
  X,
  FileText,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { FLASK_ENDPOINTS } from "@/config/api";

type JobType = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchPercentage: number;
  skills: string[];
  posted: string;
  description?: string;
  isNew?: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  logo?: string;
  benefits: string[];
  applyLink?: string;
};

export default function ViewAllJobs() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const suggestedLocations: string[] = [
    'Bangalore','Remote','San Francisco','New York','London','Toronto','Sydney','Berlin','Singapore','Dubai'
  ];

  const defaultJobs: JobType[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      matchPercentage: 95,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      posted: '2 hours ago',
      description: 'Join our dynamic team to build cutting-edge web applications. We\'re looking for a passionate developer who loves clean code and user experience.',
      isNew: true,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Stock Options']
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'InnovateLab',
      location: 'New York, NY',
      matchPercentage: 88,
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research'],
      posted: '1 day ago',
      description: 'Lead product development from concept to launch. Work with cross-functional teams to deliver exceptional user experiences.',
      isNew: true,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Flexible PTO', 'Learning Budget']
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'CloudScale Systems',
      location: 'Austin, TX',
      matchPercentage: 82,
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
      posted: '3 days ago',
      description: 'Build and maintain our cloud infrastructure. Ensure high availability and scalability of our systems.',
      isNew: false,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Conference Budget']
    },
    {
      id: '4',
      title: 'UX/UI Designer',
      company: 'Creative Studios',
      location: 'Los Angeles, CA',
      matchPercentage: 78,
      skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Testing'],
      posted: '1 week ago',
      description: 'Create beautiful and intuitive user interfaces. Collaborate with product and engineering teams.',
      isNew: false,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Creative Tools', 'Flexible Hours']
    },
    {
      id: '5',
      title: 'Data Scientist',
      company: 'Analytics Pro',
      location: 'Seattle, WA',
      matchPercentage: 91,
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      posted: '2 days ago',
      description: 'Build predictive models and extract insights from large datasets. Drive data-driven decision making.',
      isNew: true,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Research Budget']
    },
    {
      id: '6',
      title: 'Backend Developer',
      company: 'ServerTech',
      location: 'Boston, MA',
      matchPercentage: 85,
      skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
      posted: '4 days ago',
      description: 'Build scalable backend services and APIs. Work with modern technologies and best practices.',
      isNew: false,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Learning Budget']
    },
    {
      id: '7',
      title: 'Mobile Developer',
      company: 'AppWorks',
      location: 'Miami, FL',
      matchPercentage: 79,
      skills: ['React Native', 'iOS', 'Android', 'Firebase'],
      posted: '5 days ago',
      description: 'Develop cross-platform mobile applications. Create engaging user experiences for iOS and Android.',
      isNew: false,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Device Budget']
    },
    {
      id: '8',
      title: 'QA Engineer',
      company: 'QualityFirst',
      location: 'Denver, CO',
      matchPercentage: 76,
      skills: ['Selenium', 'Jest', 'Cypress', 'Test Automation'],
      posted: '1 week ago',
      description: 'Ensure software quality through comprehensive testing. Develop and maintain test automation frameworks.',
      isNew: false,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Training Budget']
    },
    {
      id: '9',
      title: 'Full Stack Developer',
      company: 'WebSolutions',
      location: 'Chicago, IL',
      matchPercentage: 87,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      posted: '3 days ago',
      description: 'Build end-to-end web applications. Work on both frontend and backend development.',
      isNew: true,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Conference Budget']
    },
    {
      id: '10',
      title: 'Machine Learning Engineer',
      company: 'AITech',
      location: 'San Diego, CA',
      matchPercentage: 93,
      skills: ['TensorFlow', 'PyTorch', 'Python', 'MLOps'],
      posted: '1 day ago',
      description: 'Build and deploy machine learning models. Work on cutting-edge AI technologies.',
      isNew: true,
      type: 'Full-time',
      benefits: ['Health Insurance', '401k', 'Remote Work', 'Research Budget']
    }
  ];

  const [jobs] = useState<JobType[]>(Array.isArray(location?.state?.jobs) && location.state.jobs.length > 0 ? location.state.jobs : defaultJobs);
  const csvDownload: string | null = null; // CSV removed in favor of location-based query

  const filters = [
    { id: 'all', label: 'All Jobs', count: jobs.length }
  ];

  const jobTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'Full-time', label: 'Full-time' },
    { id: 'Part-time', label: 'Part-time' },
    { id: 'Contract', label: 'Contract' },
    { id: 'Remote', label: 'Remote' }
  ];

  const sortOptions = [
    { id: 'match', label: 'Best Match' },
    { id: 'posted', label: 'Recently Posted' }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'new' && job.isNew) ||
      (selectedFilter === 'high-match' && job.matchPercentage >= 90) ||
      (selectedFilter === 'remote' && job.type === 'Remote');
    
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || job.type === selectedType;
    
    return matchesFilter && matchesSearch && matchesType;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.matchPercentage - a.matchPercentage;
      case 'posted':
        return new Date(b.posted).getTime() - new Date(a.posted).getTime();
      case 'experience':
        return parseInt(b.experience) - parseInt(a.experience);
      default:
        return 0;
    }
  });


  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (percentage >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const clearAllFilters = () => {
    setSelectedFilter('all');
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Job Recommendations</h1>
                <p className="text-gray-600">Discover your perfect career opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <PopoverTrigger asChild>
                 
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search location..." />
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {suggestedLocations.map((loc) => (
                        <CommandItem key={loc} onSelect={() => setSearchQuery(loc)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          {loc}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              {/* CSV download removed per requirements */}
              <Button
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-lg shadow-md p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Jobs, companies, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Job Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {jobTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{sortedJobs.length}</span> of <span className="font-semibold">{jobs.length}</span> jobs
              </p>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              <AnimatePresence>
                {sortedJobs.map((job, index) => (
                  <motion.div 
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Card className="border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg cursor-pointer">
                      <CardContent className="p-6">
                        {/* Job Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                              {job.title}
                            </h3>
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
                            <Badge variant="outline" className="text-xs mt-1">
                              {job.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <span>{job.location}</span>
                          <span className="text-gray-300">•</span>
                          <span>{job.type}</span>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <div className="flex gap-2 flex-wrap">
                            {job.skills.map((skill) => (
                              <Badge 
                                key={skill} 
                                variant="outline" 
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        {job.description && (
                          <p className="text-gray-600 mb-4 leading-relaxed">{job.description}</p>
                        )}

                        {/* Benefits */}
                        {job.benefits && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                            <div className="flex gap-2 flex-wrap">
                              {job.benefits.map((benefit) => (
                                <Badge key={benefit} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
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
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedJobs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300"
                >
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

