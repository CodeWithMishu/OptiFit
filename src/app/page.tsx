'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import type { UserFormData, FaceDetectionResult } from '@/types';
import { submitUser } from '@/utils/api';
import { getEnhancedRecommendations } from '@/utils/frameLogic';
import PatientForm from '@/components/PatientForm';
import Stepper from '@/components/Stepper';
import ThemeToggle from '@/components/ThemeToggle';
import ErrorBoundary from '@/components/ErrorBoundary';
import ElectionBanner from '@/components/ElectionBanner';

const FaceScanner = lazy(() => import('@/components/FaceScanner'));
const ResultCard = lazy(() => import('@/components/ResultCard'));

const STEPS = ['Fill Details', 'Capture Face', 'Your Results'];

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserFormData | null>(null);
  const [faceResult, setFaceResult] = useState<FaceDetectionResult | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = useCallback((data: UserFormData) => {
    setFormData(data);
    setStep(2);
  }, []);

  const handleFaceResult = useCallback(
    async (result: FaceDetectionResult) => {
      if (!formData || isSubmitting) return;

      // Compute enhanced recommendations using form data context
      const enhancedRecommendations = getEnhancedRecommendations({
        faceShape: result.faceShape,
        measurements: result.measurements,
        prescription: formData.prescription,
        age: formData.age,
        gender: formData.gender,
      });

      // Update result with enhanced recommendations
      const enhancedResult = {
        ...result,
        frameSuggestion: enhancedRecommendations,
      };

      setFaceResult(enhancedResult);
      setIsSubmitting(true);
      setSubmitError('');

      try {
        const payload = {
          ...formData,
          faceShape: enhancedResult.faceShape,
          confidence: enhancedResult.confidence,
          frameSize: enhancedResult.frameSize,
          frameSuggestion: enhancedResult.frameSuggestion,
          faceLengthMm: enhancedResult.measurements.faceLengthMm,
          foreheadWidthMm: enhancedResult.measurements.foreheadWidthMm,
          cheekboneWidthMm: enhancedResult.measurements.cheekboneWidthMm,
          jawWidthMm: enhancedResult.measurements.jawWidthMm,
          templeWidthMm: enhancedResult.measurements.templeWidthMm,
          noseBridgeWidthMm: enhancedResult.measurements.noseBridgeWidthMm,
        };

        const response = await submitUser(payload);

        if (!response.success) {
          setSubmitError(response.message || 'Failed to save record');
        }
      } catch {
        setSubmitError('Network error. Data may not have been saved.');
      } finally {
        setIsSubmitting(false);
        setStep(3);
      }
    },
    [formData, isSubmitting]
  );

  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  const handleReset = useCallback(() => {
    setStep(1);
    setFormData(null);
    setFaceResult(null);
    setSubmitError('');
  }, []);

  return (
    <div className="min-h-screen transition-colors relative">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-purple-300/20 dark:bg-purple-900/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-300/20 dark:bg-blue-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-200/10 dark:bg-indigo-900/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              OptiFit AI
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Election Campaign Banner */}
      <ElectionBanner />

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Stepper currentStep={step} steps={STEPS} />

        {submitError && step === 3 && (
          <div className="mb-6 p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-2xl backdrop-blur-sm animate-slide-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-amber-700 dark:text-amber-400 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        <ErrorBoundary>
          {step === 1 && (
            <div className="animate-slide-up">
              <PatientForm onSubmit={handleFormSubmit} />
            </div>
          )}

          {step === 2 && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading camera...</p>
                  </div>
                </div>
              }
            >
              <div className="animate-slide-up">
                <FaceScanner onResult={handleFaceResult} onBack={handleBack} />
              </div>
            </Suspense>
          )}

          {step === 3 && formData && faceResult && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                </div>
              }
            >
              <div className="animate-slide-up">
                <ResultCard
                  formData={formData}
                  faceResult={faceResult}
                  onReset={handleReset}
                />
              </div>
            </Suspense>
          )}
        </ErrorBoundary>

        {isSubmitting && step === 2 && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-white/20 dark:border-gray-700/50 animate-scale-in">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">Analyzing & saving...</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 dark:border-gray-800/50 py-6 mt-8">
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          OptiFit AI &mdash; Intelligent Optical Frame Recommendation
        </p>
      </footer>
    </div>
  );
}
