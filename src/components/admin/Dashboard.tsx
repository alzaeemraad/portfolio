import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import Messages from './Messages';
import { Briefcase, GraduationCap, Mail, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { projects, experience, messages } = useData();
  const [activeSection, setActiveSection] = useState<'projects' | 'education' | 'messages' | 'experience' | null>(null);

  const stats = [
    {
      id: 'projects',
      label: 'Total Projects',
      count: projects.length,
      icon: Briefcase,
      onClick: () => setActiveSection('projects'),
    },
    {
      id: 'education',
      label: 'Education',
      count: experience.filter(e => e.type === 'education').length,
      icon: GraduationCap,
      onClick: () => setActiveSection('education'),
    },
    {
      id: 'messages',
      label: 'Messages',
      count: messages.length,
      icon: Mail,
      onClick: () => setActiveSection('messages'),
    },
    {
      id: 'experience',
      label: 'Experience Entries',
      count: experience.filter(e => e.type !== 'education').length,
      icon: UserCheck,
      onClick: () => setActiveSection('experience'),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'projects':
        const recentProjects = [...projects].slice(-5).reverse();
        return (
          <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Projects</h3>
            {recentProjects.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">No projects found.</p>
            ) : (
              <ul className="space-y-4">
                {recentProjects.map(project => (
                  <li key={project.id} className="p-4 border border-gray-300 rounded-md dark:border-gray-600">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{project.title}</h4>
                    <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'education':
        const educationEntries = experience.filter(e => e.type === 'education');
        return (
          <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Education</h3>
            {educationEntries.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">No education entries found.</p>
            ) : (
              <ul className="space-y-4">
                {educationEntries.map(edu => (
                  <li key={edu.id} className="p-4 border border-gray-300 rounded-md dark:border-gray-600">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{edu.title}</h4>
                    <p className="text-gray-700 dark:text-gray-300">{edu.company}</p>
                    <p className="text-gray-700 dark:text-gray-300">{edu.startDate} - {edu.endDate || 'Present'}</p>
                    <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'messages':
        return (
          <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <Messages />
          </div>
        );
      case 'experience':
        const workExperience = experience.filter(e => e.type !== 'education');
        return (
          <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Experience</h3>
            {workExperience.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">No experience found.</p>
            ) : (
              <ul className="space-y-4">
                {workExperience.map(exp => (
                  <li key={exp.id} className="p-4 border border-gray-300 rounded-md dark:border-gray-600">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                    <p className="text-gray-700 dark:text-gray-300">{exp.company}</p>
                    <p className="text-gray-700 dark:text-gray-300">{exp.startDate} - {exp.endDate || 'Present'}</p>
                    <p className="text-gray-700 dark:text-gray-300">{exp.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        {stats.map(({ id, label, count, icon: Icon, onClick }) => (
          <div
            key={id}
            onClick={onClick}
            className="cursor-pointer p-6 border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center space-y-4"
          >
            <Icon className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{count}</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{label}</p>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {activeSection && (
          <motion.div
            key={activeSection}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: { opacity: 0, height: 0 },
              visible: { opacity: 1, height: 'auto' },
              exit: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
