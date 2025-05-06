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
    aboutMeText: '',
    whoAmIText: '',
    githubLink: '',
    linkedinLink: '',
    instagramLink: '',
    twitterLink: '',
    resumePdf: '', // Added resumePdf field
    profileimage: '', // Added profile image field
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      // Only update formData if profile data is different from current formData to avoid overwriting unsaved changes
      const isDifferent =
        profile.name !== formData.name ||
        profile.title !== formData.title ||
        profile.email !== formData.email ||
        profile.bio !== formData.bio ||
        profile.aboutMeText !== formData.aboutMeText ||
        profile.whoAmIText !== formData.whoAmIText ||
        profile.githubLink !== formData.githubLink ||
        profile.linkedinLink !== formData.linkedinLink ||
        profile.instagramLink !== formData.instagramLink ||
        profile.twitterLink !== formData.twitterLink ||
        profile.resumePdf !== formData.resumePdf ||
        profile.profileimage !== formData.profileimage;

      if (isDifferent) {
        setFormData({
          name: profile.name || '',
          title: profile.title || '',
          email: profile.email || '',
          bio: profile.bio || '',
          aboutMeText: profile.aboutMeText || '',
          whoAmIText: profile.whoAmIText || '',
          githubLink: profile.githubLink || '',
          linkedinLink: profile.linkedinLink || '',
          instagramLink: profile.instagramLink || '',
          twitterLink: profile.twitterLink || '',
          resumePdf: profile.resumePdf || '',
          profileimage: profile.profileimage || '',
        });
      }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    // Limit file size to 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('PDF size exceeds 2MB. Please choose a smaller file.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      const base64 = await toBase64(file);
      console.log('handleFileChange base64 length:', base64.length, 'snippet:', base64.substring(0, 30));
      const updatedFormData = { ...formData, resumePdf: base64 };
      setFormData(updatedFormData);
      await updateProfile(updatedFormData);
      setSuccess('Resume uploaded successfully');
    } catch (err) {
      setError('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    // Limit file size to 1MB
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size exceeds 1MB. Please choose a smaller image.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      // Resize and compress image using canvas
      const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            console.log('FileReader onload triggered');
            if (typeof reader.result !== 'string') {
              reject('Invalid image data');
              return;
            }
            img.src = reader.result;
            console.log('Image src set to new data');
          };
          img.onload = () => {
            console.log('Image onload triggered');
            console.log('Original image dimensions:', img.width, img.height);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
            console.log('Resized image dimensions:', width, height);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject('Canvas context not available');
              return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/png'); // Preserve transparency with PNG
            resolve(dataUrl);
          };
          img.onerror = (error) => {
            console.log('Image onerror triggered', error);
            reject(error);
          };
        });
      };
      const base64 = await resizeImage(file, 800, 800);
      console.log('handleProfileImageChange base64 length:', base64.length, 'snippet:', base64.substring(0, 30));
      const updatedFormData = { ...formData, profileimage: base64 };
      setFormData(updatedFormData);
      await updateProfile(updatedFormData);
      setSuccess('Profile image uploaded successfully');
    } catch (err) {
      setError('Failed to upload profile image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Submitting profile data:', formData);
      const { aboutMeText, whoAmIText, ...restProfileData } = formData;
      const profileData = { ...restProfileData, aboutMeText, whoAmIText };
      await updateProfile(profileData);
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
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 p-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
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
        <div>
          <label htmlFor="aboutMeText" className="block text-sm font-medium text-gray-900 dark:text-white">About Me Text</label>
          <textarea
            id="aboutMeText"
            name="aboutMeText"
            value={formData.aboutMeText}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter About Me text"
          />
        </div>
        <div>
          <label htmlFor="whoAmIText" className="block text-sm font-medium text-gray-900 dark:text-white">Who I Am Text</label>
          <textarea
            id="whoAmIText"
            name="whoAmIText"
            value={formData.whoAmIText}
            onChange={handleChange}
            rows={6}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            placeholder="Enter Who I Am text"
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
        <div>
          <label htmlFor="profileimage" className="block text-sm font-medium text-gray-900 dark:text-white">Upload Profile Image</label>
          <input
            type="file"
            id="profileimage"
            name="profileimage"
            accept="image/*"
            onChange={handleProfileImageChange}
            disabled={uploading}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          {formData.profileimage && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current profile image: <a href={formData.profileimage} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{formData.profileimage}</a>
            </p>
          )}
        </div>
        <div>
          <label htmlFor="resumePdf" className="block text-sm font-medium text-gray-900 dark:text-white">Upload Resume PDF</label>
          <input
            type="file"
            id="resumePdf"
            name="resumePdf"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          {formData.resumePdf && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current resume: <a href={formData.resumePdf} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{formData.resumePdf}</a>
            </p>
          )}
        </div>
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

