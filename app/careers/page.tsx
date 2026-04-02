import type { Metadata } from 'next';

import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/ui/PageHero";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join our team at Invent Alliance Limited. We believe in potentials, embrace creativity, encourage innovation and inspire leadership.',
  openGraph: {
    title: 'Careers - Invent Alliance Limited',
    description:
      'Join our team at Invent Alliance Limited. Explore career opportunities.',
    type: 'website',
  },
};

export default function Careers() {
  return (
    <PageLayout>

      {/* HERO */}
      <PageHero
        title="Careers"
        subtitle="Build your future with us"
      />

      {/* INTRO */}
      <Section>
        <Card>
          <p className="text-gray-700 text-center mb-4 text-lg">
            At Invent Alliance, we believe in potentials, we embrace creativity, encourage innovation and inspire leadership.
          </p>

          <p className="text-gray-700 text-center text-lg">
            We won&apos;t offer you just a job, we will offer you a career. Got what it takes to be on our team? Start the first step below.
          </p>
        </Card>
      </Section>

      {/* NOTICE */}
      <Section>
        <div className="bg-[var(--invent-yellow)]/10 border-l-4 border-[var(--invent-yellow)] p-6 rounded-xl">
          <p className="text-gray-300 text-sm">
            <strong>Important Notice:</strong> Invent Alliance Limited will NEVER request monetary or any other form of gift in return for processing or offering employment into any Invent Alliance entity/affiliate across the globe. We also DO NOT send job offers to individuals via emails. All current job openings can be found on our career page and our social media platforms.
          </p>
        </div>
      </Section>

      {/* OPEN POSITIONS */}
      <Section>
        <Card>
          <h2 className="text-2xl font-semibold text-[var(--invent-blue-700)] mb-4">
            Open Positions
          </h2>

          <p className="text-gray-700">
            Currently, there are no open positions. Please check back later or follow us on our social media platforms for updates.
          </p>
        </Card>
      </Section>

    </PageLayout>
  );
}