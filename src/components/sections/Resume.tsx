import React from 'react';
import { motion } from 'framer-motion';
import { Download, Briefcase, GraduationCap } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface TimelineItemProps {
  year: string;
  title: string;
  company: string;
  description: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ year, title, company, description, isLast = false }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
    viewport={{ once: true, margin: "-100px" }}
    className="flex gap-6"
  >
    <div className="flex flex-col items-center">
      <div className="w-3 h-3 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
      {!isLast && <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>}
    </div>
    <div className="pb-10">
      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{year}</p>
      <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mt-1">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300 font-medium">{company}</p>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
    </div>
  </motion.div>
);

const formatYearRange = (startDate: string, endDate?: string | null) => {
  const startYear = new Date(startDate).getFullYear();
  const endYear = endDate ? new Date(endDate).getFullYear() : 'Present';
  return `${startYear} - ${endYear}`;
};

const Resume: React.FC = () => {
  const { experience, profile } = useData();

  return (
    <section id="resume" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Resume & Experience
          </h2>
          <div className="w-16 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            My professional journey and academic background.
          </p>
        </motion.div>

        <div className="flex justify-center mb-12">
          <motion.a
            href={profile?.resumePdf || "/resume.pdf"}
            download
            className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 transition-colors text-white font-medium rounded-full shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="mr-2 w-5 h-5" />
            Download Resume
          </motion.a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex items-center mb-8"
            >
              <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
                Work Experience
              </h3>
            </motion.div>

            <div className="mt-6">
              {experience.filter(exp => exp.type !== 'education').length > 0 ? (
                experience
                  .filter(exp => exp.type !== 'education')
                  .map((exp, index, arr) => (
                    <TimelineItem
                      key={exp.id}
                      year={formatYearRange(exp.startDate, exp.endDate)}
                      title={exp.title}
                      company={exp.company}
                      description={exp.description}
                      isLast={index === arr.length - 1}
                    />
                  ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No experience data available.</p>
              )}
            </div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex items-center mb-8"
            >
              <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
                Education
              </h3>
            </motion.div>

            <div className="mt-6">
              {experience.filter(exp => exp.type === 'education').length > 0 ? (
                experience
                  .filter(exp => exp.type === 'education')
                  .map((edu, index, arr) => (
                    <TimelineItem
                      key={edu.id}
                      year={formatYearRange(edu.startDate, edu.endDate)}
                      title={edu.title}
                      company={edu.company}
                      description={edu.description}
                      isLast={index === arr.length - 1}
                    />
                  ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No education data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resume;
