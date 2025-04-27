import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import InteractiveBalls from './InteractiveBalls';

const Hero: React.FC = () => {
  const { profile } = useData();

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Import profile image URL from profile data or fallback to placeholder
  // Add cache-busting query param to force image refresh on update only if image is a URL
  const isUrl = profile?.profileimage && (profile.image.startsWith('http') || profile.profileimage.startsWith('/'));
  const profileImage = profile?.profileimage
    ? isUrl
      ? `${profile.profileimage}?v=${Date.now()}`
      : profile.profileimage
    : '/default-profile.png';

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative pt-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      {profile?.showInteractiveBalls !== false && <InteractiveBalls />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          {/* Left column: Text content */}
          <div className="text-center md:text-left max-w-3xl mx-auto md:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white leading-tight mb-4">
                Hi, I'm <span className="text-primary-600 dark:text-primary-400">{profile?.name || 'John Doe'}</span>
              </h1>
              <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-6">
                {profile?.title || 'Frontend Developer & UI/UX Designer'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0">
                {profile?.bio || 'I craft beautiful, user-friendly interfaces and turn complex problems into elegant solutions.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center md:justify-start gap-4 mt-8"
            >
              <motion.a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors shadow-md hover:shadow-lg dark:shadow-primary-800/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.a>
              <motion.a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium border border-gray-200 dark:border-gray-700 transition-colors shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.a>
            </motion.div>
          </div>

          {/* Right column: Profile image with halo and animations */}
          <div className="relative flex justify-center md:justify-end">
            {/* Blurred gradient halo */}
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none dark:from-primary-600 dark:to-primary-400" />
            <motion.img
              src={profileImage}
              alt={`${profile?.name || 'Profile'} photo`}
              className="relative rounded-lg shadow-lg w-64 h-auto object-cover"
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
            />
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={scrollToAbout}
      >
        <ChevronDown className="w-8 h-8 text-gray-600 dark:text-gray-400" />
      </motion.div>
    </section>
  );
};

export default Hero;
