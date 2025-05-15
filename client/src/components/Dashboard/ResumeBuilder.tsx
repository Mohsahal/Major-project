
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type ResumeTemplate = {
  id: number;
  name: string;
  image: string;
  color: string;
};

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

  const resumeTemplates: ResumeTemplate[] = [
    { id: 1, name: "Professional", image: "https://placehold.co/200x280/e2e8f0/64748b?text=Professional", color: "border-career-blue" },
    { id: 2, name: "Modern", image: "https://placehold.co/200x280/e2e8f0/64748b?text=Modern", color: "border-career-purple" },
    { id: 3, name: "Creative", image: "https://placehold.co/200x280/e2e8f0/64748b?text=Creative", color: "border-career-teal" },
  ];

  const handleCreateNew = () => {
    navigate('/resume');
  };

  const handleUploadExisting = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        toast({
          title: "Resume Uploaded",
          description: `File "${file.name}" has been uploaded and will be processed soon.`,
        });
        navigate('/resume');
      }
    };
    fileInput.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-fade-in">
      <h2 className="text-xl font-bold mb-6">Resume Builder</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-700">Start Building Your Resume</h3>
          
          <div className="flex gap-4 mb-4">
            <Button 
              className="flex items-center gap-2 bg-career-blue hover:bg-career-blue/90"
              onClick={handleCreateNew}
            >
              <FileText className="h-4 w-4" /> Create New
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleUploadExisting}
            >
              <Upload className="h-4 w-4" /> Upload Existing
            </Button>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-medium text-career-blue mb-2">Resume Tips</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-career-blue mr-2">•</span>
                Use action verbs to describe your achievements
              </li>
              <li className="flex items-start">
                <span className="text-career-blue mr-2">•</span>
                Customize your resume for each job application
              </li>
              <li className="flex items-start">
                <span className="text-career-blue mr-2">•</span>
                Quantify your accomplishments with numbers
              </li>
              <li className="flex items-start">
                <span className="text-career-blue mr-2">•</span>
                Keep your resume concise and relevant
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700 mb-4">Choose a Template</h3>
          <div className="grid grid-cols-3 gap-3">
            {resumeTemplates.map((template, index) => (
              <div 
                key={template.id} 
                className={`resume-template cursor-pointer ${activeTemplate === template.id ? `border-2 ${template.color}` : 'border-gray-200'}`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setActiveTemplate(template.id)}
              >
                <img 
                  src={template.image} 
                  alt={template.name} 
                  className="w-full object-cover"
                />
                <div className="p-2 text-center text-sm">{template.name}</div>
              </div>
            ))}
            <div 
              className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-career-blue transition-all duration-300 h-full"
              style={{ animationDelay: "300ms" }}
            >
              <Plus className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
