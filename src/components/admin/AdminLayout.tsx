import React, { useMemo, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const menuItems = useMemo(() => [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
    { icon: Briefcase, label: 'Projects', path: '/admin/projects' },
    { icon: GraduationCap, label: 'Experience', path: '/admin/experience' },
    { icon: GraduationCap, label: 'Education', path: '/admin/education' },
    { icon: Mail, label: 'Contact', path: '/admin/contact' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ], []);

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700" aria-label="Sidebar navigation">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Portfolio Admin
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1" aria-label="Main menu">
            {menuItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 mr-3" aria-hidden="true" />
              Sign Out
            </motion.button>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" tabIndex={-1}>
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
