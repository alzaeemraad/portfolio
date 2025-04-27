import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Github, Linkedin, Twitter, Lock } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Resume', href: '#resume' },
  { name: 'Contact', href: '#contact' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const { profile } = useData();
  const { colors } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const githubLink = profile?.githubLink || 'https://github.com';
  const linkedinLink = profile?.linkedinLink || 'https://linkedin.com';
  const twitterLink = 'https://twitter.com'; // No twitter link in profile, keep default

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? `${colors.background}/90 dark:${colors.background}/90 backdrop-blur-md shadow-md`
          : 'bg-transparent'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center">
            <motion.a
              href={isAdminPage ? "/admin" : "#home"}
              className={`text-2xl font-heading font-bold ${colors.text} dark:${colors.text}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                />
              ) : (
                'JD'
              )}
            </motion.a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAdminPage && (
              <div className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }}
                    className={`px-3 py-2 text-sm font-medium ${colors.text} hover:${colors.accent} dark:${colors.text} dark:hover:${colors.accent} transition-colors`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center ml-6 space-x-4">
              <ThemeToggle />
              {!isAdminPage && (
                <>
                  <div className="flex space-x-3">
                    <a
                      href={githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors`}
                    >
                      <Github size={20} />
                    </a>
                    <a
                      href={linkedinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors`}
                    >
                      <Linkedin size={20} />
                    </a>
                    <a
                      href={twitterLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors`}
                    >
                      <Twitter size={20} />
                    </a>
                  </div>
                  <Link
                    to="/admin/login"
                    className={`flex items-center px-3 py-2 text-sm font-medium ${colors.text} hover:${colors.accent} dark:${colors.text} dark:hover:${colors.accent} transition-colors`}
                  >
                    <Lock size={16} className="mr-1" />
                    Admin
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`ml-4 p-2 rounded-md ${colors.text} dark:${colors.text}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          className={`md:hidden ${colors.background} dark:${colors.background} shadow-lg`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isAdminPage && navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium ${colors.text} hover:${colors.accent} dark:${colors.text} dark:hover:${colors.accent} transition-colors`}
              >
                {item.name}
              </a>
            ))}
            {!isAdminPage && (
              <Link
                to="/admin/login"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${colors.text} hover:${colors.accent} dark:${colors.text} dark:hover:${colors.accent} transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Lock size={16} className="mr-2" />
                Admin Login
              </Link>
            )}
          </div>
          {!isAdminPage && (
            <div className="flex justify-center space-x-6 pb-4">
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};
export default Navbar;
