import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const Projects: React.FC = () => {
  const { user: _user, loading: authLoading } = useAuth();
  const { projects, loading: dataLoading, createProject, updateProject, deleteProject } = useData();

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: '',
    tags: '',
    repoUrl: '',
    featured: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const project = projects.find(p => p.id === editingId);
      if (project) {
        setFormData({
          id: project.id ?? '',
          title: project.title ?? '',
          description: project.description ?? '',
          image: project.image ?? '',
          tags: project.tags ? project.tags.join(', ') : '',
          repoUrl: project.repoUrl ?? '',
          featured: project.featured ?? false,
        });
      }
    } else {
      setFormData({
        id: '',
        title: '',
        description: '',
        image: '',
        tags: '',
        repoUrl: '',
        featured: false,
      });
    }
  }, [editingId, projects]);

  if (authLoading || dataLoading) {
    return <div>Loading...</div>;
  }

  if (!_user) {
    return <div>Access denied. Please log in.</div>;
  }

  const validate = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    // Add more validation as needed
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
        const projectData = {
          title: formData.title,
          description: formData.description,
          image: formData.image,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          repoUrl: formData.repoUrl,
          featured: formData.featured,
        };


      if (editingId) {
        await updateProject(editingId, projectData);
        setSuccess('Project updated successfully');
      } else {
        await createProject(projectData);
        setSuccess('Project created successfully');
      }
      setEditingId(null);
    } catch (_) {
      setError('Failed to save project');
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
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteProject(id);
      setSuccess('Project deleted successfully');
      if (editingId === id) {
        setEditingId(null);
      }
    } catch (_) {
      setError('Failed to delete project');
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
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter project title"
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
            placeholder="Enter project description"
          />
        </div>
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">Upload Image</label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = error => reject(error);
                });
                try {
                  const base64 = await toBase64(file);
                  setFormData(prev => ({ ...prev, image: base64 }));
                } catch (error) {
                  alert('Failed to convert image to base64');
                }
              }
            }}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-900 dark:text-white">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter tags"
          />
        </div>
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-900 dark:text-white">GitHub Link</label>
          <input
            type="text"
            id="repoUrl"
            name="repoUrl"
            value={formData.repoUrl}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter GitHub repository URL"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-900 dark:text-white">Featured</label>
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {saving ? (editingId ? 'Saving...' : 'Creating...') : (editingId ? 'Save Project' : 'Add Project')}
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
        {projects.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">No projects found.</p>
        ) : (
          <ul className="space-y-4">
            {projects.map(project => (
              <li key={project.id} className="p-4 border border-gray-300 rounded-md dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEdit(project.id)}
                    className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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

export default Projects;
