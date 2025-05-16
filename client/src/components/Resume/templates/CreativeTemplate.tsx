import React from 'react';

const CreativeTemplate = ({ data }) => {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = data;

  return (
    <div className="max-w-[800px] mx-auto bg-white p-8 shadow-lg">
      {/* Header Section with Gradient Background */}
      <div className="relative mb-8 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {personalInfo.firstName} <span className="text-blue-600">{personalInfo.lastName}</span>
              </h1>
              <h2 className="text-xl text-gray-700 mb-3">{personalInfo.jobTitle}</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-600">{personalInfo.email}</p>
              <p className="text-gray-600">{personalInfo.phone}</p>
              {personalInfo.location && (
                <p className="text-gray-600">{personalInfo.location}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-6">
          {/* Summary Section */}
          {summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Professional Summary
              </h3>
              <p className="text-gray-700 leading-relaxed pl-10">{summary}</p>
            </div>
          )}

          {/* Experience Section */}
          {experience && experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Experience
              </h3>
              <div className="space-y-4 pl-10">
                {experience.map((exp, index) => (
                  <div key={index} className="mb-4 relative">
                    <div className="absolute -left-4 top-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-medium text-gray-900">{exp.position}</h4>
                        <p className="text-gray-700">{exp.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-600 text-sm">
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p className="text-gray-600 text-sm">{exp.location}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {projects && projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Projects
              </h3>
              <div className="space-y-4 pl-10">
                {projects.map((project, index) => (
                  <div key={index} className="mb-4 relative">
                    <div className="absolute -left-4 top-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-gray-600 text-sm">{project.date}</p>
                    </div>
                    <p className="text-gray-700 mt-2">{project.description}</p>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-1 inline-block"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Skills
              </h3>
              <div className="flex flex-wrap gap-2 pl-10">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {education && education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Education
              </h3>
              <div className="space-y-4 pl-10">
                {education.map((edu, index) => (
                  <div key={index} className="mb-4 relative">
                    <div className="absolute -left-4 top-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-gray-600 text-sm">{edu.date}</p>
                      {edu.description && (
                        <p className="text-gray-700 mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {certifications && certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">•</span>
                Certifications
              </h3>
              <div className="space-y-4 pl-10">
                {certifications.map((cert, index) => (
                  <div key={index} className="mb-4 relative">
                    <div className="absolute -left-4 top-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-gray-700">{cert.issuer}</p>
                      <p className="text-gray-600 text-sm">{cert.date}</p>
                      {cert.description && (
                        <p className="text-gray-700 mt-2">{cert.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate; 