import React from 'react';

const ShareButton = ({ url, title }: { url: string; title: string }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return <button onClick={handleShare}>Share</button>;
};

export default ShareButton;
