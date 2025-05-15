import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type JobType = {
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  skills: string[];
  posted: string;
};

export default function JobRecommendations() {
  const jobs: JobType[] = [
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
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Job Recommendations</h2>
        <Button variant="ghost" size="sm" className="text-career-blue">
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div 
            key={index} 
            className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold group-hover:text-career-blue transition-all duration-200">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
              </div>
              <div className="text-right">
                <div className="bg-green-50 text-green-700 font-medium rounded-full px-2 py-1 text-xs inline-block">
                  {job.matchPercentage}% Match
                </div>
                <p className="text-sm text-gray-500 mt-1">{job.salary}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-blue-50 text-career-blue border-blue-100">
                    {skill}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-gray-500">{job.posted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
