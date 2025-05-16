import React, { useState, useCallback } from 'react';
import PlainLayout from '@/components/layout/PlainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import SimpleTemplate from '@/components/Resume/templates/SimpleTemplate';
import ModernTemplate from '@/components/Resume/templates/ModernTemplate';
import MinimalTemplate from '@/components/Resume/templates/MinimalTemplate';
import ProfessionalTemplate from '@/components/Resume/templates/ProfessionalTemplate';
import CreativeTemplate from '@/components/Resume/templates/CreativeTemplate';
import ExecutiveTemplate from '@/components/Resume/templates/ExecutiveTemplate';
import TemplateSelector from '@/components/Resume/TemplateSelector';
import ResumeForm from '@/components/Resume/ResumeForm';
import ResumeDownload from '@/components/Resume/ResumeDownload';
import ResumeShare from '@/components/Resume/ResumeShare';
import { 
  Share2, 
  Save, 
  Facebook, 
  Linkedin, 
  Mail,
  Link,
  MessageCircle,
  Twitter,
  Github,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const templateThumbnails = {
  simple: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Simple',
  modern: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Modern',
  minimal: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Minimal',
  professional: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Professional',
  creative: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Creative',
  executive: 'https://placehold.co/200x250/e2e8f0/1e293b?text=Executive'
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
  {
    id: "professional",
    name: "Professional",
    description: "Polished design with emphasis on experience and skills",
    thumbnail: templateThumbnails.professional,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Modern and artistic layout with visual elements",
    thumbnail: templateThumbnails.creative,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sophisticated design for senior professionals",
    thumbnail: templateThumbnails.executive,
  },
];

const defaultResumeData = {
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
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState("simple");
  const [isSharing, setIsSharing] = useState(false);

  const handleUpdateResume = useCallback((data) => {
    setResumeData(data);
  }, []);

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    toast({
      title: "Template updated",
      description: "Your resume template has been changed",
    });
  };

  const generateResumeText = () => {
    const { personalInfo, summary, skills, experience, education, projects, certifications } = resumeData;
    
    let text = `${personalInfo.firstName} ${personalInfo.lastName}\n`;
    text += `${personalInfo.jobTitle}\n`;
    text += `Email: ${personalInfo.email}\n`;
    text += `Phone: ${personalInfo.phone}\n`;
    if (personalInfo.location) {
      text += `Location: ${personalInfo.location}\n`;
    }
    text += '\n';

    if (summary) {
      text += `SUMMARY\n${summary}\n\n`;
    }

    if (skills && skills.length > 0) {
      text += `SKILLS\n${skills.join(', ')}\n\n`;
    }

    if (experience && experience.length > 0) {
      text += 'EXPERIENCE\n';
      experience.forEach(exp => {
        text += `${exp.position} at ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.endDate}\n`;
        text += `${exp.location}\n`;
        text += `${exp.description}\n\n`;
      });
    }

    if (education && education.length > 0) {
      text += 'EDUCATION\n';
      education.forEach(edu => {
        text += `${edu.degree}\n`;
        text += `${edu.institution}\n`;
        text += `${edu.date}\n`;
        if (edu.description) {
          text += `${edu.description}\n`;
        }
        text += '\n';
      });
    }

    if (projects && projects.length > 0) {
      text += 'PROJECTS\n';
      projects.forEach(project => {
        text += `${project.name}\n`;
        text += `${project.date}\n`;
        text += `${project.description}\n`;
        if (project.link) {
          text += `Link: ${project.link}\n`;
        }
        text += '\n';
      });
    }

    if (certifications && certifications.length > 0) {
      text += 'CERTIFICATIONS\n';
      certifications.forEach(cert => {
        text += `${cert.name}\n`;
        text += `${cert.issuer}\n`;
        text += `${cert.date}\n`;
        if (cert.description) {
          text += `${cert.description}\n`;
        }
        text += '\n';
      });
    }

    return text;
  };

  const handleShare = async (platform) => {
    try {
      setIsSharing(true);
      const resumeText = generateResumeText();
      const resumeTitle = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}'s Resume`;
      const shareText = `Check out ${resumeData.personalInfo.firstName}'s resume!`;
      const resumeUrl = window.location.href;

      let shareUrl = '';
      let shareData = {};

      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resumeUrl)}&quote=${encodeURIComponent(shareText)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resumeUrl)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resumeUrl)}&summary=${encodeURIComponent(shareText)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${resumeText}\n\nView full resume: ${resumeUrl}`)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(resumeTitle)}&body=${encodeURIComponent(`${shareText}\n\n${resumeText}\n\nView full resume: ${resumeUrl}`)}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n\n${resumeText}\n\nView full resume: ${resumeUrl}`);
          toast({
            title: "Resume copied!",
            description: "Resume content has been copied to clipboard",
          });
          setIsSharing(false);
          return;
        default:
          return;
      }

      if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      }

      toast({
        title: "Resume shared!",
        description: `Your resume has been shared via ${platform}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share failed",
        description: "Failed to share resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'simple':
        return <SimpleTemplate data={resumeData} />;
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      case 'minimal':
        return <MinimalTemplate data={resumeData} />;
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      case 'creative':
        return <CreativeTemplate data={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate data={resumeData} />;
      default:
        return <SimpleTemplate data={resumeData} />;
    }
  };

  return (
    <PlainLayout>
      <div className="container mx-auto mt-14 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Resume Builder</h1>
          <div className="flex items-center gap-2">
            <ResumeShare resumeData={resumeData} selectedTemplate={selectedTemplate} />
            <ResumeDownload resumeData={resumeData} selectedTemplate={selectedTemplate} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="build">Build Resume</TabsTrigger>
            <TabsTrigger value="templates">Choose Template</TabsTrigger>
          </TabsList>
          
          <TabsContent value="build" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="order-2 lg:order-1">
                <Card className="shadow-sm">
                  <CardContent className="p-6">
                    <ResumeForm 
                      initialData={resumeData}
                      onUpdate={handleUpdateResume}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="order-1 lg:order-2">
                <Card className="shadow-sm sticky top-4">
                  <CardContent className="p-6">
                    <div className="resume-preview">
                      {renderTemplate()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="animate-fade-in">
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleTemplateChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PlainLayout>
  );
};

export default ResumeBuilder;