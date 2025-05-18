import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import SimpleTemplate from '@/components/Resume/templates/SimpleTemplate';
import ModernTemplate from '@/components/Resume/templates/ModernTemplate';
import MinimalTemplate from '@/components/Resume/templates/MinimalTemplate';
import ProfessionalTemplate from '@/components/Resume/templates/ProfessionalTemplate';
import CreativeTemplate from '@/components/Resume/templates/CreativeTemplate';
import ExecutiveTemplate from '@/components/Resume/templates/ExecutiveTemplate';

interface ResumeData {
  personalInfo: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    date: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    date: string;
    link: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    description: string;
  }>;
  template: string;
  title: string;
}

const ResumePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view the resume",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:5000/api/resumes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const data = await response.json();
      setResumeData(data);
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

  const renderTemplate = () => {
    if (!resumeData) return null;

    switch (resumeData.template) {
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

  if (!resumeData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Resume Not Found</h2>
          <Button onClick={() => navigate('/my-resumes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Resumes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 mt-20">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/my-resumes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Resumes
        </Button>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-8">
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumePreview; 