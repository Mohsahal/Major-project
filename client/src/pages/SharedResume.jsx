import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PlainLayout from '@/components/layout/PlainLayout';
import SimpleTemplate from '@/components/Resume/templates/SimpleTemplate';
import ModernTemplate from '@/components/Resume/templates/ModernTemplate';
import MinimalTemplate from '@/components/Resume/templates/MinimalTemplate';
import ProfessionalTemplate from '@/components/Resume/templates/ProfessionalTemplate';
import CreativeTemplate from '@/components/Resume/templates/CreativeTemplate';
import ExecutiveTemplate from '@/components/Resume/templates/ExecutiveTemplate';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SharedResume = () => {
  const { encodedData } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Decode the base64 data
      const decodedData = JSON.parse(atob(encodedData));
      setResumeData(decodedData.resume);
      setSelectedTemplate(decodedData.template);
    } catch (error) {
      console.error('Error decoding resume data:', error);
      toast({
        title: "Error",
        description: "Invalid or expired resume link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [encodedData]);

  const renderTemplate = () => {
    if (!resumeData) return null;

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

  const handleDownload = () => {
    // Implement download functionality
    toast({
      title: "Download started",
      description: "Your resume is being downloaded",
    });
  };

  if (isLoading) {
    return (
      <PlainLayout>
        <div className="container mx-auto mt-14 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </PlainLayout>
    );
  }

  if (!resumeData) {
    return (
      <PlainLayout>
        <div className="container mx-auto mt-14 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Resume Not Found</h1>
            <p className="text-gray-600 mb-4">The resume you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </PlainLayout>
    );
  }

  return (
    <PlainLayout>
      <div className="container mx-auto mt-14 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}'s Resume
          </h1>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="resume-preview">
              {renderTemplate()}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlainLayout>
  );
};

export default SharedResume; 