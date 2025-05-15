
import { useMemo } from "react";

type ResumePreviewProps = {
  template: number;
  data: {
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
  };
};

export default function ResumePreview({ template, data }: ResumePreviewProps) {
  const TemplateComponent = useMemo(() => {
    switch (template) {
      case 2:
        return ModernTemplate;
      case 3:
        return CreativeTemplate;
      case 4:
        return MinimalistTemplate;
      case 5:
        return ExecutiveTemplate;
      case 1:
      default:
        return ProfessionalTemplate;
    }
  }, [template]);

  return <TemplateComponent data={data} />;
}

// Professional Template (Blue)
function ProfessionalTemplate({ data }: { data: ResumePreviewProps['data'] }) {
  return (
    <div className="bg-white p-6 font-sans text-sm scale-[0.85] origin-top-left min-h-[1100px]">
      <div className="border-b-4 border-career-blue pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.name || 'Your Name'}</h1>
        <h2 className="text-xl text-career-blue">{data.personalInfo.title || 'Professional Title'}</h2>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-600">
          {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
        </div>
      </div>
      
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h3 className="text-lg font-bold text-career-blue border-b mb-2">Summary</h3>
          <p>{data.personalInfo.summary}</p>
        </section>
      )}
      
      {data.experience.length > 0 && data.experience.some(exp => exp.company || exp.position) && (
        <section className="mb-6">
          <h3 className="text-lg font-bold text-career-blue border-b mb-2">Experience</h3>
          {data.experience.map((exp, index) => (
            exp.position || exp.company ? (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold">{exp.position || 'Position'}</h4>
                    <h5 className="italic">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</h5>
                  </div>
                  <div className="text-gray-600">
                    {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                  </div>
                </div>
                {exp.description && <p className="mt-1">{exp.description}</p>}
              </div>
            ) : null
          ))}
        </section>
      )}
      
      {data.education.length > 0 && data.education.some(edu => edu.institution || edu.degree) && (
        <section className="mb-6">
          <h3 className="text-lg font-bold text-career-blue border-b mb-2">Education</h3>
          {data.education.map((edu, index) => (
            edu.institution || edu.degree ? (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-bold">{edu.degree || 'Degree'}</h4>
                    <h5 className="italic">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</h5>
                  </div>
                  <div className="text-gray-600">
                    {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                  </div>
                </div>
                {edu.description && <p className="mt-1">{edu.description}</p>}
              </div>
            ) : null
          ))}
        </section>
      )}
      
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-career-blue border-b mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-blue-50 text-career-blue px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Modern Template (Purple)
function ModernTemplate({ data }: { data: ResumePreviewProps['data'] }) {
  return (
    <div className="bg-white p-6 font-sans text-sm scale-[0.85] origin-top-left min-h-[1100px] flex">
      {/* Left sidebar */}
      <div className="w-1/3 bg-career-purple/10 p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-career-purple">{data.personalInfo.name || 'Your Name'}</h1>
          <h2 className="text-md">{data.personalInfo.title || 'Professional Title'}</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="uppercase text-sm font-bold text-career-purple mb-2 border-b border-career-purple pb-1">Contact</h3>
          <div className="space-y-1 text-sm">
            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
            {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
          </div>
        </div>
        
        {data.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="uppercase text-sm font-bold text-career-purple mb-2 border-b border-career-purple pb-1">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill, index) => (
                <span key={index} className="inline-block bg-career-purple/20 px-2 py-1 rounded text-xs mb-1">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {data.education.length > 0 && data.education.some(edu => edu.institution || edu.degree) && (
          <div>
            <h3 className="uppercase text-sm font-bold text-career-purple mb-2 border-b border-career-purple pb-1">Education</h3>
            {data.education.map((edu, index) => (
              edu.institution || edu.degree ? (
                <div key={index} className="mb-3 text-sm">
                  <h4 className="font-bold">{edu.degree || 'Degree'}</h4>
                  <div>{edu.institution || 'Institution'}</div>
                  <div className="text-xs text-gray-600">
                    {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                  </div>
                </div>
              ) : null
            ))}
          </div>
        )}
      </div>
      
      {/* Right content */}
      <div className="w-2/3 p-4">
        {data.personalInfo.summary && (
          <section className="mb-6">
            <h3 className="uppercase text-sm font-bold text-career-purple mb-2 border-b border-career-purple pb-1">Profile</h3>
            <p className="text-sm">{data.personalInfo.summary}</p>
          </section>
        )}
        
        {data.experience.length > 0 && data.experience.some(exp => exp.company || exp.position) && (
          <section>
            <h3 className="uppercase text-sm font-bold text-career-purple mb-2 border-b border-career-purple pb-1">Experience</h3>
            {data.experience.map((exp, index) => (
              exp.position || exp.company ? (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold">{exp.position || 'Position'}</h4>
                    <div className="text-xs text-gray-600">
                      {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                    </div>
                  </div>
                  <h5 className="italic text-sm">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</h5>
                  {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
                </div>
              ) : null
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

// Creative Template (Teal)
function CreativeTemplate({ data }: { data: ResumePreviewProps['data'] }) {
  return (
    <div className="bg-white font-sans text-sm scale-[0.85] origin-top-left min-h-[1100px]">
      {/* Header with background */}
      <div className="bg-gradient-to-r from-career-teal/80 to-career-teal p-6 text-white">
        <h1 className="text-3xl font-bold">{data.personalInfo.name || 'Your Name'}</h1>
        <h2 className="text-xl">{data.personalInfo.title || 'Professional Title'}</h2>
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-white/90 text-sm">
          {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
        </div>
      </div>
      
      <div className="p-6">
        {data.personalInfo.summary && (
          <section className="mb-8">
            <h3 className="inline-block text-lg font-bold bg-career-teal text-white py-1 px-3 mb-3">ABOUT ME</h3>
            <p>{data.personalInfo.summary}</p>
          </section>
        )}
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            {data.experience.length > 0 && data.experience.some(exp => exp.company || exp.position) && (
              <section className="mb-8">
                <h3 className="inline-block text-lg font-bold bg-career-teal text-white py-1 px-3 mb-3">EXPERIENCE</h3>
                {data.experience.map((exp, index) => (
                  exp.position || exp.company ? (
                    <div key={index} className="mb-4">
                      <h4 className="font-bold text-career-teal">{exp.position || 'Position'}</h4>
                      <div className="flex justify-between">
                        <h5 className="italic">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</h5>
                        <div className="text-gray-600 text-sm">
                          {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                        </div>
                      </div>
                      {exp.description && <p className="mt-1">{exp.description}</p>}
                    </div>
                  ) : null
                ))}
              </section>
            )}
          </div>
          
          <div>
            {data.education.length > 0 && data.education.some(edu => edu.institution || edu.degree) && (
              <section className="mb-8">
                <h3 className="inline-block text-lg font-bold bg-career-teal text-white py-1 px-3 mb-3">EDUCATION</h3>
                {data.education.map((edu, index) => (
                  edu.institution || edu.degree ? (
                    <div key={index} className="mb-4">
                      <h4 className="font-bold text-career-teal">{edu.degree || 'Degree'}</h4>
                      <div className="flex justify-between">
                        <h5 className="italic">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</h5>
                        <div className="text-gray-600 text-sm">
                          {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                        </div>
                      </div>
                      {edu.description && <p className="mt-1">{edu.description}</p>}
                    </div>
                  ) : null
                ))}
              </section>
            )}
            
            {data.skills.length > 0 && (
              <section>
                <h3 className="inline-block text-lg font-bold bg-career-teal text-white py-1 px-3 mb-3">SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <span key={index} className="bg-career-teal/10 border border-career-teal text-career-teal px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimalist Template (Black/White)
function MinimalistTemplate({ data }: { data: ResumePreviewProps['data'] }) {
  return (
    <div className="bg-white p-6 font-sans text-sm scale-[0.85] origin-top-left min-h-[1100px]">
      <div className="mb-6">
        <h1 className="text-3xl font-light tracking-wide text-gray-800">{data.personalInfo.name || 'YOUR NAME'}</h1>
        <h2 className="text-lg uppercase tracking-widest text-gray-500">{data.personalInfo.title || 'Professional Title'}</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-gray-600 text-sm">
          {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
        </div>
      </div>
      
      <div className="border-b border-gray-300 mb-6"></div>
      
      {data.personalInfo.summary && (
        <section className="mb-8">
          <h3 className="text-lg uppercase tracking-wide font-normal mb-2">PROFILE</h3>
          <p className="text-gray-600">{data.personalInfo.summary}</p>
        </section>
      )}
      
      {data.experience.length > 0 && data.experience.some(exp => exp.company || exp.position) && (
        <section className="mb-8">
          <h3 className="text-lg uppercase tracking-wide font-normal mb-4">EXPERIENCE</h3>
          {data.experience.map((exp, index) => (
            exp.position || exp.company ? (
              <div key={index} className="mb-6">
                <div className="flex justify-between">
                  <h4 className="font-medium">{exp.position || 'Position'}</h4>
                  <div className="text-gray-500">
                    {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                  </div>
                </div>
                <h5 className="text-gray-600 mb-1">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</h5>
                {exp.description && <p className="text-gray-600">{exp.description}</p>}
              </div>
            ) : null
          ))}
        </section>
      )}
      
      {data.education.length > 0 && data.education.some(edu => edu.institution || edu.degree) && (
        <section className="mb-8">
          <h3 className="text-lg uppercase tracking-wide font-normal mb-4">EDUCATION</h3>
          {data.education.map((edu, index) => (
            edu.institution || edu.degree ? (
              <div key={index} className="mb-4">
                <div className="flex justify-between">
                  <h4 className="font-medium">{edu.degree || 'Degree'}</h4>
                  <div className="text-gray-500">
                    {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                  </div>
                </div>
                <h5 className="text-gray-600">{edu.institution || 'Institution'}{edu.location ? `, ${edu.location}` : ''}</h5>
              </div>
            ) : null
          ))}
        </section>
      )}
      
      {data.skills.length > 0 && (
        <section>
          <h3 className="text-lg uppercase tracking-wide font-normal mb-4">SKILLS</h3>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {data.skills.map((skill, index) => (
              <span key={index} className="text-gray-600">
                {skill}{index < data.skills.length - 1 ? " •" : ""}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Executive Template (Dark Blue/Gold)
function ExecutiveTemplate({ data }: { data: ResumePreviewProps['data'] }) {
  return (
    <div className="bg-white p-6 font-serif text-sm scale-[0.85] origin-top-left min-h-[1100px]">
      <div className="border-b-4 border-career-indigo pb-4 mb-6">
        <h1 className="text-4xl font-bold text-career-indigo">{data.personalInfo.name || 'Your Name'}</h1>
        <h2 className="text-xl text-amber-600">{data.personalInfo.title || 'Professional Title'}</h2>
        
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-gray-700">
          {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
        </div>
      </div>
      
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h3 className="text-lg font-bold text-career-indigo mb-3">Executive Summary</h3>
          <p className="text-gray-800 border-l-2 border-amber-500 pl-4 italic">{data.personalInfo.summary}</p>
        </section>
      )}
      
      {data.experience.length > 0 && data.experience.some(exp => exp.company || exp.position) && (
        <section className="mb-8">
          <h3 className="text-lg font-bold text-career-indigo border-b border-amber-500 pb-1 mb-4">Professional Experience</h3>
          {data.experience.map((exp, index) => (
            exp.position || exp.company ? (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-gray-800">{exp.position || 'Position'}</h4>
                  <div className="text-amber-600 font-medium">
                    {exp.startDate} {exp.endDate && `- ${exp.endDate}`}
                  </div>
                </div>
                <h5 className="text-career-indigo font-medium">{exp.company || 'Company'}{exp.location ? `, ${exp.location}` : ''}</h5>
                {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
              </div>
            ) : null
          ))}
        </section>
      )}
      
      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && data.education.some(edu => edu.institution || edu.degree) && (
          <section>
            <h3 className="text-lg font-bold text-career-indigo border-b border-amber-500 pb-1 mb-4">Education</h3>
            {data.education.map((edu, index) => (
              edu.institution || edu.degree ? (
                <div key={index} className="mb-4">
                  <h4 className="font-bold text-gray-800">{edu.degree || 'Degree'}</h4>
                  <h5 className="text-career-indigo">{edu.institution || 'Institution'}</h5>
                  <div className="text-amber-600">
                    {edu.startDate} {edu.endDate && `- ${edu.endDate}`}
                  </div>
                </div>
              ) : null
            ))}
          </section>
        )}
        
        {data.skills.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-career-indigo border-b border-amber-500 pb-1 mb-4">Core Competencies</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-amber-600 mr-2">•</span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
