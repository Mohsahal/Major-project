import React from 'react';
import { ResumeData } from '@/types/resume';

interface MinimalTemplateProps {
  data: ResumeData;
}

const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ data }) => {
  return (
    <div className="bg-white shadow-lg p-8 min-h-full max-w-full resume-preview">
      {/* Header with minimal design */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-800 border-b pb-2">
          {data.personalInfo.firstName} {data.personalInfo.lastName}
        </h1>
        <div className="flex justify-between mt-2">
          <p className="text-gray-600 font-light">{data.personalInfo.jobTitle}</p>
          <div className="text-right text-sm text-gray-600">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <p className="text-sm text-gray-700 italic">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md uppercase tracking-wider font-medium text-gray-900 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, index) => (
              <span key={index} className="text-xs border border-gray-300 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md uppercase tracking-wider font-medium text-gray-900 mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                </div>
                <p className="text-sm text-gray-600">{exp.company}, {exp.location}</p>
                <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md uppercase tracking-wider font-medium text-gray-900 mb-3">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                </div>
                <p className="text-sm text-gray-500">{edu.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-md uppercase tracking-wider font-medium text-gray-900 mb-3">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.date}</p>
                </div>
                <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                {project.link && (
                  <a href={project.link} className="text-xs text-gray-600 hover:text-gray-800" target="_blank" rel="noreferrer">
                    {project.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-md uppercase tracking-wider font-medium text-gray-900 mb-3">Certifications</h2>
          <div className="space-y-3">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <h3 className="font-medium">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                </div>
                <p className="text-sm text-gray-500">{cert.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalTemplate;
