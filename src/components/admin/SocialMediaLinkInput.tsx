import React from 'react';

interface SocialMediaLinkInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const SocialMediaLinkInput: React.FC<SocialMediaLinkInputProps> = ({ label, name, value, onChange, Icon }) => {
  return (
    <div className="flex flex-col mt-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <Icon className="w-6 h-6 text-gray-500 dark:text-gray-300 mr-2" />
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder={`Enter your ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
};

export default SocialMediaLinkInput;
