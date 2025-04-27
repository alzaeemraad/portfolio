import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const Settings: React.FC = () => {
  const { profile, updateProfile } = useData();

  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [showLogoForm, setShowLogoForm] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsMessage, setCredentialsMessage] = useState('');
  const [credentialsError, setCredentialsError] = useState('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoMessage, setLogoMessage] = useState('');
  const [logoError, setLogoError] = useState('');

  useEffect(() => {
    if (profile?.image) {
      setLogoPreview(profile.image);
    }
  }, [profile]);

  // Helper function to resize image to max width/height 150px and quality 0.5
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target) {
          reject(new Error('FileReader error'));
          return;
        }
        img.src = e.target.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height *= maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width *= maxSize / height));
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context error'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // quality 0.5
        resolve(dataUrl);
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setLogoError('Invalid file format. Accepted formats: JPEG, PNG, GIF, SVG.');
        setLogoFile(null);
        setLogoPreview(null);
        return;
      }
      setLogoError('');
      try {
        const resizedDataUrl = await resizeImage(file);
        setLogoFile(file);
        setLogoPreview(resizedDataUrl);
      } catch (err) {
        setLogoError('Failed to process image');
        setLogoFile(null);
        setLogoPreview(null);
      }
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsMessage('');
    setCredentialsError('');

    try {
      const response = await fetch('http://localhost:4000/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCredentialsError(data.error || 'Failed to update credentials');
        return;
      }
      setCredentialsMessage('Credentials updated successfully');
      setUsername('');
      setPassword('');
      setShowCredentialsForm(false);
    } catch (err) {
      setCredentialsError('Failed to update credentials');
    }
  };

  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogoMessage('');
    setLogoError('');

    if (!logoFile || !logoPreview) {
      setLogoError('Please select a valid logo image to upload.');
      return;
    }

    // Check base64 size limit (e.g., 100KB)
    const base64Size = (logoPreview.length * (3/4)) - (logoPreview.endsWith('==') ? 2 : logoPreview.endsWith('=') ? 1 : 0);
    const maxSizeBytes = 100 * 1024; // 100KB
    if (base64Size > maxSizeBytes) {
      setLogoError('Image size exceeds 100KB after compression. Please choose a smaller image.');
      return;
    }

    try {
      await updateProfile({ image: logoPreview });
      setLogoMessage('Logo updated successfully');
      setShowLogoForm(false);
    } catch (err) {
      setLogoError('Failed to update logo');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
      <p>Manage your settings here.</p>

      {/* Credentials Section */}
      <div className="mt-6 max-w-md">
        <button
          onClick={() => setShowCredentialsForm(!showCredentialsForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showCredentialsForm ? 'Cancel Update Credentials' : 'Update Credentials'}
        </button>

        {showCredentialsForm && (
          <form onSubmit={handleCredentialsSubmit} className="mt-4">
            <div className="mb-4">
              <label htmlFor="username" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                New Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                placeholder="Enter new username"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
                placeholder="Enter new password"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Update Credentials
            </button>

            {credentialsMessage && <p className="mt-4 text-green-600 dark:text-green-400">{credentialsMessage}</p>}
            {credentialsError && <p className="mt-4 text-red-600 dark:text-red-400">{credentialsError}</p>}
          </form>
        )}
      </div>

      {/* Logo Section */}
      <div className="mt-10 max-w-md">
        <button
          onClick={() => setShowLogoForm(!showLogoForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showLogoForm ? 'Cancel Update Logo' : 'Update Logo'}
        </button>

        {showLogoForm && (
          <form onSubmit={handleLogoSubmit} className="mt-4">
            <div className="mb-4">
              <label htmlFor="logo" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Upload Logo Image (Accepted formats: JPEG, PNG, GIF, SVG)
              </label>
              <input
                type="file"
                id="logo"
                accept="image/jpeg,image/png,image/gif,image/svg+xml"
                onChange={handleLogoChange}
                className="w-full"
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="mt-2 h-20 w-auto object-contain border rounded"
                />
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Update Logo
            </button>

            {logoMessage && <p className="mt-4 text-green-600 dark:text-green-400">{logoMessage}</p>}
            {logoError && <p className="mt-4 text-red-600 dark:text-red-400">{logoError}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
