import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { defaultResumeData } from '@/data/defaultResumeData';

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

const ResumeBuilder = () => {
  const { getToken } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("build");
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState("simple");
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResume(id);
    }
  }, [id]);

  const fetchResume = async (resumeId) => {
    try {
      setIsLoading(true);
      const token = getToken();
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to edit the resume",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const data = await response.json();
      setResumeData(data);
      setSelectedTemplate(data.template);
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResume = async () => {
    try {
      setIsSaving(true);
      const token = getToken();
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to save your resume",
          variant: "destructive"
        });
        return;
      }

      const resumeToSave = {
        ...resumeData,
        template: selectedTemplate,
        title: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}'s Resume`,
        lastModified: new Date().toISOString()
      };

      const response = await fetch(`http://localhost:5000/api/resumes${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: id ? "Resume updated successfully" : "Resume saved successfully",
      });

      // Redirect to My Resumes page after saving
      navigate('/my-resumes');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PlainLayout>
      <div className="container mx-auto mt-14 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{id ? 'Edit Resume' : 'Resume Builder'}</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSaveResume} 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {id ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {id ? 'Update Resume' : 'Save Resume'}
                </>
              )}
            </Button>
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
