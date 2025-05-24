import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ResumeBuilderLayout from '@/components/layout/ResumeBuilderLayout';
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
import { 
  Save, 
  Facebook, 
  Linkedin, 
  Mail,
  Link,
  MessageCircle,
  Twitter,
  Github,
  Loader2,
  ArrowLeft
} from 'lucide-react';
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
    <ResumeBuilderLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 mt-14">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500">
              {id ? 'Edit Resume' : 'Resume Builder'}
            </h1>
            <p className="text-gray-500 mt-2">Create a professional resume that stands out</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={handleSaveResume} 
              disabled={isSaving}
              variant="outline"
              className="flex items-center gap-2 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
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
            <ResumeDownload resumeData={resumeData} selectedTemplate={selectedTemplate} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-transparent border-b border-gray-200">
            <TabsTrigger 
              value="build" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none data-[state=active]:shadow-none"
            >
              Build Resume
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:border-b-2 data-[state=active]:border-brand-500 rounded-none data-[state=active]:shadow-none"
            >
              Choose Template
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="build" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="order-2 lg:order-1">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border-gray-100">
                  <CardContent className="p-4 md:p-6">
                    <ResumeForm 
                      initialData={resumeData}
                      onUpdate={handleUpdateResume}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="order-1 lg:order-2">
                <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 border-gray-100 sticky top-4">
                  <CardContent className="p-4 md:p-6">
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
    </ResumeBuilderLayout>
  );
};

export default ResumeBuilder;
