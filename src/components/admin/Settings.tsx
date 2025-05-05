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



  // New state for footer text control
  const [footerCopyrightText, setFooterCopyrightText] = useState(profile?.footerCopyrightText || '');
  const [footerDesignCreditText, setFooterDesignCreditText] = useState(profile?.footerDesignCreditText || '');
  const [footerSaveMessage, setFooterSaveMessage] = useState('');
  const [footerSaveError, setFooterSaveError] = useState('');

  // New state for interactive balls toggle
  const [showInteractiveBalls, setShowInteractiveBalls] = useState(profile?.showInteractiveBalls ?? true);
  const [interactiveBallsSaveMessage, setInteractiveBallsSaveMessage] = useState('');
  const [interactiveBallsSaveError, setInteractiveBallsSaveError] = useState('');

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
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve transparency for PNG and GIF
        const isPngOrGif = file.type === 'image/png' || file.type === 'image/gif';
        const dataUrl = isPngOrGif
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.5); // quality 0.5 for JPEG

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
      const response = await fetch('https://portfolio-jipo.onrender.com/update-credentials', {
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


  // Save handler for footer text control
  const handleSaveFooterText = async () => {
    setFooterSaveMessage('');
    setFooterSaveError('');
    try {
      await updateProfile({
        footerCopyrightText,
        footerDesignCreditText,
      });
      setFooterSaveMessage('Footer text saved successfully');
    } catch (err) {
      setFooterSaveError('Failed to save footer text');
    }
  };

  // Save handler for interactive balls toggle
  const handleSaveInteractiveBalls = async () => {
    setInteractiveBallsSaveMessage('');
    setInteractiveBallsSaveError('');
    try {
      await updateProfile({
        showInteractiveBalls,
      });
      setInteractiveBallsSaveMessage('Interactive Balls setting saved successfully');
    } catch (err) {
      setInteractiveBallsSaveError('Failed to save Interactive Balls setting');
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


      {/* Footer Text Control Section */}
      <div className="mt-10 max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Footer Text Control</h3>
        <div className="mb-4">
          <label htmlFor="footerCopyrightText" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Copyright Text
          </label>
          <input
            type="text"
            id="footerCopyrightText"
            value={footerCopyrightText}
            onChange={(e) => setFooterCopyrightText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            placeholder="© 2025 John Doe. All rights reserved."
          />
        </div>
        <div className="mb-4">
          <label htmlFor="footerDesignCreditText" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
            Design Credit Text
          </label>
          <input
            type="text"
            id="footerDesignCreditText"
            value={footerDesignCreditText}
            onChange={(e) => setFooterDesignCreditText(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:text-white"
            placeholder="Designed and built with React, Tailwind CSS, and Framer Motion"
          />
        </div>
        <button
          onClick={handleSaveFooterText}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Save Footer Text
        </button>
        {footerSaveMessage && <p className="mt-4 text-green-600 dark:text-green-400">{footerSaveMessage}</p>}
        {footerSaveError && <p className="mt-4 text-red-600 dark:text-red-400">{footerSaveError}</p>}
      </div>

      {/* Interactive Balls Toggle Section */}
      <div className="mt-10 max-w-md">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Interactive Balls Display</h3>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="showInteractiveBalls"
            checked={showInteractiveBalls}
            onChange={(e) => setShowInteractiveBalls(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="showInteractiveBalls" className="font-medium text-gray-700 dark:text-gray-300">
            Show Interactive Balls
          </label>
        </div>
        <button
          onClick={handleSaveInteractiveBalls}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Save Interactive Balls Setting
        </button>
        {interactiveBallsSaveMessage && <p className="mt-4 text-green-600 dark:text-green-400">{interactiveBallsSaveMessage}</p>}
        {interactiveBallsSaveError && <p className="mt-4 text-red-600 dark:text-red-400">{interactiveBallsSaveError}</p>}
      </div>
    </div>
  );
};

export default Settings;
