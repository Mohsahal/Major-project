import React from 'react';
import { ResumeData } from '@/types/resume';

interface ModernTemplateProps {
  data: ResumeData;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-lg min-h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-brand-blue text-white p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">
            {data.personalInfo.firstName}<br/>{data.personalInfo.lastName}
          </h1>
          <p className="text-sm opacity-90">{data.personalInfo.jobTitle}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 border-b border-white/30 pb-1">Contact</h2>
            <div className="space-y-2 text-sm">
              <p>{data.personalInfo.email}</p>
              <p>{data.personalInfo.phone}</p>
              {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 border-b border-white/30 pb-1">Skills</h2>
            <div className="space-y-1">
              {data.skills.map((skill, index) => (
                <p key={index} className="text-sm">{skill}</p>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 border-b border-white/30 pb-1">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-medium text-sm">{edu.degree}</h3>
                  <p className="text-xs opacity-90">{edu.institution}</p>
                  <p className="text-xs opacity-75">{edu.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="w-2/3 p-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-brand-blue text-lg font-semibold border-b-2 border-brand-blue pb-1 mb-2">
              Profile
            </h2>
            <p className="text-sm text-gray-700">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-brand-blue text-lg font-semibold border-b-2 border-brand-blue pb-1 mb-2">
              Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                    <span className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{exp.company}, {exp.location}</p>
                  <p className="text-sm text-gray-700">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-brand-blue text-lg font-semibold border-b-2 border-brand-blue pb-1 mb-2">
              Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    <span className="text-xs text-gray-600">{project.date}</span>
                  </div>
                  <p className="text-sm text-gray-700">{project.description}</p>
                  {project.link && (
                    <a href={project.link} className="text-xs text-brand-blue hover:underline" target="_blank" rel="noreferrer">
                      {project.link}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 className="text-brand-blue text-lg font-semibold border-b-2 border-brand-blue pb-1 mb-2">
              Certifications & Achievements
            </h2>
            <div className="space-y-4">
              {data.certifications.map((cert, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                    <span className="text-xs text-gray-600">{cert.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  {cert.description && (
                    <p className="text-sm text-gray-700 mt-1">{cert.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
