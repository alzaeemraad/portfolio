import React, { useState, useEffect, ChangeEvent } from 'react';
import { useData, Skill } from '../../context/DataContext';

const Skills: React.FC = () => {
  const { skills, updateSkills, loading } = useData();

  const normalizeSkills = (skills: Skill[]) =>
    skills.map(skill => ({
      ...skill,
      percentage: skill.percentage ?? 0,
      icon: skill.icon ?? null,
    }));

  const [skillsData, setSkillsData] = useState<Skill[]>(normalizeSkills(skills));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSkillsData(normalizeSkills(skills));
  }, [skills]);

  const handleSkillChange = (index: number, field: keyof Skill, value: string | number | null) => {
    const updatedSkills = [...skillsData];
    if (field === 'icon') {
      updatedSkills[index].icon = value as string | null;
    } else if (field === 'percentage') {
      updatedSkills[index].percentage = Number(value);
    } else {
      updatedSkills[index][field] = value as any;
    }
    setSkillsData(updatedSkills);
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      title: '',
      description: '',
      percentage: 0,
      icon: null,
    };
    setSkillsData(prev => [...prev, newSkill]);
  };

  const deleteSkill = (index: number) => {
    const updatedSkills = [...skillsData];
    updatedSkills.splice(index, 1);
    setSkillsData(updatedSkills);
  };

  const handleIconChange = (index: number, value: string) => {
    handleSkillChange(index, 'icon', value || null);
  };

  const handleIconUpload = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedSkills = [...skillsData];
        updatedSkills[index].icon = reader.result as string;
        setSkillsData(updatedSkills);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = (index: number) => {
    const updatedSkills = [...skillsData];
    updatedSkills[index].icon = null;
    setSkillsData(updatedSkills);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSkills(skillsData);
      setSuccess('Skills updated successfully');
    } catch (err) {
      setError('Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <div className="space-y-4">
        {skillsData.map((skill, index) => (
          <div key={skill.id} className="mb-4 border border-gray-300 rounded p-4 dark:border-gray-600">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Skill Name</label>
              <input
                type="text"
                value={skill.title}
                onChange={(e) => handleSkillChange(index, 'title', e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Enter skill name"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Skill Description</label>
              <textarea
                value={skill.description}
                onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                rows={3}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Enter skill description"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Skill Percentage</label>
              <div className="relative w-full h-8 mt-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={skill.percentage ?? 0}
                  onChange={(e) => handleSkillChange(index, 'percentage', Number(e.target.value))}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
                  style={{ WebkitAppearance: 'none' }}
                />
                <div
                  className="absolute top-0 left-0 h-4 rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${skill.percentage ?? 0}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))',
                  }}
                />
                <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-center pointer-events-none select-none">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{skill.percentage ?? 0}%</span>
                </div>
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Icon URL</label>
              <input
                type="text"
                value={skill.icon || ''}
                onChange={(e) => handleIconChange(index, e.target.value)}
                placeholder="Enter icon URL"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-900 dark:text-white">Upload Icon</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleIconUpload(index, e)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            {skill.icon && (
              <div className="flex items-center mt-2">
                <img src={skill.icon} alt="Skill Icon" className="h-8 w-8 mr-2 object-contain" />
                <button
                  type="button"
                  onClick={() => removeIcon(index)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                >
                  Remove Icon
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => deleteSkill(index)}
              className="mt-2 bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete Skill
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSkill}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Skill
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="ml-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {saving ? 'Saving...' : 'Save Skills'}
        </button>
      </div>
    </div>
  );
};

export default Skills;
