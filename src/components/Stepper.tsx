'use client';

import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

const Stepper = React.memo(function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : isActive
                    ? 'bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 pulse-glow'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center max-w-20 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 -mt-5 rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default Stepper;
