
export interface PersonalInfo {
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location?: string;
  }
  
  export interface Education {
    degree: string;
    institution: string;
    date: string;
    description?: string;
  }
  
  export interface Experience {
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrentPosition?: boolean;
    description: string;
  }
  
  export interface Project {
    name: string;
    description: string;
    date: string;
    link?: string;
  }
  
  export interface Certification {
    name: string;
    issuer: string;
    date: string;
    description?: string;
  }
  
  export interface ResumeData {
    personalInfo: PersonalInfo;
    summary?: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    projects: Project[];
    certifications: Certification[];
  }
  