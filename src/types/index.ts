export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  showInteractiveBalls?: boolean; // Added optional property for toggle
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  type: 'work' | 'education';
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}