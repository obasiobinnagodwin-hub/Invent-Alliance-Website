import PageLayout from '@/components/layout/PageLayout';
import ServiceCard from '@/components/ServiceCard';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';

// ⚠️ REMOVE StructuredData + Reveal for now (they are likely causing the crash)

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Home',
  description:
    'Invent Alliance Limited is a company specialized on creation of multi sector and multi discipline business platform with specialist partnerships for value co-creation.',
};

const services = [
  {
    title: 'Bakery Services & Consultancy',
    description:
      'Our Bakery consultancy covers different aspects of bakery business from local recipe and ingredients development to innovation.',
    imageUrl: '/images/services/bakery.jpg',
    imageAlt: 'invent_bakery_services',
    linkUrl: 'https://ovenfreshng.com/',
    external: true,
  },
  {
    title: 'Business Process Outsourcing',
    description:
      'Digital telemarketing, sales lead generation, business awareness, and contract publishing services.',
    imageUrl: '/images/services/bpo.jpg',
    imageAlt: 'Business Process Outsourcing Services',
    linkUrl: 'https://bpo.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Virtual Office & Hosted Services',
    description:
      'Hosted office space, admin support, HR, legal, accounting, and conferencing services.',
    imageUrl: '/images/services/virtual-office.jpg',
    imageAlt: 'visual_office2',
    linkUrl: '/services/visual-office-hosted-services-business-unit/',
  },
  {
    title: 'High Tech Logistics',
    description:
      'Warehouse services, cold storage, and goods dispatching solutions.',
    imageUrl: '/images/services/logistics.jpg',
    imageAlt: 'logistics2',
    linkUrl: 'https://logistics.inventallianceco.com',
    external: true,
  },
  {
    title: 'Invent Power',
    description:
      'Reliable energy and power solutions designed for everyday needs.',
    imageUrl: '/images/services/power.jpg',
    imageAlt: 'invent_batteries_abt',
    linkUrl: 'https://power.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Invent Properties',
    description:
      'Real estate development and construction services across multiple sectors.',
    imageUrl: '/images/services/properties.jpg',
    imageAlt: 'invent properties',
    linkUrl: 'https://properties.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Invent Shortlet',
    description:
      'Tastefully designed short-let apartments with premium facilities.',
    imageUrl: '/images/services/shortlet.jpg',
    imageAlt: 'Invent Shortlet',
    linkUrl: 'https://shortlet.inventallianceco.com',
    external: true,
  },
  {
    title: 'iWorkZone',
    description:
      'Flexible coworking and office solutions designed for productivity and collaboration.',
    imageUrl: '/images/services/iworkzone.jpg',
    imageAlt: 'iWorkZone',
    linkUrl: 'https://iworkzone.ng',
    external: true,
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[90vh] overflow-hidden">
        <HeroCarousel />
      </section>

      {/* TRUST SECTION */}
      <section className="bg-invent-soft py-16">
        <div className="flex flex-wrap justify-center items-center gap-8 text-muted text-sm">
          <span>Trusted in Warehousing & Logistics</span>
          <span>Energy Solutions</span>
          <span>Enterprise Services</span>
          <span>Apartments & Shortlet Management</span>
          <span>Property Development & Management</span>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 bg-light">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--invent-blue-700)] mb-12">
          Our Products & Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </section>

      {/* CTA */}
<section className="bg-invent-dark text-white py-20 text-center">
  <h2 className="text-4xl font-bold text-[var(--invent-blue 50)]">
    Ready to Transform Your Business?
  </h2>

  <p className="mt-4 text-[var(--invent-yellow)]">
    Let’s build scalable and secure solutions together.
  </p>

  <Link
    href="/contacts"
    className="inline-block mt-6 bg-[var(--invent-yellow)] text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
  >
    Contact Us
  </Link>
</section>
    </>
  );
}