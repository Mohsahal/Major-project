import { useState, useRef } from "react";
import Sidebar from "@/components/Dashboard/Sidebar"
import StatsOverview from "@/components/Dashboard/StatsOverview";
import JobRecommendations from "@/components/Dashboard/JobRecommendations";
import ResumeBuilder from "@/components/Dashboard/ResumeBuilder";
import SkillGapAnalysis from "@/components/Dashboard/SkillGapAnalysis";
import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Index from "../components/MockInterview/Mockindex";
import Header from "@/components/Header";


export default function Dashboard() {
  const mainRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jobMatches, setJobMatches] = useState<number>(0);
  const navigate = useNavigate();

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      
      <main className="flex-1 overflow-y-auto" ref={mainRef}>
        <Header scrollContainerRef={mainRef} />
        <div className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold animate-fade-in">Career Dashboard</h1>
                <p className="text-gray-500 animate-fade-in" style={{ animationDelay: "100ms" }}>Welcome back! Here's what's happening with your career journey.</p>
              </div>
            </div>
            
            <StatsOverview jobMatches={jobMatches} />

            
            <Tabs defaultValue="all" className="mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="border-b border-gray-200">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="all" className="data-[state=active]:border-b-2 data-[state=active]:border-career-blue rounded-none data-[state=active]:shadow-none">
                    All Features
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="data-[state=active]:border-b-2 data-[state=active]:border-career-blue rounded-none data-[state=active]:shadow-none">
                    Jobs
                  </TabsTrigger>
                  <TabsTrigger value="resume" className="data-[state=active]:border-b-2 data-[state=active]:border-career-blue rounded-none data-[state=active]:shadow-none">
                    Resume
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="data-[state=active]:border-b-2 data-[state=active]:border-career-blue rounded-none data-[state=active]:shadow-none">
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="interviews" className="data-[state=active]:border-b-2 data-[state=active]:border-career-blue rounded-none data-[state=active]:shadow-none">
                    Interviews
                  </TabsTrigger>
                </TabsList>
              </div>


              <TabsContent value="all" className="mt-6 animate-fade-in">
                <div className="space-y-8">
                  <div id="job-recommendations">
                    <JobRecommendations onJobsUpdated={(list)=> setJobMatches(list.length)} />
                  </div>
                  <div id="resume-builder">
                    <ResumeBuilder />
                  </div>
                  <div id="skill-gap">
                    <SkillGapAnalysis />
                    {/* <div className="flex justify-end mt-4">
                      <button
                        className="text-indigo-600 text-sm hover:underline"
                        onClick={()=> navigate('/skill-gap')}
                      >
                        Open detailed Skill Gap Analyzer →
                      </button>
                    </div> */}
                  </div>
                  <div id="mock-interviews">
                   <Index/>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="jobs">
                <div className="mt-6">
                  <JobRecommendations />
                </div>
              </TabsContent>
              
              <TabsContent value="resume">
                <div className="mt-6">
                  <ResumeBuilder />
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <div className="mt-6">
                  <SkillGapAnalysis />
                </div>
              </TabsContent>
              
              <TabsContent value="interviews">
                <div className="mt-6">
                  <Index/>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
