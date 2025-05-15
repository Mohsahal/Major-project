
import { Mic, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type InterviewType = {
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  duration: string;
  color: string;
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
      color: "bg-indigo-500"
    },
    {
      title: "Behavioral Questions",
      category: "Soft Skills",
      difficulty: "Easy",
      questions: 12,
      duration: "25 mins",
      color: "bg-green-500"
    },
    {
      title: "System Design",
      category: "Technical",
      difficulty: "Hard",
      questions: 8,
      duration: "45 mins",
      color: "bg-purple-500"
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
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-indigo-900">Mock Interviews</h2>
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50" onClick={handleNavigateToInterview}>
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {interviews.map((interview, index) => (
          <div 
            key={index} 
            className="border border-gray-100 rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300  hover:translate-y-[-3px]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`h-2 w-full ${interview.color}`}></div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium group-hover:text-indigo-600 transition-all duration-200">
                  {interview.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(interview.difficulty)}`}>
                  {interview.difficulty}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                <p>{interview.category}</p>
                <p>{interview.questions} questions • {interview.duration}</p>
              </div>
              <Button 
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 group shadow-sm"
                onClick={handleNavigateToInterview}
              >
                <Play className="h-4 w-4 mr-2 group-hover:animate-pulse" /> Start Practice
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white flex items-center justify-between animate-pulse-slow">
        <div className="flex items-center">
          <Mic className="h-8 w-8 mr-3 animate-float" />
          <div>
            <h3 className="font-bold">AI Interview Coach</h3>
            <p className="text-sm opacity-90">Get real-time feedback on your interview responses</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="whitespace-nowrap bg-white text-indigo-700 hover:bg-gray-100" onClick={handleNavigateToInterview}>
          Try Now
        </Button>
      </div>
    </div>
  );
}
