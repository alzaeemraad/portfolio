import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const Education: React.FC = () => {
  const { user: _user, loading: authLoading } = useAuth();
  const { experience, loading: dataLoading, createExperience, updateExperience, deleteExperience } = useData();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    company: '',
    location: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const edu = experience.find(e => e.id === editingId && e.type === 'education');
      if (edu) {
        setFormData({
          id: edu.id,
          title: edu.title || '',
          company: edu.company || '',
          location: edu.location || '',
          role: edu.role || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          description: edu.description || '',
        });
      }
    } else {
      setFormData({
        id: '',
        title: '',
        company: '',
        location: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
      });
    }
  }, [editingId, experience]);

  if (authLoading || dataLoading) {
    return <div>Loading...</div>;
  }

  // No user check here, assuming admin access is handled by route protection

  const validate = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.company.trim()) {
      setError('Institution is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const eduData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        role: formData.role,
        startDate: formData.startDate,
        endDate: formData.endDate === '' ? null : formData.endDate,
        description: formData.description,
        type: 'education',
      };

      if (editingId) {
        await updateExperience(editingId, eduData);
        setSuccess('Education updated successfully');
      } else {
        await createExperience(eduData);
        setSuccess('Education created successfully');
      }
      setEditingId(null);
    } catch (_) {
      setError('Failed to save education');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteExperience(id);
      setSuccess('Education deleted successfully');
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (_) {
      setError('Failed to delete education');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">Degree / Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter degree or title"
          />
        </div>
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-900 dark:text-white">Institution</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter institution name"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-900 dark:text-white">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter location"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-900 dark:text-white">Field of Study</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter field of study"
          />
        </div>
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 dark:text-white">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-white">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter description"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {saving ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Education' : 'Add Education')}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        {experience.filter(e => e.type === 'education').length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No education entries found.</p>
        ) : (
          <ul className="space-y-4">
            {experience.filter(e => e.type === 'education').map(edu => (
              <li key={edu.id} className="p-4 border border-gray-300 rounded-md dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{edu.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{edu.company}</p>
                <p className="text-gray-700 dark:text-gray-300">{edu.startDate} - {edu.endDate || 'Present'}</p>
                <p className="text-gray-700 dark:text-gray-300">{edu.description}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEdit(edu.id)}
                    className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Education;
