import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { useData } from './context/DataContext';
import LoadingScreen from './components/ui/LoadingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Portfolio Components
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Resume from './components/sections/Resume';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './components/admin/LoginPage';
import Dashboard from './components/admin/Dashboard';
import Profile from './components/admin/Profile';
import ProjectsAdmin from './components/admin/Projects';
import Experience from './components/admin/Experience';
import Education from './components/admin/Education';
import ContactAdmin from './components/admin/Contact';
import Settings from './components/admin/Settings';
import Skills from './components/admin/Skills';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;  // You could replace this with a loading spinner or animation for better UX.
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  return <>{children}</>;
};

import { useTheme } from './context/ThemeContext';

const Portfolio: React.FC = () => {
  const { loading } = useData();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { colors } = useTheme();

  useEffect(() => {
    document.title = 'John Doe | Portfolio';  // Change the title dynamically when the component is mounted
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`font-sans antialiased ${colors.background} ${colors.text}`}>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary-600 z-50 origin-left"
        style={{ scaleX }}  // Scroll progress bar animation
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider>
            <Routes>
              {/* Portfolio Routes */}
              <Route path="/" element={<Portfolio />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="projects" element={<ProjectsAdmin />} />
                <Route path="experience" element={<Experience />} />
                <Route path="education" element={<Education />} />
                <Route path="contact" element={<ContactAdmin />} />
                <Route path="settings" element={<Settings />} />
                <Route path="skills" element={<Skills />} />
              </Route>
            </Routes>
            <Toaster position="top-right" />  {/* Toast notifications */}
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
