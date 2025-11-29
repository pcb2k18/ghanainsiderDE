'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link kopiert!');
    }
  };

  return (
    <button
      className="ml-auto flex items-center gap-2 rounded-lg bg-surface-800 px-4 py-2 text-sm text-surface-300 transition-colors hover:bg-surface-700"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Teilen
    </button>
  );
}
