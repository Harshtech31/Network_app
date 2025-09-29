import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  bio: string;
  about: string;
  role: 'student' | 'teacher' | 'alumni';
  skills: string[];
  interests: string[];
  academics: {
    year: string;
    major: string;
    gpa: string;
  };
}

interface ProfileContextType {
  profileData: ProfileData;
  setProfileData: (data: Partial<ProfileData>) => void;
}

const defaultProfileData: ProfileData = {
  name: 'Alex Johnson',
  username: '@alexj_dev',
  email: 'alex.johnson@student.birmingham.ac.ae',
  bio: 'Computer Science student passionate about AI and sustainable technology. Building innovative solutions for tomorrow\'s challenges.',
  about: 'Computer Science student passionate about AI/ML and sustainable technology. Always looking for innovative projects that make a positive impact.',
  role: 'student',
  skills: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'UI/UX Design', 'Project Management'],
  interests: ['Artificial Intelligence', 'Sustainability', 'Startups', 'Photography', 'Music'],
  academics: {
    year: '3rd Year',
    major: 'Computer Science',
    gpa: '3.8/4.0'
  }
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profileData, setProfileDataState] = useState<ProfileData>(defaultProfileData);

  const setProfileData = (data: Partial<ProfileData>) => {
    setProfileDataState(prev => ({ ...prev, ...data }));
  };

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
