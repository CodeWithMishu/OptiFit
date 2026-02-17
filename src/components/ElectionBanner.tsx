'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ElectionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900/20 dark:to-green-900/20 border-b border-orange-200 dark:border-orange-800/50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/election-poster.jpg"
            alt="MLA Election Campaign Poster"
            width={1200}
            height={600}
            className="w-full h-auto"
            priority
          />
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Close banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
