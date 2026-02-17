'use client';

import React, { useState } from 'react';
import type { UserFormData, FaceDetectionResult } from '@/types';
import { generatePrescriptionPDF } from '@/utils/pdfGenerator';

interface ResultCardProps {
  formData: UserFormData;
  faceResult: FaceDetectionResult;
  onReset: () => void;
}

const ResultCard = React.memo(function ResultCard({
  formData,
  faceResult,
  onReset,
}: ResultCardProps) {
  const { faceShape, frameSize, frameSuggestion, faceImage, measurements, confidence, poseWarnings, poseQuality } = faceResult;
  const [pdfExporting, setPdfExporting] = useState(false);

  const handleExportPDF = async () => {
    setPdfExporting(true);
    try {
      await generatePrescriptionPDF(formData, faceResult);
      // Short delay so user sees the download start, then redirect
      setTimeout(() => {
        onReset();
      }, 1500);
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-lg">Analysis Complete!</p>
            <p className="text-emerald-100 text-sm">Your face shape has been analyzed and saved successfully</p>
          </div>
        </div>
      </div>

      {/* Pose quality warnings */}
      {poseWarnings && poseWarnings.length > 0 && (
        <div className="glass rounded-2xl p-4 border border-amber-200/50 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Detection Quality: {poseQuality}%
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                {poseWarnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 italic">
                Results are still valid, but for best accuracy, retake with optimal positioning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Face Shape Hero Card */}
      <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 overflow-hidden">
        <div className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-center">
          <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">Your Face Shape</p>
          <h2 className="text-4xl font-extrabold text-white mb-2">{faceShape}</h2>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-sm font-medium">{confidence}% Confidence</span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Frame Size</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{frameSize}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Face Shape</p>
              <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{faceShape}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Face Analysis Card */}
        <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Face Analysis</h3>
          </div>

          {faceImage && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={faceImage}
                alt="Captured face"
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Recommended Frames */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recommended Frames</p>
            <div className="space-y-3">
              {frameSuggestion.map((frame, idx) => (
                <div
                  key={`${frame.type}-${idx}`}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 ${
                        frame.priority === 'best' ? 'tag-best' :
                        frame.priority === 'good' ? 'tag-good' : 'tag-okay'
                      }`}
                    >
                      {frame.priority === 'best' && '★ '}{frame.type}
                    </span>
                    {frame.bridgeFit && (
                      <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {frame.bridgeFit} bridge
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{frame.reason}</p>
                  {frame.prescriptionNote && (
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                      Rx note: {frame.prescriptionNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Measurements</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Face Length', value: measurements.faceLengthMm },
                { label: 'Forehead', value: measurements.foreheadWidthMm },
                { label: 'Cheekbone', value: measurements.cheekboneWidthMm },
                { label: 'Jaw Width', value: measurements.jawWidthMm },
                { label: 'Temple', value: measurements.templeWidthMm },
                { label: 'Nose Bridge', value: measurements.noseBridgeWidthMm },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{label} (mm)</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Patient Details</h3>
          </div>

          <div className="space-y-2.5">
            {[
              ['Name', formData.name],
              ['Age', String(formData.age)],
              ['DOB', new Date(formData.dob).toLocaleDateString()],
              ['Gender', formData.gender],
              ['Mobile', formData.mobile],
              ['Ward No', formData.wardNo],
              ['Booth/PS No', formData.boothNo],
              ['Address', formData.address],
            ]
              .filter(([, val]) => val)
              .map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-start py-2 border-b border-gray-100/80 dark:border-gray-800/50 last:border-0"
                >
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm text-right max-w-[60%]">
                    {value}
                  </span>
                </div>
              ))}
          </div>

          {/* Prescription */}
          <div className="mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Prescription</p>
            {(['rightEye', 'leftEye'] as const).map((eye) => {
              const eyeData = formData.prescription[eye];
              const hasData = Object.values(eyeData).some(
                (v) => v !== null && v !== '' && !Number.isNaN(v)
              );
              if (!hasData) return null;

              return (
                <div key={eye} className="mb-3">
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                    {eye === 'rightEye' ? 'Right Eye (O.D)' : 'Left Eye (O.S)'}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {eyeData.spherical != null && !Number.isNaN(eyeData.spherical) && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400 text-[10px]">SPH</span>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{eyeData.spherical}</p>
                      </div>
                    )}
                    {eyeData.cylindrical != null && !Number.isNaN(eyeData.cylindrical) && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400 text-[10px]">CYL</span>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{eyeData.cylindrical}</p>
                      </div>
                    )}
                    {eyeData.axis != null && !Number.isNaN(eyeData.axis) && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400 text-[10px]">AXIS</span>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{eyeData.axis}</p>
                      </div>
                    )}
                    {eyeData.prism != null && !Number.isNaN(eyeData.prism) && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400 text-[10px]">PRISM</span>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{eyeData.prism}</p>
                      </div>
                    )}
                    {eyeData.base && (
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400 text-[10px]">BASE</span>
                        <p className="font-mono font-bold text-gray-900 dark:text-white">{eyeData.base}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExportPDF}
          disabled={pdfExporting}
          className="flex-1 btn-primary py-3.5 px-6 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            {pdfExporting ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to PDF
              </>
            )}
          </span>
        </button>

        <button
          onClick={onReset}
          className="flex-1 py-3.5 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 dark:border-gray-700"
          type="button"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Homepage
          </span>
        </button>
      </div>
    </div>
  );
});

export default ResultCard;
