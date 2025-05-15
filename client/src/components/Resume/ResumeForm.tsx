
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles, Trash } from "lucide-react";

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

interface ResumeFormProps {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
  onGenerateWithAI: () => void;
}

export default function ResumeForm({ formData, setFormData, onGenerateWithAI }: ResumeFormProps) {
  const [currentSkill, setCurrentSkill] = useState("");

  const updatePersonalInfo = (field: keyof typeof formData.personalInfo, value: string) => {
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [field]: value
      }
    });
  };

  const updateEducation = (index: number, field: keyof typeof formData.education[0], value: string) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };

    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const updateExperience = (index: number, field: keyof typeof formData.experience[0], value: string) => {
    const updatedExperience = [...formData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };

    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        }
      ]
    });
  };

  const removeEducation = (index: number) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        {
          position: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const updatedExperience = formData.experience.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      experience: updatedExperience
    });
  };

  const addSkill = () => {
    if (currentSkill.trim() !== "" && !formData.skills.includes(currentSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resume Details</h2>
        <Button 
          onClick={onGenerateWithAI} 
          className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
        >
          <Sparkles className="h-4 w-4" /> Enhance with AI
        </Button>
      </div>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal" className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.personalInfo.name} 
                onChange={(e) => updatePersonalInfo('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input 
                id="title" 
                value={formData.personalInfo.title} 
                onChange={(e) => updatePersonalInfo('title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.personalInfo.email} 
                onChange={(e) => updatePersonalInfo('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.personalInfo.phone} 
                onChange={(e) => updatePersonalInfo('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="City, State" 
                value={formData.personalInfo.location} 
                onChange={(e) => updatePersonalInfo('location', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="summary">Professional Summary</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onGenerateWithAI} 
                className="text-xs flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> AI Suggestion
              </Button>
            </div>
            <Textarea 
              id="summary" 
              rows={5} 
              value={formData.personalInfo.summary} 
              onChange={(e) => updatePersonalInfo('summary', e.target.value)}
            />
          </div>
        </TabsContent>

        {/* Experience */}
        <TabsContent value="experience" className="space-y-6 animate-fade-in">
          {formData.experience.map((exp, index) => (
            <div key={index} className="space-y-4 border rounded-lg p-4 relative">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={() => removeExperience(index)}
                disabled={formData.experience.length === 1}
              >
                <Trash className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input 
                    value={exp.position} 
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input 
                    value={exp.company} 
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={exp.location} 
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      value={exp.startDate} 
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      value={exp.endDate} 
                      placeholder="Present" 
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <Label>Description</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs flex items-center gap-1"
                      onClick={onGenerateWithAI}
                    >
                      <Sparkles className="h-3 w-3" /> AI Suggestion
                    </Button>
                  </div>
                  <Textarea 
                    rows={3} 
                    value={exp.description} 
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={addExperience}
          >
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="space-y-6 animate-fade-in">
          {formData.education.map((edu, index) => (
            <div key={index} className="space-y-4 border rounded-lg p-4 relative">
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute top-2 right-2" 
                onClick={() => removeEducation(index)}
                disabled={formData.education.length === 1}
              >
                <Trash className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree / Certification</Label>
                  <Input 
                    value={edu.degree} 
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input 
                    value={edu.institution} 
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input 
                    value={edu.location} 
                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                      value={edu.startDate} 
                      onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                      value={edu.endDate} 
                      placeholder="Present" 
                      onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    rows={3} 
                    value={edu.description} 
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={addEducation}
          >
            <Plus className="h-4 w-4" /> Add Education
          </Button>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="space-y-4 animate-fade-in">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Add a skill..."
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
              </div>
              <Button onClick={addSkill}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <span>{skill}</span>
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => removeSkill(skill)}
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet. Add some skills to showcase your expertise.</p>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={onGenerateWithAI}
            >
              <Sparkles className="h-4 w-4" /> Suggest Relevant Skills with AI
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
