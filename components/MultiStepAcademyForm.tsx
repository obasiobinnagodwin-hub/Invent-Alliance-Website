'use client';

import { useState } from 'react';
import CTAButton from './CTAButton';
import AccessibleFormField from './AccessibleFormField';
import { FEATURE_ACCESSIBILITY_UPGRADES } from '@/lib/feature-flags';

interface FormData {
  name: string;
  email: string;
  phone: string;
  ageRange: string;
  stream: string;
  message: string;
  company: string; // Honeypot
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  ageRange?: string;
  stream?: string;
  general?: string;
}

interface MultiStepAcademyFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
}

/**
 * Multi-Step Academy Registration Form
 * 
 * 3-step form flow to reduce abandonment and improve user experience:
 * - Step 1: Personal Information (name, email, phone, age)
 * - Step 2: Program Choices (stream, additional info)
 * - Step 3: Review & Submit
 * 
 * Features:
 * - Progress indicator
 * - Step-by-step validation
 * - Back/Next navigation
 * - Input persistence between steps
 * - Same API payload as single-page form
 */
export default function MultiStepAcademyForm({
  onSubmit,
  isSubmitting,
}: MultiStepAcademyFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    ageRange: '',
    stream: '',
    message: '',
    company: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const totalSteps = 3;

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide a valid name (at least 2 characters).';
    }
    
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }
    
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      newErrors.phone = 'Please provide a valid phone number.';
    }
    
    if (!formData.ageRange) {
      newErrors.ageRange = 'Please select your age range.';
    } else {
      const minAge = parseInt(formData.ageRange.split('-')[0]);
      if (isNaN(minAge) || minAge < 16) {
        newErrors.ageRange = 'You must be at least 16 years old to register.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.stream || !['professional', 'investor'].includes(formData.stream)) {
      newErrors.stream = 'Please select a stream.';
    }
    
    // Additional validation for investor stream
    if (formData.stream === 'investor' && formData.ageRange) {
      const minAge = parseInt(formData.ageRange.split('-')[0]);
      if (minAge < 18) {
        newErrors.stream = 'You must be at least 18 years old for the Investor stream.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Clear errors when going back
      setErrors({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps before submitting
    if (!validateStep1() || !validateStep2()) {
      // Go back to first step with errors
      if (!validateStep1()) {
        setCurrentStep(1);
      } else if (!validateStep2()) {
        setCurrentStep(2);
      }
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all ${
                  step <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-transparent border-slate-500 text-slate-400'
                }`}
              >
                {step}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step < currentStep ? 'bg-blue-600' : 'bg-slate-500'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span className={currentStep === 1 ? 'text-white font-semibold' : ''}>
            Personal Info
          </span>
          <span className={currentStep === 2 ? 'text-white font-semibold' : ''}>
            Program Choice
          </span>
          <span className={currentStep === 3 ? 'text-white font-semibold' : ''}>
            Review & Submit
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h4 className="text-xl font-bold text-white mb-4 text-elevated-bold">
              Personal Information
            </h4>
            
            {FEATURE_ACCESSIBILITY_UPGRADES ? (
              <>
                <AccessibleFormField
                  id="name"
                  name="name"
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required={true}
                  className="focus:ring-neon-purple focus:border-neon-purple"
                />
                <AccessibleFormField
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required={true}
                  className="focus:ring-neon-purple focus:border-neon-purple"
                />
                <AccessibleFormField
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required={true}
                  className="focus:ring-neon-purple focus:border-neon-purple"
                />
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-white mb-2 text-elevated">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-purple focus:border-neon-purple ${
                      errors.name ? 'border-red-400' : 'border-purple-500/50'
                    }`}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-white mb-2 text-elevated">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-purple focus:border-neon-purple ${
                      errors.email ? 'border-red-400' : 'border-purple-500/50'
                    }`}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-white mb-2 text-elevated">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-purple focus:border-neon-purple ${
                      errors.phone ? 'border-red-400' : 'border-purple-500/50'
                    }`}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="ageRange" className="block text-sm font-bold text-white mb-2 text-elevated">
                Age Range *
              </label>
              <select
                id="ageRange"
                name="ageRange"
                required
                value={formData.ageRange}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white focus:ring-2 focus:ring-neon-purple focus:border-neon-purple min-h-[48px] ${
                  errors.ageRange ? 'border-red-400' : 'border-purple-500/50'
                }`}
                aria-invalid={errors.ageRange ? 'true' : 'false'}
                aria-describedby={errors.ageRange ? 'ageRange-error' : undefined}
              >
                <option value="" className="bg-slate-900">Select age range</option>
                <option value="16-25" className="bg-slate-900">16-25 years</option>
                <option value="26-35" className="bg-slate-900">26-35 years</option>
                <option value="36-45" className="bg-slate-900">36-45 years</option>
                <option value="46-55" className="bg-slate-900">46-55 years</option>
                <option value="56-65" className="bg-slate-900">56-65 years</option>
                <option value="66+" className="bg-slate-900">66+ years</option>
              </select>
              {errors.ageRange && (
                <p id="ageRange-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                  {errors.ageRange}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Program Choices */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h4 className="text-xl font-bold text-white mb-4 text-elevated-bold">
              Program Selection
            </h4>

            <div>
              <label htmlFor="stream" className="block text-sm font-bold text-white mb-2 text-elevated">
                Stream *
              </label>
              <select
                id="stream"
                name="stream"
                required
                value={formData.stream}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white focus:ring-2 focus:ring-neon-purple focus:border-neon-purple min-h-[48px] ${
                  errors.stream ? 'border-red-400' : 'border-purple-500/50'
                }`}
                aria-invalid={errors.stream ? 'true' : 'false'}
                aria-describedby={errors.stream ? 'stream-error' : undefined}
              >
                <option value="" className="bg-slate-900">Select a stream</option>
                <option value="professional" className="bg-slate-900">Aspiring Bakery Professional (16+ years)</option>
                <option value="investor" className="bg-slate-900">Confectionery and Bakery Investor (18+ years)</option>
              </select>
              {errors.stream && (
                <p id="stream-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                  {errors.stream}
                </p>
              )}
            </div>

            {FEATURE_ACCESSIBILITY_UPGRADES ? (
              <AccessibleFormField
                id="message"
                name="message"
                label="Additional Information"
                type="textarea"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="focus:ring-neon-purple focus:border-neon-purple"
              />
            ) : (
              <div>
                <label htmlFor="message" className="block text-sm font-bold text-white mb-2 text-elevated">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-purple-500/50 rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-purple focus:border-neon-purple"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h4 className="text-xl font-bold text-white mb-4 text-elevated-bold">
              Review Your Information
            </h4>

            <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-6 space-y-4">
              <div>
                <span className="text-slate-400 text-sm font-semibold">Full Name:</span>
                <p className="text-white font-bold">{formData.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm font-semibold">Email:</span>
                <p className="text-white font-bold">{formData.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm font-semibold">Phone:</span>
                <p className="text-white font-bold">{formData.phone}</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm font-semibold">Age Range:</span>
                <p className="text-white font-bold">{formData.ageRange} years</p>
              </div>
              <div>
                <span className="text-slate-400 text-sm font-semibold">Stream:</span>
                <p className="text-white font-bold">
                  {formData.stream === 'professional'
                    ? 'Aspiring Bakery Professional'
                    : formData.stream === 'investor'
                    ? 'Confectionery and Bakery Investor'
                    : 'Not selected'}
                </p>
              </div>
              {formData.message && (
                <div>
                  <span className="text-slate-400 text-sm font-semibold">Additional Information:</span>
                  <p className="text-white">{formData.message}</p>
                </div>
              )}
            </div>

            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600" role="alert">
                  {errors.general}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep > 1 && (
            <CTAButton
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isSubmitting}
              className="w-auto min-w-[120px]"
            >
              ← Back
            </CTAButton>
          )}
          
          {currentStep < totalSteps ? (
            <CTAButton
              type="button"
              variant="primary"
              onClick={handleNext}
              className="flex-1"
            >
              Next →
            </CTAButton>
          ) : (
            <CTAButton
              type="submit"
              variant="success"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              Get Started with Training
            </CTAButton>
          )}
        </div>
      </form>
    </div>
  );
}

