'use client';

import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FormErrors {
  name?: string;
  email?: string;
  requestType?: string;
  description?: string;
  verification?: string;
  general?: string;
}

type RequestType = 'access' | 'rectification' | 'erasure' | 'restrict' | 'portability' | 'object' | 'other';

export default function DataSubjectRequestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: '' as RequestType | '',
    description: '',
    verification: '', // For identity verification (e.g., account details, previous interactions)
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [featureAvailable, setFeatureAvailable] = useState<boolean | null>(null);

  // Check if feature is available
  useEffect(() => {
    // Check if DSAR portal is enabled by trying to fetch the API endpoint
    fetch('/api/data-subject-request', { method: 'OPTIONS' })
      .then(response => {
        setFeatureAvailable(response.status !== 404);
      })
      .catch(() => {
        setFeatureAvailable(false);
      });
  }, []);

  const requestTypeLabels: Record<RequestType, string> = {
    access: 'Access my data (GDPR Art. 15)',
    rectification: 'Rectify incorrect data (GDPR Art. 16)',
    erasure: 'Delete my data (GDPR Art. 17 - Right to be forgotten)',
    restrict: 'Restrict processing (GDPR Art. 18)',
    portability: 'Data portability (GDPR Art. 20)',
    object: 'Object to processing (GDPR Art. 21)',
    other: 'Other request',
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name (at least 2 characters).';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.requestType) {
      newErrors.requestType = 'Please select a request type.';
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = 'Please provide a description of your request (at least 10 characters).';
    }

    if (!formData.verification.trim() || formData.verification.trim().length < 5) {
      newErrors.verification = 'Please provide information to verify your identity (e.g., account details, previous interactions with us).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Fetch CSRF token if CSRF protection is enabled
      let csrfToken = '';
      try {
        const csrfResponse = await fetch('/api/csrf-token');
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.token || '';
        }
      } catch {
        // CSRF may not be enabled, continue without token
      }

      const response = await fetch('/api/data-subject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Your data subject request has been submitted successfully. We will process it within 30 days as required by GDPR.',
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          requestType: '' as RequestType | '',
          description: '',
          verification: '',
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'An error occurred while submitting your request. Please try again later.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred while submitting your request. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show "not available" page if feature is disabled
  if (featureAvailable === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <h1 className="text-4xl font-extrabold mb-6 gradient-text-blue text-elevated-bold">
              Data Subject Request Portal
            </h1>
            <p className="text-white/80 text-lg mb-6">
              This service is currently not available.
            </p>
            <p className="text-white/70 mb-6">
              If you need to exercise your GDPR rights, please contact us directly.
            </p>
            <Link
              href="/contacts"
              className="inline-block px-6 py-3 bg-neon-cyan hover:bg-neon-blue text-slate-900 rounded-lg transition-colors duration-300 font-bold"
            >
              Contact Us
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state while checking feature availability
  if (featureAvailable === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl p-8 border border-slate-700 text-center">
            <p className="text-white/80">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl p-8 border border-slate-700">
          <h1 className="text-4xl font-extrabold mb-2 gradient-text-blue text-elevated-bold">
            Data Subject Access Request (DSAR)
          </h1>
          <p className="text-white/80 mb-6 text-sm">
            Exercise your GDPR rights (Articles 15-22). We will process your request within 30 days.
          </p>

          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-white/90 text-sm mb-2">
              <strong>Your Rights Under GDPR:</strong>
            </p>
            <ul className="text-white/80 text-xs space-y-1 list-disc list-inside">
              <li><strong>Right of Access (Art. 15):</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate data</li>
              <li><strong>Right to Erasure (Art. 17):</strong> Request deletion of your data</li>
              <li><strong>Right to Restrict Processing (Art. 18):</strong> Limit how we process your data</li>
              <li><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a portable format</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests</li>
            </ul>
            <p className="text-white/70 text-xs mt-3">
              For more information, see our{' '}
              <Link href="/privacy-policy" className="text-neon-cyan hover:text-neon-blue underline">
                Privacy Policy
              </Link>.
            </p>
          </div>

          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success'
                  ? 'bg-green-900/30 border border-green-700 text-green-200'
                  : 'bg-red-900/30 border border-red-700 text-red-200'
              }`}
            >
              <p className="font-semibold">{submitStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-white font-semibold mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-slate-600'
                } focus:outline-none focus:ring-2 focus:ring-neon-cyan`}
                placeholder="Your full name"
              />
              {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-white font-semibold mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-slate-600'
                } focus:outline-none focus:ring-2 focus:ring-neon-cyan`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="requestType" className="block text-white font-semibold mb-2">
                Request Type <span className="text-red-400">*</span>
              </label>
              <select
                id="requestType"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as RequestType })}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.requestType ? 'border-red-500' : 'border-slate-600'
                } focus:outline-none focus:ring-2 focus:ring-neon-cyan`}
              >
                <option value="">Select a request type...</option>
                {Object.entries(requestTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.requestType && <p className="mt-1 text-red-400 text-sm">{errors.requestType}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-white font-semibold mb-2">
                Description of Your Request <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.description ? 'border-red-500' : 'border-slate-600'
                } focus:outline-none focus:ring-2 focus:ring-neon-cyan`}
                placeholder="Please describe your request in detail..."
              />
              {errors.description && <p className="mt-1 text-red-400 text-sm">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="verification" className="block text-white font-semibold mb-2">
                Identity Verification Information <span className="text-red-400">*</span>
              </label>
              <textarea
                id="verification"
                value={formData.verification}
                onChange={(e) => setFormData({ ...formData, verification: e.target.value })}
                rows={3}
                className={`w-full px-4 py-2 bg-slate-700 text-white rounded-lg border ${
                  errors.verification ? 'border-red-500' : 'border-slate-600'
                } focus:outline-none focus:ring-2 focus:ring-neon-cyan`}
                placeholder="Please provide information to verify your identity (e.g., account username, previous interactions, order numbers, etc.)"
              />
              <p className="mt-1 text-white/60 text-xs">
                This information helps us verify your identity and process your request securely.
              </p>
              {errors.verification && <p className="mt-1 text-red-400 text-sm">{errors.verification}</p>}
            </div>

            {errors.general && (
              <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm">{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 rounded-lg font-bold transition-colors duration-300 ${
                isSubmitting
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-neon-cyan hover:bg-neon-blue text-slate-900'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <Link
              href="/privacy-policy"
              className="text-neon-cyan hover:text-neon-blue font-semibold inline-flex items-center gap-1 group"
            >
              Learn more about your rights →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

