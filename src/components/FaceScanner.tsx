'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { FaceDetectionResult } from '@/types';
import { processFaceDetection } from '@/utils/faceDetection';

interface FaceScannerProps {
  onResult: (result: FaceDetectionResult) => void;
  onBack: () => void;
}

type ScanStatus = 'idle' | 'loading' | 'ready' | 'captured' | 'scanning' | 'done' | 'error';

const FaceScanner = React.memo(function FaceScanner({ onResult, onBack }: FaceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<import('@mediapipe/face_mesh').FaceMesh | null>(null);

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [capturedImage, setCapturedImage] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopStream();
    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
  }, [stopStream]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      stopStream();
      setStatus('loading');
      setErrorMsg('');
      setCapturedImage('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera access and try again.'
          : 'Failed to access camera. Please ensure a camera is connected.'
      );
    }
  }, [facingMode, stopStream]);

  const flipCamera = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    if (status === 'ready') {
      startCamera(newFacing);
    }
  }, [facingMode, status, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(imageDataUrl);
    setStatus('captured');
    stopStream();
  }, [facingMode, stopStream]);

  const retakePhoto = useCallback(() => {
    setCapturedImage('');
    setStatus('ready');
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  const confirmAndDetect = useCallback(async () => {
    if (!canvasRef.current || !capturedImage) return;

    setStatus('scanning');

    try {
      const { FaceMesh } = await import('@mediapipe/face_mesh');

      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshRef.current = faceMesh;

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const canvas = canvasRef.current!;
          const result = processFaceDetection(
            landmarks,
            canvas.width,
            capturedImage
          );
          setStatus('done');
          onResult(result);
        } else {
          setStatus('error');
          setErrorMsg('No face detected. Please retake with your face clearly visible and centered.');
        }
      });

      await faceMesh.send({ image: canvasRef.current });
    } catch (err) {
      console.error('Face detection error:', err);
      setStatus('error');
      setErrorMsg('Face detection failed. Please try again.');
    }
  }, [capturedImage, onResult]);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Face Capture
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {status === 'idle' && 'Start the camera to take your photo'}
              {status === 'loading' && 'Initializing camera...'}
              {status === 'ready' && 'Position your face in the frame and capture'}
              {status === 'captured' && 'Review your photo - retake or confirm'}
              {status === 'scanning' && 'AI is analyzing your face...'}
              {status === 'done' && 'Analysis complete!'}
              {status === 'error' && 'Something went wrong'}
            </p>
          </div>
        </div>

        {/* Camera viewport */}
        <div className="relative w-full max-w-lg mx-auto aspect-4/3 bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
          {/* Viewfinder overlay for ready state */}
          {status === 'ready' && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
              {/* Center guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-40 border-2 border-dashed border-indigo-400/40 rounded-full" />
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-linear-to-br from-gray-800 to-gray-900">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center pulse-glow">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Tap the button below to open your camera and take a photo for face analysis
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-800 to-gray-900">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-400/30 border-t-indigo-400 animate-spin" />
                <p className="text-gray-400 text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {status === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-3 border-indigo-400/30 border-t-indigo-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white text-sm font-medium">Analyzing face shape...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
              capturedImage || status === 'idle' || status === 'loading' ? 'hidden' : ''
            }`}
            playsInline
            muted
          />

          <canvas
            ref={canvasRef}
            className={`w-full h-full object-cover ${capturedImage ? '' : 'hidden'}`}
          />

          {/* Camera flip & capture controls overlay (only when ready) */}
          {status === 'ready' && (
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 z-10">
              {/* Flip camera */}
              <button
                onClick={flipCamera}
                className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-all border border-white/20"
                type="button"
                title="Flip camera"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Capture */}
              <button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                type="button"
                title="Take photo"
              >
                <div className="w-13 h-13 rounded-full border-4 border-gray-800" />
              </button>
              {/* Placeholder for symmetry */}
              <div className="w-11 h-11" />
            </div>
          )}
        </div>

        {/* Error message */}
        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 dark:text-red-400 text-sm">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          {status === 'idle' && (
            <button
              onClick={() => startCamera()}
              className="btn-primary px-8 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg"
              type="button"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                Open Camera
              </span>
            </button>
          )}

          {status === 'captured' && (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 dark:border-gray-700"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake
                </span>
              </button>
              <button
                onClick={confirmAndDetect}
                className="btn-success px-8 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm & Analyze
                </span>
              </button>
            </>
          )}

          {status === 'error' && (
            <button
              onClick={retakePhoto}
              className="btn-secondary px-6 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg"
              type="button"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </span>
            </button>
          )}

          {(status === 'idle' || status === 'ready' || status === 'error') && (
            <button
              onClick={() => {
                cleanup();
                onBack();
              }}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 border border-gray-200 dark:border-gray-700"
              type="button"
            >
              Back to Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default FaceScanner;
