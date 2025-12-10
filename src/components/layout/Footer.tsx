import React from 'react';
import TelegramButton from '../ui/TelegramButton';

const Footer = () => {
  return (
    <footer className="mt-8 bg-gray-800 p-4 text-white">
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
