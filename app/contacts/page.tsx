'use client';

import Footer from '@/components/Footer';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import AccessibleFormField from '@/components/AccessibleFormField';
import TrustSignals from '@/components/TrustSignals';
import CTAButton from '@/components/CTAButton';
import { FEATURE_ACCESSIBILITY_UPGRADES } from '@/lib/feature-flags';
import { trackGoal, trackFunnelStep, GoalType, FunnelName, FunnelStep } from '@/lib/analytics-goals';

// Note: Metadata can't be exported from client components
// Consider moving metadata to a layout or using generateMetadata

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  general?: string;
}

export default function Contacts() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '', // Honeypot field
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Track funnel step on page load
  useEffect(() => {
    trackFunnelStep(FunnelName.CONTACT_FORM, FunnelStep.PAGE_LOAD);
  }, []);

  // Track funnel step when form interaction starts
  useEffect(() => {
    if (formData.name || formData.email || formData.subject || formData.message) {
      trackFunnelStep(FunnelName.CONTACT_FORM, FunnelStep.FORM_START);
    }
  }, [formData.name, formData.email, formData.subject, formData.message]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide a valid name (at least 2 characters).';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      newErrors.subject = 'Please provide a subject (at least 3 characters).';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a message (at least 10 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get CSRF token from API endpoint
  // (Cookie is HttpOnly, so we can't read it directly from JavaScript)
  const getCSRFToken = async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/csrf-token');
      if (response.ok) {
        const data = await response.json();
        return data.token || null;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});

    // Track form submit attempt
    trackFunnelStep(FunnelName.CONTACT_FORM, FunnelStep.FORM_SUBMIT, {
      hasSubject: !!formData.subject,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const csrfToken = await getCSRFToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Include CSRF token in header if available
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus({
        type: 'success',
        message: data.message || 'Thank you for your message! We will get back to you soon.',
      });
      
      // Track successful goal conversion
      trackGoal(GoalType.CONTACT_FORM_SUBMIT, {
        subjectCategory: formData.subject.length > 0 ? 'has_subject' : 'no_subject',
      });
      
      // Track funnel success step
      trackFunnelStep(FunnelName.CONTACT_FORM, FunnelStep.SUCCESS);
      
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      <main id="main-content" tabIndex={-1} className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center text-elevated-strong">Contact Us</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Contact Information */}
            <div className="glass-dark rounded-lg shadow-neon-cyan p-8 border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-elevated-bold">Contact Information</h3>
              <p className="text-white mb-6 font-semibold">
                Please let us know if you have a question, want to leave a comment, or would like further information about Invent Alliance Limited
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-white mb-2 text-elevated">Address</h4>
                  <p className="text-white font-medium">
                    The Invent HQ<br />
                    Lagos, Nigeria
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 text-elevated">Email</h4>
                  <p className="text-white font-medium">info@inventallianceco.com</p>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2 text-elevated">Phone</h4>
                  <p className="text-white font-medium">+234 (0) 906 276 4054</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass-dark rounded-lg shadow-neon-purple p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-elevated-bold">Feedback Form</h3>
              
              <TrustSignals />
              
              {submitStatus && (
                <div
                  className={`mb-6 p-4 rounded-md ${
                    submitStatus.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {FEATURE_ACCESSIBILITY_UPGRADES ? (
                  <>
                    <AccessibleFormField
                      id="name"
                      name="name"
                      label="Name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required={true}
                    />
                    <AccessibleFormField
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required={true}
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold text-white mb-2 text-elevated">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan ${
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
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan ${
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
                  </>
                )}

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-white mb-2 text-elevated">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan ${
                      errors.subject ? 'border-red-400' : 'border-purple-500/50'
                    }`}
                    aria-invalid={errors.subject ? 'true' : 'false'}
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                  />
                  {errors.subject && (
                    <p id="subject-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {FEATURE_ACCESSIBILITY_UPGRADES ? (
                  <AccessibleFormField
                    id="message"
                    name="message"
                    label="Message"
                    type="textarea"
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    required={true}
                    rows={6}
                  />
                ) : (
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold text-white mb-2 text-elevated">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-neon-cyan focus:border-neon-cyan ${
                        errors.message ? 'border-red-400' : 'border-purple-500/50'
                      }`}
                      aria-invalid={errors.message ? 'true' : 'false'}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-300 font-semibold" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>
                )}

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
                  className="w-full bg-gradient-neon-blue text-white py-3 px-6 rounded-md font-bold hover-glow-blue transition-all duration-300 shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-elevated"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="glass-dark rounded-lg shadow-xl overflow-hidden border border-slate-700/50 hover:shadow-2xl transition-all duration-300">
            <div className="relative h-96 w-full aspect-video overflow-hidden">
              <iframe
                src="https://www.google.com/maps?q=6.4742,3.6244&hl=en&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="The Invent HQ Location - Lagos, Nigeria"
              />
              <div className="absolute inset-0 ring-2 ring-white/10 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

