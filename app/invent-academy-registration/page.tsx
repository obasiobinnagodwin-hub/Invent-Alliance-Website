'use client';

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  ageRange?: string;
  stream?: string;
}

export default function AcademyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ageRange: '',
    stream: '',
    message: '',
    company: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const err: FormErrors = {};

    if (!formData.name || formData.name.length < 2)
      err.name = 'Valid name required';

    if (!formData.email.includes('@'))
      err.email = 'Valid email required';

    if (!formData.phone || formData.phone.length < 10)
      err.phone = 'Valid phone required';

    if (!formData.ageRange)
      err.ageRange = 'Select age range';

    if (!formData.stream)
      err.stream = 'Select a stream';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  setIsSubmitting(true);

  try {
    const res = await fetch('/api/academy-registration', { // ⚠️ make sure this matches your route folder
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Submission failed');
    }

    // ✅ SUCCESS
    alert(data.message || 'Submitted successfully');

    // ✅ RESET FORM
    setFormData({
      name: '',
      email: '',
      phone: '',
      ageRange: '',
      stream: '',
      message: '',
      company: '',
    });

    setErrors({});
  } catch (error: any) {
    console.error(error);
    alert(error.message || 'Something went wrong');
  } finally {
    setIsSubmitting(false);
  }

  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageLayout>

      <PageHero
        title="Invent Academy"
        subtitle="Learn. Build. Scale your future with practical training."
      />

      <Section className="max-w-4xl mx-auto">

        {/* INFO */}
        <Card className="bg-white">
          <p className="text-lg text-center font-semibold mb-4 text-gray-900">
            Admission into Invent Academy is ongoing.
          </p>
          <p className="text-gray-600 leading-relaxed text-center">
            We train aspiring professionals and investors in bakery and
            confectionery with real-world practical experience.
          </p>
        </Card>

        {/* FORM */}
        <Card className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}
            <div>
              <input
                name="name"
                value={formData.name}
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <input
                name="email"
                value={formData.email}
                placeholder="Email"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* PHONE */}
            <div>
              <input
                name="phone"
                value={formData.phone}
                placeholder="Phone"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* AGE */}
            <div>
              <select
                name="ageRange"
                value={formData.ageRange}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
              >
                <option value="">Select Age</option>
                <option value="16-25">16–25</option>
                <option value="26-35">26–35</option>
              </select>
              {errors.ageRange && <p className="text-red-500 text-sm mt-1">{errors.ageRange}</p>}
            </div>

            {/* STREAM */}
            <div>
              <select
                name="stream"
                value={formData.stream}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
              >
                <option value="">Select Stream</option>
                <option value="professional">Professional</option>
                <option value="investor">Investor</option>
              </select>
              {errors.stream && <p className="text-red-500 text-sm mt-1">{errors.stream}</p>}
            </div>

            {/* MESSAGE */}
            <textarea
              name="message"
              value={formData.message}
              placeholder="Additional info"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--invent-blue)]"
            />

            {/* BUTTON */}
            <button
              className="w-full bg-[var(--invent-yellow)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </button>

          </form>
        </Card>

      </Section>

    </PageLayout>
  );
}