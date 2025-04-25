import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '../ui/ProjectCard';

type FilterCategory = 'all' | string;

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

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:4000/data');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Extract unique tags for filter categories
  const uniqueTags = Array.from(new Set(projects.flatMap(project => project.tags)));

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => project.tags.includes(filter));

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            My Projects
          </h2>
          <div className="w-16 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Browse my recent work and personal projects that showcase my skills and expertise.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          <FilterButton 
            category="all" 
            currentFilter={filter} 
            onClick={() => setFilter('all')}
          />
          {uniqueTags.map((tag) => (
            <FilterButton 
              key={tag} 
              category={tag} 
              currentFilter={filter} 
              onClick={() => setFilter(tag)} 
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300">No projects found.</p>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index} 
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

interface FilterButtonProps {
  category: FilterCategory;
  currentFilter: FilterCategory;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ category, currentFilter, onClick }) => {
  const isActive = category === currentFilter;
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive 
          ? 'bg-primary-600 text-white shadow-md' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </motion.button>
  );
};

export default Projects;
