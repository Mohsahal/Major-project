import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  ChevronRight,
  Download,
  Eye,
  Save
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ResumePreview from "@/components/Resume/ResumePreview";
import ResumeForm from "@/components/Resume/ResumeForm";
import { toast } from "@/hooks/use-toast";
import { generateResumePdf } from "@/utils/resumePdf";
import PdfPreviewDialog from "@/components/Resume/pdfPreviewDialog";

type ResumeTemplate = {
  id: number;
  name: string;
  image: string;
  color: string;
};

type ResumeFormData = {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: {
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
}

export default function ResumePage() {
  const [step, setStep] = useState<'choose' | 'edit' | 'preview'>('choose');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ResumeFormData>({
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    education: [{ 
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    }],
    experience: [{
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    }],
    skills: [],
  });

  const resumeTemplates: ResumeTemplate[] = [
    { id: 1, name: "Professional", image: "https://placehold.co/300x400/e2e8f0/64748b?text=Professional", color: "border-career-blue" },
    { id: 2, name: "Modern", image: "https://placehold.co/300x400/e2e8f0/64748b?text=Modern", color: "border-career-purple" },
    { id: 3, name: "Creative", image: "https://placehold.co/300x400/e2e8f0/64748b?text=Creative", color: "border-career-teal" },
    { id: 4, name: "Minimalist", image: "https://placehold.co/300x400/e2e8f0/64748b?text=Minimalist", color: "border-career-orange" },
    { id: 5, name: "Executive", image: "https://placehold.co/300x400/e2e8f0/64748b?text=Executive", color: "border-career-indigo" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate file upload
      setTimeout(() => {
        setIsUploading(false);
        // Move to edit step with "uploaded" resume data
        // In a real app, you'd parse the resume and extract data
        setStep('edit');
      }, 1500);
    }
  };

  const handleGenerateWithAI = async () => {
    // In a real app, this would call an AI API to analyze or enhance the resume
    const enhancedSummary = "Results-driven professional with expertise in web development, design systems, and user experience. Passionate about creating intuitive interfaces that drive business outcomes.";
    
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        summary: enhancedSummary
      }
    });
  };

  const handleGeneratePdf = async () => {
    if (!resumeRef.current) {
      toast({
        title: "Error",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingPdf(true);
      const blob = await generateResumePdf(resumeRef.current);
      setPdfBlob(blob);
      setIsPdfPreviewOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePreviewResume = () => {
    setStep('preview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Builder</h1>
          <p className="text-gray-500 mb-6">Create a professional resume in minutes with AI assistance</p>
        </div>

        {step === 'choose' && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Get Started</h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="flex items-center gap-2 bg-career-blue hover:bg-career-blue/90 text-lg py-6 flex-1"
                      onClick={() => setStep('edit')}
                    >
                      <FileText className="h-5 w-5" /> Create New Resume
                      <ChevronRight className="h-5 w-5 ml-auto" />
                    </Button>
                    
                    <div className="relative flex-1">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 text-lg py-6 w-full"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        <Upload className="h-5 w-5" /> Upload Existing Resume
                      </Button>
                      <input 
                        id="resume-upload" 
                        type="file" 
                        accept=".pdf,.doc,.docx" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-semibold">AI-Powered Features</h2>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="bg-blue-100 rounded-full p-2 h-8 w-8 flex items-center justify-center text-blue-600 font-medium">1</div>
                      <div>
                        <h3 className="font-medium">Smart Content Generation</h3>
                        <p className="text-sm text-gray-600">AI suggests professional descriptions based on your experience</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-purple-100 rounded-full p-2 h-8 w-8 flex items-center justify-center text-purple-600 font-medium">2</div>
                      <div>
                        <h3 className="font-medium">Keyword Optimization</h3>
                        <p className="text-sm text-gray-600">Auto-detect industry keywords to help your resume pass ATS systems</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="bg-green-100 rounded-full p-2 h-8 w-8 flex items-center justify-center text-green-600 font-medium">3</div>
                      <div>
                        <h3 className="font-medium">Error Detection</h3>
                        <p className="text-sm text-gray-600">Spell check, grammar correction, and formatting recommendations</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
                <Carousel className="w-full">
                  <CarouselContent>
                    {resumeTemplates.map((template) => (
                      <CarouselItem key={template.id} className="md:basis-1/2 lg:basis-1/2">
                        <div className="p-2">
                          <div 
                            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${selectedTemplate === template.id ? `border-2 ${template.color}` : 'border border-gray-200'} rounded-lg overflow-hidden`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <AspectRatio ratio={3/4} className="bg-white">
                              <img 
                                src={template.image} 
                                alt={template.name} 
                                className="object-cover h-full w-full"
                              />
                            </AspectRatio>
                            <div className="p-3 text-center font-medium">{template.name}</div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center mt-4 gap-2">
                    <CarouselPrevious className="static translate-y-0 hover:bg-gray-100" />
                    <CarouselNext className="static translate-y-0 hover:bg-gray-100" />
                  </div>
                </Carousel>
                
                <div className="mt-6">
                  <Button 
                    className="w-full py-6 text-lg bg-career-blue hover:bg-career-blue/90"
                    disabled={!selectedTemplate}
                    onClick={() => setStep('edit')}
                  >
                    Continue with Selected Template
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === 'edit' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <ResumeForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onGenerateWithAI={handleGenerateWithAI}
                />
              </div>
            </div>
            
            <div className="sticky top-4 h-fit">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Live Preview</h2>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handlePreviewResume}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleGeneratePdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center gap-1"
                    >
                      {isGeneratingPdf ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Download className="h-4 w-4" /> Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden" ref={resumeRef}>
                  <ResumePreview template={selectedTemplate || 1} data={formData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => setStep('edit')}
                className="flex items-center gap-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180" /> Back to Editor
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center gap-2 bg-career-blue hover:bg-career-blue/90"
                >
                  {isGeneratingPdf ? "Generating..." : (
                    <>
                      <Download className="h-4 w-4" /> Download PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <div className="border rounded-lg overflow-hidden" ref={resumeRef}>
                <ResumePreview template={selectedTemplate || 1} data={formData} />
              </div>
            </div>
          </div>
        )}
      </div>

      <PdfPreviewDialog 
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        pdfBlob={pdfBlob}
        resumeName={formData.personalInfo.name || 'resume'}
      />
    </div>
  );
}
