import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';
import StructuredData from '@/components/StructuredData';
import Link from 'next/link';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Home',
  description: 'Invent Alliance Limited is a company specialized on creation of multi sector and multi discipline business platform with specialist partnerships for value co-creation.',
  openGraph: {
    title: 'Home - Invent Alliance Limited',
    description: 'Invent Alliance Limited is a company specialized on creation of multi sector and multi discipline business platform with specialist partnerships for value co-creation.',
    type: 'website',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Invent Alliance Limited',
  url: 'https://www.inventallianceco.com',
  logo: 'https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png',
  description: 'Invent Alliance Limited is a company specialized on creation of multi sector and multi discipline business platform with specialist partnerships for value co-creation.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lagos',
    addressCountry: 'NG',
  },
  sameAs: [
    // Add social media links when available
  ],
};

const services = [
  {
    title: 'Bakery Services & Consultancy',
    description: 'Our Bakery consultancy covers different aspects of bakery business from local recipe and ingredients development to innovation …',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2016/01/invent_bakery_services-512x364.png',
    imageAlt: 'invent_bakery_services',
    linkUrl: 'https://ovenfreshng.com/',
    external: true,
  },
  {
    title: 'Business Process Outsourcing',
    description: 'Digital telemarketing services, Sales Lead generation services, Business Awareness services, Contract Publishing services…',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2019/02/bpo-consulting-services.png',
    imageAlt: 'Business Process Outsourcing Services',
    linkUrl: 'https://bpo.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Virtual Office & Hosted Services Business Unit',
    description: 'Hosted office space services, Hosted shared services (secretarial, admin, HR, legal, accounting, etc), Video conferencing services…',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/08/visual_office2-512x364.jpg',
    imageAlt: 'visual_office2',
    linkUrl: '/services/visual-office-hosted-services-business-unit/',
    external: false,
  },
  {
    title: 'High Tech Logistics Business Unit',
    description: 'This service consist of: Warehouse as A Service (WaAS) storage services, Cold room storage services, Goods dispatching services…',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/08/logistics2-512x364.jpg',
    imageAlt: 'logistics2',
    linkUrl: 'https://logistics.inventallianceco.com',
    external: true,
  },
  {
    title: 'Invent Power',
    description: 'Invent Power Systems specializes in sales, designed to meet the everyday need of people leveraging on energy and power solutions.',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2021/06/invent_batteries_abt-512x364.jpg',
    imageAlt: 'invent_batteries_abt',
    linkUrl: 'https://power.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Invent Properties',
    description: 'We are a well-rounded real estate development firm that specializes in the full spectrum services for the construction and real estate industry.',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2023/06/TokyoInvent-7-512x364.jpg',
    imageAlt: 'Tokyo(Invent)-7',
    linkUrl: 'https://properties.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Invent Shortlet',
    description: 'Invent Apartment (Short-let) are tastefully designed for executives with top notch facilities that matches the global trend for hospitality.',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2023/06/invent-shortlet-home-scaled-1-512x364.jpg',
    imageAlt: 'invent-shortlet-home-scaled',
    linkUrl: 'https://shortlet.inventallianceco.com',
    external: true,
  },
];

const recentNews = [
  {
    title: 'An Appreciation from Lead-Fort Gate College',
    date: 'June 5, 2023',
    slug: '/an-appreciation-from-lead-fort-gate-college',
  },
  {
    title: "National Open University Students' Tour At The Invent",
    date: 'April 20, 2023',
    slug: '/national-open-university-students-tour-at-the-invent',
  },
];

export default function Home() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
        <Navbar />
        <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-500/10 to-cyan-500/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-center text-white text-elevated-strong">
              Our vision is to create a multi-business alliance through development of a multi sector
            </h2>
            <div className="text-center">
              <Link
                href="/products-services"
                className="inline-block bg-white text-slate-800 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
              >
                <span className="relative z-10">find out how</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Products & Services Section */}
        <section className="py-16 bg-gradient-to-b from-slate-800 via-slate-700/40 to-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.06),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(99,102,241,0.06),transparent_50%)]"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <h2 className="text-3xl font-extrabold text-center text-white mb-12 text-elevated-bold">
              Our Products & Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ServiceCard key={index} {...service} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
}

