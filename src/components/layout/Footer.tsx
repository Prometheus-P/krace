import React from 'react';
import TelegramButton from '../ui/TelegramButton';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2025 RaceLab. All rights reserved.</p>
        <div className="mt-4">
          <TelegramButton />
          {/* Add other social media links here */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
