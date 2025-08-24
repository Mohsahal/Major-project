import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from '@/components/ui/use-toast';

interface Resume {
  _id: string;
  title: string;
  template: string;
  lastModified: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
}

interface ResumeContextType {
  resumes: Resume[];
  recentResume: Resume | null;
  isLoading: boolean;
  fetchResumes: (showToast?: boolean) => Promise<void>;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, resume: Resume) => void;
  deleteResume: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [recentResume, setRecentResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken, isAuthenticated } = useAuth();

  const fetchResumes = async (showToast = false) => {
    if (!isAuthenticated) {
      setResumes([]);
      setRecentResume(null);
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      
      if (!token) {
        setResumes([]);
        setRecentResume(null);
        return;
      }

      const response = await fetch(API_ENDPOINTS.RESUMES, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        
        // Set the most recent resume
        if (data.length > 0) {
          const sortedResumes = [...data].sort((a, b) => 
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
          );
          setRecentResume(sortedResumes[0]);
        } else {
          setRecentResume(null);
        }
        
        // Show success toast for manual refresh
        if (showToast && resumes.length > 0) {
          toast({
            title: "Resumes refreshed",
            description: `Found ${data.length} resume${data.length !== 1 ? 's' : ''}`,
            className: "bg-green-50 border-green-200",
          });
        }
      } else {
        // For demo purposes, add some sample resumes if API fails
        const demoResumes = [
          {
            _id: 'demo-1',
            title: 'Software Engineer Resume',
            template: 'Professional',
            lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            personalInfo: {
              firstName: 'John',
              lastName: 'Doe'
            }
          },
          {
            _id: 'demo-2',
            title: 'Product Manager Resume',
            template: 'Modern',
            lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            personalInfo: {
              firstName: 'Jane',
              lastName: 'Smith'
            }
          }
        ];
        setResumes(demoResumes);
        setRecentResume(demoResumes[0]);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      // For demo purposes, add some sample resumes if API fails
      const demoResumes = [
        {
          _id: 'demo-1',
          title: 'Software Engineer Resume',
          template: 'Professional',
          lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe'
          }
        },
        {
          _id: 'demo-2',
          title: 'Product Manager Resume',
          template: 'Modern',
          lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          personalInfo: {
            firstName: 'Jane',
            lastName: 'Smith'
          }
        }
      ];
      setResumes(demoResumes);
      setRecentResume(demoResumes[0]);
    } finally {
      setIsLoading(false);
    }
  };

  const addResume = (resume: Resume) => {
    setResumes(prev => [resume, ...prev]);
    setRecentResume(resume);
  };

  const updateResume = (id: string, updatedResume: Resume) => {
    setResumes(prev => prev.map(resume => 
      resume._id === id ? updatedResume : resume
    ));
    if (recentResume?._id === id) {
      setRecentResume(updatedResume);
    }
  };

  const deleteResume = (id: string) => {
    setResumes(prev => prev.filter(resume => resume._id !== id));
    if (recentResume?._id === id) {
      const remainingResumes = resumes.filter(resume => resume._id !== id);
      setRecentResume(remainingResumes.length > 0 ? remainingResumes[0] : null);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [isAuthenticated]);

  const value: ResumeContextType = {
    resumes,
    recentResume,
    isLoading,
    fetchResumes,
    addResume,
    updateResume,
    deleteResume,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};
