import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import SkillCard from './SkillCard';

const About: React.FC = () => {
  const { skills, profile } = useData();

  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h2>
          <div className="w-16 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 text-justify">
            {profile?.aboutMeText || "I'm a passionate developer with a keen eye for design and a love for creating exceptional user experiences."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-center"
          >
            <h3 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-4">
              Who I Am
            </h3>
            {profile?.whoAmIText ? (
              profile.whoAmIText.split('\n').map((line, idx) => (
                <p key={idx} className="text-gray-600 dark:text-gray-300 mb-4 text-justify">
                  {line}
                </p>
              ))
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-justify">
                  I'm a frontend developer with 5 years of experience building modern web applications. I specialize in React and related technologies, with a strong focus on creating responsive, accessible, and performant user interfaces.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-justify">
                  My background in design allows me to bridge the gap between aesthetics and functionality, resulting in beautiful products that users love to use.
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-justify">
                  When I'm not coding, you'll find me exploring new design trends, contributing to open-source projects, or enjoying outdoor activities.
                </p>
              </>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-center space-y-6"
          >
            {skills.map((skill) => (
              <div key={skill.id}>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{skill.title}</h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: skill.percentage ? `${skill.percentage}%` : '0%' }}
                  ></div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              icon={skill.icon ? <img src={skill.icon} alt={skill.title + ' icon'} className="h-6 w-6 object-contain" /> : <></>}
              title={skill.title}
              description={skill.description}
              delay={0.1 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
