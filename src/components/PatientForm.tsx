'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import type { UserFormData } from '@/types';

interface FormProps {
  onSubmit: (data: UserFormData) => void;
}

const defaultPrescription = {
  spherical: null,
  cylindrical: null,
  axis: null,
  prism: null,
  base: '',
};

const PatientForm = React.memo(function PatientForm({ onSubmit }: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      name: '',
      age: undefined as unknown as number,
      dob: '',
      gender: '',
      address: '',
      wardNo: '',
      boothNo: '',
      mobile: '',
      prescription: {
        rightEye: { ...defaultPrescription },
        leftEye: { ...defaultPrescription },
      },
    },
  });

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 input-modern outline-none text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500';

  const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

  const errorClass = 'text-red-500 text-xs mt-1';

  const renderEyeFields = (eye: 'rightEye' | 'leftEye', label: string) => (
    <div className="bg-gray-50/80 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
      <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        {label}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Spherical</label>
          <input
            type="number"
            step="0.25"
            {...register(`prescription.${eye}.spherical`, { valueAsNumber: true })}
            className={inputClass}
            placeholder="e.g. -2.50"
          />
        </div>
        <div>
          <label className={labelClass}>Cylindrical</label>
          <input
            type="number"
            step="0.25"
            {...register(`prescription.${eye}.cylindrical`, { valueAsNumber: true })}
            className={inputClass}
            placeholder="e.g. -1.00"
          />
        </div>
        <div>
          <label className={labelClass}>Axis</label>
          <input
            type="number"
            step="1"
            {...register(`prescription.${eye}.axis`, {
              valueAsNumber: true,
              min: { value: 0, message: 'Min 0' },
              max: { value: 180, message: 'Max 180' },
            })}
            className={inputClass}
            placeholder="0-180"
          />
        </div>
        <div>
          <label className={labelClass}>Prism</label>
          <input
            type="number"
            step="0.25"
            {...register(`prescription.${eye}.prism`, { valueAsNumber: true })}
            className={inputClass}
            placeholder="e.g. 1.00"
          />
        </div>
        <div>
          <label className={labelClass}>Base</label>
          <input
            type="text"
            {...register(`prescription.${eye}.base`)}
            className={inputClass}
            placeholder="e.g. IN, OUT"
          />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Personal Details */}
      <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Personal Details
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              className={inputClass}
              placeholder="Full name"
            />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register('age', {
                required: 'Age is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Min 1' },
                max: { value: 150, message: 'Max 150' },
              })}
              className={inputClass}
              placeholder="Age"
            />
            {errors.age && <p className={errorClass}>{errors.age.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dob', { required: 'Date of birth is required' })}
              className={inputClass}
            />
            {errors.dob && <p className={errorClass}>{errors.dob.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register('gender', { required: 'Gender is required' })}
              className={inputClass}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Mobile / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[+]?[\d\s-]{7,15}$/,
                  message: 'Enter a valid phone number',
                },
              })}
              className={inputClass}
              placeholder="+91-XXXX-XXXXXX"
            />
            {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Ward No</label>
            <input
              type="text"
              {...register('wardNo')}
              className={inputClass}
              placeholder="Ward number"
            />
          </div>

          <div>
            <label className={labelClass}>Booth No / PS No</label>
            <input
              type="text"
              {...register('boothNo')}
              className={inputClass}
              placeholder="Booth / PS number"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <textarea
              {...register('address', {
                maxLength: { value: 500, message: 'Max 500 characters' },
              })}
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Full address"
            />
            {errors.address && <p className={errorClass}>{errors.address.message}</p>}
          </div>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="glass rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 p-6 card-hover">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Prescription Details
          </h3>
        </div>
        <div className="space-y-4">
          {renderEyeFields('rightEye', 'Right Eye (O.D)')}
          {renderEyeFields('leftEye', 'Left Eye (O.S)')}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 btn-primary text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        <span className="flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Next: Capture Face
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </span>
      </button>
    </form>
  );
});

export default PatientForm;
