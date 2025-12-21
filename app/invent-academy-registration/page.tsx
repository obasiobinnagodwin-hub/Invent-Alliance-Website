'use client';

import Footer from '@/components/Footer';
import { useState } from 'react';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  ageRange?: string;
  stream?: string;
  message?: string;
  general?: string;
}

export default function InventAcademyRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ageRange: '',
    stream: '',
    message: '',
    company: '', // Honeypot field
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const validateForm = (): boolean => {
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
      // Extract minimum age from range (e.g., "16-25" -> 16)
      const minAge = parseInt(formData.ageRange.split('-')[0]);
      if (isNaN(minAge) || minAge < 16) {
        newErrors.ageRange = 'You must be at least 16 years old to register.';
      } else if (formData.stream === 'investor' && minAge < 18) {
        newErrors.ageRange = 'You must be at least 18 years old for the Investor stream.';
      }
    }

    if (!formData.stream || !['professional', 'investor'].includes(formData.stream)) {
      newErrors.stream = 'Please select a stream.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/academy-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'Thank you for your registration! We will contact you soon with further details.',
      });
      setFormData({ name: '', email: '', phone: '', ageRange: '', stream: '', message: '', company: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center text-elevated-strong">
            Invent Academy Registration
          </h1>

          <div className="glass-dark rounded-lg shadow-neon-purple p-8 mb-8 border border-purple-500/30">
            <p className="text-white mb-4 font-bold text-elevated">
              Admission into Invent Academy for the bakery arm is ongoing. The bakery academy which is a subsidiary of the Invent Academy is targeted at training individuals not less than 16 and 18 years of age in two different streams, structured to accommodate aspiring bakery professionals and confectionery and bakery investors respectively.
            </p>
            <p className="text-white mb-4 font-semibold">
              Training&apos;s in the academy will be facilitated by our team of seasoned professionals with years of experience.
            </p>
            <p className="text-white mb-4 font-semibold">
              With a wide range of theoretical and practical lessons, the Invent Academy promises to groom professional bakers who would be sought across all bakery and confectionery establishments.
            </p>
            <p className="text-white font-extrabold text-elevated-bold">
              Register now to get started
            </p>
          </div>

          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-md border-2 ${
                submitStatus.type === 'success'
                  ? 'bg-green-500/20 text-green-200 border-green-400 font-bold text-elevated'
                  : 'bg-red-500/20 text-red-200 border-red-400 font-bold text-elevated'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <div className="glass-dark rounded-lg shadow-neon-purple p-8 border border-purple-500/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field - hidden from users */}
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
                  className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white focus:ring-2 focus:ring-neon-purple focus:border-neon-purple ${
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
                  className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white focus:ring-2 focus:ring-neon-purple focus:border-neon-purple ${
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

              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600" role="alert">
                    {errors.general}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

