'use client';

import React from 'react';
import Image from 'next/image';

interface PostureGuideProps {
  className?: string;
}

const PostureGuide = React.memo(function PostureGuide({ className = '' }: PostureGuideProps) {
  return (
    <div className={`glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Proper Posture Guide
        </h3>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          For accurate face measurements, please follow the MLA (Myofunctional Lower Arch) posture:
        </p>

        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image
            src="/images/mla-posture.svg"
            alt="MLA Posture Guide - Proper posture for face scanning"
            fill
            className="object-contain p-4"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="bg-blue-50/80 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Points:
          </h4>
          <ul className="space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Keep your head straight and face the camera directly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Maintain a neutral expression with relaxed facial muscles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Ensure good lighting with no shadows on your face</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Position yourself at arm&apos;s length from the camera</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export default PostureGuide;
