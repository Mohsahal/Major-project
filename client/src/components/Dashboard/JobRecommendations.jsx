import {
  ArrowRight,
  Loader2,
  Star,
  Upload,
  FileText,
  X,
  MapPin,
  Building2,
  Clock,
  TrendingUp,
  Search,
  Eye,
  Sparkles,
  Zap,
  Target,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { submitResumeForJobs, ensureFlaskAwake, warmFlaskJobRecommender } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";

const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const getMatchColor = (pct) =>
  pct >= 90 ? "bg-green-100 text-green-700 border-green-200" :
  pct >= 80 ? "bg-blue-100 text-blue-700 border-blue-200" :
  pct >= 70 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
  "bg-gray-100 text-gray-700 border-gray-200";

const getJobUrl = (job) =>
  job.job_url || job.apply_url || job.apply_link || job.applyLink || "#";

const isRemote = (job) => {
  const loc = (job.location || "").toLowerCase();
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  return loc.includes("remote") || title.includes("remote") || desc.includes("remote") ||
    loc.includes("work from home") || desc.includes("work from home");
};

const isHybrid = (job) => {
  const loc = (job.location || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();
  return loc.includes("hybrid") || desc.includes("hybrid");
};

const mapApiJob = (j, idx) => ({
  id: j.id || `${idx + 1}`,
  title: j.title || "Untitled Role",
  company: j.company || "Unknown Company",
  location: j.location || "—",
  matchPercentage: typeof j.similarity === "number" ? Math.round(j.similarity) : 0,
  skills: Array.isArray(j.skills_matched) ? j.skills_matched : (j.skills_required || []),
  posted: j.posted_time || "Recently",
  description: j.description || "",
  isNew: true,
  type: "Full-time",
  urgency: (j.similarity || 0) >= 85 ? "High" : (j.similarity || 0) >= 70 ? "Medium" : "Low",
  applyLink: getJobUrl(j),
  job_url: j.job_url,
  apply_url: j.apply_url,
  apply_link: j.apply_link,
});

const DEMO_JOB = {
  id: "demo",
  title: "Full Stack Developer",
  company: "DemoTech Solutions",
  location: "Remote / Anywhere",
  matchPercentage: 85,
  skills: ["React", "Node.js", "TypeScript", "MongoDB"],
  posted: "1 week ago",
  description: "This is a demo job recommendation. Upload your resume to get personalized AI-powered job matches!",
  isNew: false,
  type: "Full-time",
  experience: "3+ years",
  urgency: "Medium",
};

function JobCard({ job, onViewDetails }) {
  const url = getJobUrl(job);
  const handleClick = () => {
    if (url && url !== "#") {
      const w = window.open(url, "_blank", "noopener,noreferrer");
      if (w) w.opener = null;
    } else {
      onViewDetails?.();
    }
  };
  return (
    <Card className={`border-2 transition-all duration-300 hover:shadow-lg cursor-pointer ${job.isNew ? "border-blue-200 bg-blue-50/30" : "border-gray-100 hover:border-blue-200"}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">{job.title}</h3>
              {job.isNew && <Badge className="bg-green-500 text-white animate-pulse">New Match</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
            </div>
          </div>
          <div className="text-right">
            <Badge className={`mb-2 ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}% Match</Badge>
            <Badge variant="outline" className="text-xs mt-1">{job.type}</Badge>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            {(job.skills || []).slice(0, 3).map((s) => (
              <Badge key={s} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{s}</Badge>
            ))}
            {(job.skills?.length || 0) > 3 && <Badge variant="outline" className="text-xs text-gray-500">+{(job.skills?.length || 0) - 3} more</Badge>}
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleClick}>
            <Eye className="h-4 w-4 mr-2" /> View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCardSkeleton() {
  return (
    <div className="border-2 border-gray-100 rounded-lg bg-white p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-5 w-16 mb-2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export default function JobRecommendations({ onJobsUpdated }) {
  const [jobs, setJobs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [csvDownload, setCsvDownload] = useState(null);
  const [autoQuery, setAutoQuery] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    warmFlaskJobRecommender();
  }, []);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF, DOCX or TXT file", variant: "destructive" });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Please upload a file smaller than 5MB", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const file = selectedFile || fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: "No resume selected", description: "Please select a resume file first", variant: "destructive" });
      return;
    }
    if (!validateFile(file)) return;

    setIsSubmitting(true);
    try {
      await ensureFlaskAwake();
      const data = await submitResumeForJobs(file);
      if (data?.success && Array.isArray(data.top_jobs)) {
        const mapped = data.top_jobs.map(mapApiJob);
        setJobs(mapped);
        setCsvDownload(data.csv_download ?? null);
        setAutoQuery(data.query ?? null);
        setShowResults(true);
        onJobsUpdated?.(mapped);
        toast({ title: "Recommendations Generated!", description: `Found ${mapped.length} jobs${data.query ? ` for "${data.query}"` : ""}` });
        setTimeout(() => document.getElementById("job-listings")?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setShowResults(false);
    setJobs([]);
    onJobsUpdated?.([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setSelectedFile(f);
      setShowResults(false);
    }
  };

  const filters = [
    { id: "all", label: "All Jobs", count: jobs.length },
    { id: "remote", label: "Remote", count: jobs.filter(isRemote).length },
    { id: "hybrid", label: "Hybrid", count: jobs.filter(isHybrid).length },
    { id: "high-match", label: "High Match (90%+)", count: jobs.filter((j) => j.matchPercentage >= 90).length },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchFilter = selectedFilter === "all" ||
      (selectedFilter === "remote" && isRemote(job)) ||
      (selectedFilter === "hybrid" && isHybrid(job)) ||
      (selectedFilter === "high-match" && job.matchPercentage >= 90);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || [job.title, job.company, job.location, ...(job.skills || [])].some((s) => String(s).toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const featuredJobs = jobs.slice(0, 2);
  const viewAllState = { jobs, csvDownload, query: autoQuery };
  const goToViewAll = () => navigate("/view-all-jobs", { state: viewAllState });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting}>
                {selectedFile ? "Change Resume" : "Upload Resume"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              <Button size="sm" onClick={goToViewAll} disabled={isSubmitting || jobs.length === 0}>
                View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {isSubmitting && (
          <CardContent className="pt-0">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Generating recommendations...</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-[90%]" />
              </div>
            </div>
          </CardContent>
        )}

        {selectedFile && !isSubmitting && (
          <CardContent className="pt-0">
            <form onSubmit={handleFormSubmit}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-lg border border-blue-200 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{selectedFile.name}</p>
                      <p className="text-sm text-blue-600">Ready to analyze</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0 hover:bg-blue-100">
                    <X className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-center shadow-xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white">Ready for AI-Powered Recommendations?</h3>
                        <p className="text-blue-100 text-sm">Get personalized job matches based on your skills and experience</p>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Finding matches...</>
                      ) : (
                        <><Zap className="h-5 w-5 mr-2" /> Get AI Recommendations</>
                      )}
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl text-blue-100 text-sm">
                      <span className="flex items-center justify-center gap-2"><Target className="h-4 w-4" /> Smart Matching</span>
                      <span className="flex items-center justify-center gap-2"><Users className="h-4 w-4" /> Top Companies</span>
                      <span className="flex items-center justify-center gap-2"><Briefcase className="h-4 w-4" /> Best Opportunities</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </form>
          </CardContent>
        )}
      </Card>

      {!selectedFile && !showResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Sample Job Recommendation</h2>
            <Badge variant="outline" className="text-blue-600 border-blue-200">Demo Preview</Badge>
          </div>
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardContent className="p-6">
              <JobCard job={DEMO_JOB} onViewDetails={() => toast({ title: "Upload your resume", description: "Select a file above to see personalized matches" })} />
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 text-center">
                <p className="text-blue-600 font-medium flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" /> Upload your resume to see personalized recommendations like this!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showResults && !isSubmitting && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-full"><Sparkles className="h-6 w-6 text-green-600" /></div>
            <h3 className="text-lg font-semibold text-green-800">AI Analysis Complete!</h3>
          </div>
          <p className="text-green-700 mb-4">We found {jobs.length} job matches with up to 95% skill alignment.</p>
          <div className="flex items-center justify-center gap-4 text-sm text-green-600">
            <span className="flex items-center gap-1"><Target className="h-4 w-4" /> Personalized Matches</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Skill-Based Ranking</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Real-time Updates</span>
          </div>
        </motion.div>
      )}

      {showResults && (
        <motion.div id="job-listings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Featured Recommendations</h2>
            <Button variant="outline" size="sm" onClick={goToViewAll} className="text-blue-600 border-blue-200">
              View All {jobs.length} Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {isSubmitting ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <JobCardSkeleton /><JobCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredJobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-full"><Briefcase className="h-8 w-8 text-indigo-600" /></div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-900">Discover More Opportunities</h3>
                  <p className="text-indigo-700">Explore all {jobs.length} recommendations with advanced filtering</p>
                </div>
              </div>
              <Button size="lg" onClick={goToViewAll} className="bg-indigo-600 hover:bg-indigo-700">
                <Eye className="h-5 w-5 mr-2" /> View All {jobs.length} Jobs <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-2 overflow-x-auto">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${selectedFilter === f.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {f.label} <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{f.count}</span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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

          {searchQuery && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredJobs.slice(0, 3).map((job, i) => (
                    <motion.div key={job.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredJobs.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No jobs found</h3>
                    <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
                  </div>
                )}
                {filteredJobs.length > 3 && (
                  <div className="text-center">
                    <Button variant="outline" onClick={goToViewAll}>View All {filteredJobs.length} Results</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
