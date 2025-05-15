import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Skill = {
  name: string;
  current: number;
  required: number;
  category: string;
};

export default function SkillGapAnalysis() {
  const skills: Skill[] = [
    { name: "React", current: 85, required: 90, category: "Technical" },
    { name: "TypeScript", current: 70, required: 85, category: "Technical" },
    { name: "UI/UX Design", current: 65, required: 80, category: "Design" },
    { name: "System Architecture", current: 60, required: 75, category: "Technical" },
    { name: "Team Leadership", current: 75, required: 70, category: "Soft Skills" }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fade-in lg:w-1/2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Skill Gap Analysis</h2>
        <Button variant="ghost" size="sm" className="text-career-purple">
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {skills.map((skill, index) => (
          <div 
            key={skill.name}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs ml-2 text-gray-500">{skill.category}</span>
              </div>
              <div className="text-sm">
                <span className={skill.current >= skill.required ? "text-green-600" : "text-amber-600"}>
                  {skill.current}%
                </span>
                <span className="text-gray-400"> / {skill.required}% required</span>
              </div>
            </div>
            <div className="relative">
              <Progress value={skill.current} className="h-2" />
              <div 
                className="absolute top-0 h-4 w-0.5 bg-gray-400 transform -translate-y-1"
                style={{ left: `${skill.required}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
        <h3 className="font-medium text-career-purple mb-2">Recommended Learning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="#" className="text-sm text-gray-700 hover:text-career-purple flex items-center justify-between p-2 bg-white rounded-md border border-purple-100 hover:shadow-sm transition-all duration-200">
            <span>Advanced TypeScript Masterclass</span>
            <ArrowRight className="h-3 w-3" />
          </a>
          <a href="#" className="text-sm text-gray-700 hover:text-career-purple flex items-center justify-between p-2 bg-white rounded-md border border-purple-100 hover:shadow-sm transition-all duration-200">
            <span>System Design Principles</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
