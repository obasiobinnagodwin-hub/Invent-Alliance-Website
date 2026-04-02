import Image from 'next/image';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/ui/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'About Us - Invent Alliance Limited',
  description:
    'Discover Invent Alliance Limited: A globally recognized multi-sector enterprise delivering innovative business solutions.',
};

const teamMembers = [
  {
    name: 'Francis Chidebe',
    description:
      'Chartered Accountant and management professional leading Finance and Admin at Invent Alliance Limited.....',
    imageUrl: '/images/francis.jpg',
  },
  {
    name: 'Nmesoma Favour David',
    description:
      'Facility Manager with a Civil Engineering background and hands-on construction experience.....',
    imageUrl: '/images/favour.jpg',
  },
  {
    name: 'Christopher Odinakachi',
    description:
      'Customer Relations Officer with experience in sales support and customer engagement.....',
    imageUrl: '/images/christopher.jpg',
  },
  {
    name: 'Obasi Obinna Godwin',
    description:
      'IT and cybersecurity professional specializing in network security and infrastructure reliability.....',
    imageUrl: '/images/obinna.jpg',
  },
  {
    name: 'Chizoba Ezeigwe',
    description:
      'Hospitality and operations professional specializing in serviced apartment management.....',
    imageUrl: '/images/chizoba.jpg',
  },
  {
    name: 'Okechukwu Umeham',
    description:
      'Bakery Operations Manager with extensive experience in large-scale production.....',
    imageUrl: '/images/okechukwu.jpg',
  },
];

const values = [
  {
    title: 'Customer Excellence',
    description:
      'We build long-term partnerships and deliver solutions that consistently exceed expectations.',
  },
  {
    title: 'Global Quality Standards',
    description:
      'We maintain world-class standards through innovation and best practices.',
  },
  {
    title: 'Strategic Partnerships',
    description:
      'We create sustainable value through trusted collaborations and ethical practices.',
  },
  {
    title: 'People & Culture',
    description:
      'We empower our people with growth opportunities in a high-performance environment.',
  },
  {
    title: 'Innovation & Technology',
    description:
      'We leverage modern technology to deliver scalable and efficient solutions.',
  },
  {
    title: 'Sustainable Growth',
    description:
      'We ensure long-term success through strategic management and operational excellence.',
  },
];

export default function AboutUs() {
  return (
    <PageLayout>
      {/* HERO */}
      <PageHero
        title="About Us"
        subtitle="Building innovative business ecosystems through strategic partnerships"
      />

      {/* COMPANY */}
      <Section>
        <h2 className="text-2xl font-semibold text-[var(--invent-blue-50)] mb-4">
          About Invent Alliance Limited
        </h2>

        <div className="space-y-4 text-gray-200 leading-relaxed">
          <p>
            Invent Alliance Limited is a diversified multi-sector enterprise
            focused on building innovative business ecosystems through
            strategic partnerships and collaborative value creation.
          </p>

          <p>
            Our structure is built around autonomous Strategic Business Units
            (SBUs), enabling agility, innovation, and data-driven
            decision-making across all sectors.
          </p>

          <p>
            With a growing presence and commitment to excellence, we deliver
            scalable solutions across multiple industries while maintaining
            strong alignment with our corporate mission.
          </p>
        </div>

        {/* BUSINESS UNITS */}
        <div className="mt-8">
          <Card>
            <h3 className="text-xl font-semibold text-[var(--invent-blue-700)] mb-4">
              Our Strategic Business Units
            </h3>

            <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
              {[
                'Real Estate Development & Property Management',
                'Energy & Power Solutions',
                'Food & Beverage Services',
                'Business Process Outsourcing',
                'Logistics & Supply Chain',
                'Hospitality & Accommodation',
                'Virtual Office Services',
              ].map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--invent-blue-600)]">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* VALUES */}
      <Section>
        <h2 className="text-2xl font-semibold text-[var(--invent-blue-50)] mb-6">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <Card key={i}>
              <h3 className="font-semibold text-[var(--invent-blue-700)] mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {value.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* TEAM */}
      <Section>
        <h2 className="text-2xl font-semibold text-[var(--invent-blue-50)] mb-6">
          Leadership Team
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <Card key={i}>
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={member.imageUrl}
                  alt={member.name}
                  fill
                  className="object-cover brightness-110 contrast-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                  quality={90}
                />
              </div>

              <h3 className="font-semibold text-[var(--invent-blue-700)] mb-1">
                {member.name}
              </h3>

              <p className="text-gray-600 text-sm">
                {member.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}