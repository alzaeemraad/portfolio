import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Github, Linkedin, Instagram, Twitter } from 'lucide-react';
import SocialMediaLinkInput from './SocialMediaLinkInput';

const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: dataLoading, updateProfile } = useData();

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    bio: '',
    githubLink: '',
    linkedinLink: '',
    instagramLink: '',
    twitterLink: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        email: profile.email || '',
        bio: profile.bio || '',
        githubLink: profile.githubLink || '',
        linkedinLink: profile.linkedinLink || '',
        instagramLink: profile.instagramLink || '',
        twitterLink: profile.twitterLink || '',
      });
    }
  }, [profile]);

  const validate = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
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
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
    } catch (_) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || dataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Access denied. Please log in.</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 dark:text-white">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter your title"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-900 dark:text-white">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Tell us about yourself"
          />
        </div>
        <SocialMediaLinkInput
          label="GitHub URL"
          name="githubLink"
          value={formData.githubLink}
          onChange={handleChange}
          Icon={Github}
        />
        <SocialMediaLinkInput
          label="LinkedIn URL"
          name="linkedinLink"
          value={formData.linkedinLink}
          onChange={handleChange}
          Icon={Linkedin}
        />
        <SocialMediaLinkInput
          label="Instagram URL"
          name="instagramLink"
          value={formData.instagramLink}
          onChange={handleChange}
          Icon={Instagram}
        />
        <SocialMediaLinkInput
          label="Twitter URL"
          name="twitterLink"
          value={formData.twitterLink}
          onChange={handleChange}
          Icon={Twitter}
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
