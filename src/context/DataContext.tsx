import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface Skill {
  id: string;
  icon: string | null; // Changed back to string or null to store URL/base64
  title: string;
  description: string;
  percentage?: number; // Added percentage field to represent skill proficiency
}

interface Profile {
  profileimage: string;
  name: string;
  title: string;
  description: string;
  image: string;
  email?: string;
  bio?: string;
  phone?: string;
  location?: string;  // Added location field
  aboutMeText?: string;
  whoAmIText?: string;
  // New fields for icon links control
  aboutIconLink?: string;
  heroGetInTouchLink?: string;
  heroViewMyWorkLink?: string;
  skillIconLink?: string;
  contactIconLink?: string;
  resumeIconLink?: string;
  githubLink?: string;
  linkedinLink?: string;
  instagramLink?: string;
  twitterLink?: string;
  resumePdf?: string; // Added resumePdf field

  // New footer control fields
  footerCopyrightText?: string;
  footerDesignCreditText?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  role: string;
  type: string;
  startDate: string;
  endDate?: string | null;
  description: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  date?: string;
}

interface DataContextType {
  profile: Profile | null;
  projects: Project[];
  experience: Experience[];
  skills: Skill[];
  messages: Message[];
  loading: boolean;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  createProject: (data: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateExperience: (id: string, data: Partial<Experience>) => Promise<void>;
  createExperience: (data: Omit<Experience, 'id'>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  updateSkills: (skills: Skill[]) => Promise<void>;
  addMessage: (messageData: Omit<Message, 'id' | 'date'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSkillIcons: { [key: string]: ReactNode } = {
  '1': <></>,
  '2': <></>,
  '3': <></>,
  '4': <></>,
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = 'https://localhost:10000/data';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await fetch(backendUrl);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setProfile(data.profile || null);
      setProjects(data.projects || []);
      setExperience(data.experience || []);
      setMessages(data.messages || []);
      // Keep icon as string or null in skills state
      const skillsWithIcons = (data.skills || []).map((skill: any) => ({
        ...skill,
        icon: skill.icon || null,
      }));
      setSkills(skillsWithIcons);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: {
    profile: Profile | null;
    projects: Project[];
    experience: Experience[];
    skills: Skill[];
    messages: Message[];
  }) => {
    try {
      // Save icon string URL/base64 as is before saving
      const dataToSave = {
        ...newData,
        skills: newData.skills.map(skill => ({
          ...skill,
          icon: skill.icon || null,
        })),
      };
      console.log('Saving data to backend:', dataToSave); // Debug log
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      console.log('Save data response status:', response.status); // Debug log
      if (!response.ok) throw new Error('Failed to save data');
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
      throw error;
    }
  };

  const generateUniqueId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'date'>) => {
    const newMessage: Message = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      ...messageData,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    try {
      await saveData({
        profile,
        projects,
        experience,
        skills,
        messages: updatedMessages,
      });
    } catch (error) {
      // Rollback messages state if save fails
      setMessages(messages);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const updatedProfile = profile ? { ...profile, ...data } : null;
    setProfile(updatedProfile);
    await saveData({
      profile: updatedProfile,
      projects,
      experience,
      skills,
      messages,
    });
    // Refresh data from backend to ensure state consistency
    await fetchInitialData();
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    const updatedProjects = projects.map((project) =>
      project.id === id ? { ...project, ...data } : project
    );
    setProjects(updatedProjects);
    await saveData({
      profile,
      projects: updatedProjects,
      experience,
      skills,
      messages,
    });
  };

  const createProject = async (data: Omit<Project, 'id'>) => {
    const newProject: Project = { id: generateUniqueId(), ...data };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    await saveData({
      profile,
      projects: updatedProjects,
      experience,
      skills,
      messages,
    });
  };

  const deleteProject = async (id: string) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    await saveData({
      profile,
      projects: updatedProjects,
      experience,
      skills,
      messages,
    });
  };

  const updateExperience = async (id: string, data: Partial<Experience>) => {
    const updatedExperience = experience.map((exp) =>
      exp.id === id ? { ...exp, ...data } : exp
    );
    setExperience(updatedExperience);
    await saveData({
      profile,
      projects,
      experience: updatedExperience,
      skills,
      messages,
    });
  };

  const createExperience = async (data: Omit<Experience, 'id'>) => {
    const newExperience: Experience = { id: generateUniqueId(), ...data };
    const updatedExperience = [...experience, newExperience];
    setExperience(updatedExperience);
    await saveData({
      profile,
      projects,
      experience: updatedExperience,
      skills,
      messages,
    });
  };

  const deleteExperience = async (id: string) => {
    const updatedExperience = experience.filter((exp) => exp.id !== id);
    setExperience(updatedExperience);
    await saveData({
      profile,
      projects,
      experience: updatedExperience,
      skills,
      messages,
    });
  };

  const updateSkills = async (newSkills: Skill[]) => {
    // Keep icon as string or null in skills state
    const skillsWithIcons = newSkills.map((skill) => ({
      ...skill,
      icon: skill.icon || null,
    }));
    setSkills(skillsWithIcons);
    await saveData({
      profile,
      projects,
      experience,
      skills: skillsWithIcons,
      messages,
    });
  };

  return (
    <DataContext.Provider
      value={{
        profile,
        projects,
        experience,
        skills,
        messages,
        loading,
        updateProfile,
        updateProject,
        createProject,
        deleteProject,
        updateExperience,
        createExperience,
        deleteExperience,
        updateSkills,
        addMessage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
