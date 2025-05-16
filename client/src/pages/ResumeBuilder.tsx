import React, { useState, useCallback } from 'react';
import PlainLayout from '@/components/layout/PlainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import SimpleTemplate from '@/components/Resume/templates/SimpleTemplate';
import ModernTemplate from '@/components/Resume/templates/ModernTemplate';
import MinimalTemplate from '@/components/Resume/templates/MinimalTemplate';
import TemplateSelector from '@/components/Resume/TemplateSelector';
import ResumeForm from '@/components/Resume/templates/ResumeForm';
import { 
  Download, 
  Share2, 
  Save, 
  Facebook, 
  Linkedin, 
  Mail,
  Link
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ResumeData } from '@/types/resume';

const templateThumbnails = {
  simple: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Simple',
  modern: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Modern',
  minimal: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Minimal'
};

const templates = [
  {
    id: "simple",
    name: "Simple Classic",
    description: "Traditional resume layout with clear sections",
    thumbnail: templateThumbnails.simple,
  },
  {
    id: "modern",
    name: "Modern Sidebar",
    description: "Contemporary design with sidebar for key info",
    thumbnail: templateThumbnails.modern,
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Minimalist design focusing on content clarity",
    thumbnail: templateThumbnails.minimal,
  },
];

const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    jobTitle: "Frontend Developer",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    location: "San Francisco, CA",
  },
  summary: "Recent computer science graduate with strong foundation in web development and a passion for creating user-friendly interfaces. Seeking entry-level frontend developer position to apply my skills in React, JavaScript, and responsive design.",
  skills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS"],
  experience: [
    {
      position: "Frontend Development Intern",
      company: "TechStart Solutions",
      location: "San Francisco, CA",
      startDate: "Jun 2022",
      endDate: "Aug 2022",
      description: "Developed and maintained code for client websites utilizing HTML, CSS, and JavaScript. Collaborated with senior developers to implement responsive designs and optimize website performance."
    },
    {
      position: "Web Development Assistant",
      company: "University IT Department",
      location: "San Francisco, CA",
      startDate: "Sep 2021",
      endDate: "May 2022",
      description: "Assisted in maintaining the university website, created web content, and provided technical support for department websites."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      date: "2019 - 2023",
      description: "Relevant coursework: Web Development, Data Structures, UI/UX Design"
    }
  ],
  projects: [
    {
      name: "E-commerce Website",
      description: "Developed a responsive e-commerce website using React and Firebase, implementing features like user authentication, product filtering, and shopping cart functionality.",
      date: "Jan 2023 - Mar 2023",
      link: "https://github.com/johndoe/ecommerce-project"
    },
    {
      name: "Weather Dashboard",
      description: "Created a weather dashboard application using OpenWeatherMap API that displays current weather and 5-day forecast for searched cities.",
      date: "Nov 2022 - Dec 2022",
      link: "https://github.com/johndoe/weather-app"
    }
  ],
  certifications: [
    {
      name: "Frontend Web Development",
      issuer: "Udemy",
      date: "Jun 2022",
      description: "Completed 40-hour course covering HTML, CSS, JavaScript, and React"
    }
  ]
};

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState("build");
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState("simple");

  // Use a callback to properly handle the update
  const handleUpdateResume = useCallback((data: ResumeData) => {
    setResumeData(data);
  }, []);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    toast({
      title: "Template updated",
      description: "Your resume template has been changed",
    });
  };

  const handleSaveResume = () => {
    toast({
      title: "Resume saved",
      description: "Your resume has been saved successfully",
    });
  };

  const handleAIGenerate = () => {
    toast({
      title: "AI Generation in progress",
      description: "Generating resume content based on your profile...",
    });
    // This would typically trigger an API call to an AI service
  };

  const handleDownload = () => {
    // Hide UI elements that shouldn't be printed
    const originalTitle = document.title;
    document.title = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName} - Resume`;
    
    // Use setTimeout to ensure the print dialog opens after the UI is hidden
    setTimeout(() => {
      window.print();
      // Restore title after printing
      document.title = originalTitle;
    }, 100);
  };

  const handleShare = (platform: string) => {
    const name = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`;
    const title = `${name}'s Resume`;
    const url = window.location.href;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}: ${url}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out my resume: ${url}`)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copied",
            description: "Resume link copied to clipboard",
          });
        });
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: title,
            url: url,
          }).catch((error) => console.log('Error sharing', error));
        } else {
          toast({
            title: "Sharing not supported",
            description: "Direct sharing is not supported in this browser",
          });
        }
    }
  };

  return (
    <PlainLayout>
      <div className="space-y-6 animate-fade-in mt-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-gray-600 mt-1">Create professional resumes in minutes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveResume} className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  <Facebook className="h-4 w-4 mr-2" />
                  <span>Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share h-4 w-4 mr-2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16 6 12 2 8 6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                  <span>WhatsApp</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  <span>LinkedIn</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  <Link className="h-4 w-4 mr-2" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="build">Build Resume</TabsTrigger>
            <TabsTrigger value="templates">Choose Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="build" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resume Form */}
              <div className="order-2 lg:order-1">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <ResumeForm 
                      initialData={resumeData}
                      onUpdate={handleUpdateResume}
                      onGenerateAI={handleAIGenerate}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Resume Preview */}
              <div className="order-1 lg:order-2">
                <Card className="shadow-sm">
                  <CardContent className="p-0 h-[800px] overflow-y-auto">
                    <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex justify-between items-center">
                      <h3 className="font-semibold">Resume Preview</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setActiveTab("templates")}
                      >
                        Change Template
                      </Button>
                    </div>
                    <div className="p-6">
                      <div className="border shadow-sm h-full">
                        {selectedTemplate === "simple" && <SimpleTemplate data={resumeData} />}
                        {selectedTemplate === "modern" && <ModernTemplate data={resumeData} />}
                        {selectedTemplate === "minimal" && <MinimalTemplate data={resumeData} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="animate-fade-in">
            <Card>
              <CardContent className="p-6">
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelectTemplate={handleTemplateChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PlainLayout>
  );
};

export default ResumeBuilder;
