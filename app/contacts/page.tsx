'use client';

import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useState } from 'react';
import { Metadata } from 'next';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  <main className="bg-invent-soft min-h-screen">

    {/* HERO */}
    <section className="bg-invent-hero text-white py-20 text-center">
      <h1 className="text-4xl font-bold">Contact Us</h1>
      <p className="mt-4 opacity-90">
        We’d love to hear from you
      </p>
    </section>

    {/* CONTENT */}
    <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10">

      {/* CONTACT INFO */}
      <div className="bg-white border border-[var(--invent-blue-100)] rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-[var(--invent-blue-700)] mb-4">
          Contact Information
        </h3>

        <p className="text-gray-600 mb-6">
          Reach out to us for inquiries or support.
        </p>

        <div className="space-y-4 text-gray-700">
          <p><strong>Address:</strong> THE INVENT, Spring Valley Estate, Lekki-Epe Expressway, Alasia Bustop Ajah, Lagos, Nigeria</p>
          <p><strong>Email:</strong> info@inventallianceco.com</p>
          <p><strong>Phone:</strong> +234 906 276 4054</p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white border border-[var(--invent-blue-100)] rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-[var(--invent-blue-700)] mb-6">
          Send a Message
        </h3>

        {/* STATUS */}
        {submitStatus && (
          <div
            className={`mb-6 p-4 rounded-md ${
              submitStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Honeypot */}
          <div className="hidden">
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          {/* NAME */}
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full px-4 py-3 border rounded-lg outline-none ${
                errors.name
                  ? 'border-red-400'
                  : 'border-[var(--invent-blue-200)] focus:border-[var(--invent-blue-500)]'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={`w-full px-4 py-3 border rounded-lg outline-none ${
                errors.email
                  ? 'border-red-400'
                  : 'border-[var(--invent-blue-200)] focus:border-[var(--invent-blue-500)]'
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* SUBJECT */}
          <div>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Subject"
              className={`w-full px-4 py-3 border rounded-lg outline-none ${
                errors.subject
                  ? 'border-red-400'
                  : 'border-[var(--invent-blue-200)] focus:border-[var(--invent-blue-500)]'
              }`}
            />
            {errors.subject && (
              <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* MESSAGE */}
          <div>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className={`w-full px-4 py-3 border rounded-lg outline-none ${
                errors.message
                  ? 'border-red-400'
                  : 'border-[var(--invent-blue-200)] focus:border-[var(--invent-blue-500)]'
              }`}
            />
            {errors.message && (
              <p className="text-sm text-red-500 mt-1">{errors.message}</p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-invent-hero text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>

    {/* MAP */}
    <div className="max-w-7xl mx-auto px-6 pb-16">
      <div className="rounded-2xl overflow-hidden border border-[var(--invent-blue-100)]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.3882178925887!2d3.5962933739744574!3d6.472410723757041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf759fb7ebc61%3A0xdb367688898c29ee!2sInvent%20Alliance%20Limited%20%7C%20Business%20Process%20Outsourcing%20Services!5e0!3m2!1sen!2sng!4v1772307591187!5m2!1sen!2sng"
          className="w-full h-96"
          loading="lazy"
          // referrerPolicy="no-referrer-when-downgrade"
          // title="THE INVENT, Spring Valley Estate, Lekki-Epe Expressway, Alasia Ajah, Lagos, Nigeria"
        />
      </div>
    </div>

  </main>
);
}

