import Footer from '@/components/Footer';
import ServiceCard from '@/components/ServiceCard';

export const metadata = {
  title: 'Products & Services',
  description: 'Explore our comprehensive range of products and services including Bakery Services, Business Process Outsourcing, Real Estate, Logistics, Power Systems, and more.',
  openGraph: {
    title: 'Products & Services - Invent Alliance Limited',
    description: 'Explore our comprehensive range of products and services.',
    type: 'website',
  },
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
  // {
  //   title: 'Business Process Outsourcing',
  //   description: 'Digital telemarketing services, Sales Lead generation services, Business Awareness services, Contract Publishing services…',
  //   imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2019/02/bpo-consulting-services.png',
  //   imageAlt: 'Business Process Outsourcing Services',
  //   linkUrl: 'https://bpo.inventallianceco.com/',
  //   external: true,
  // },
  // {
  //   title: 'Virtual Office & Hosted Services Business Unit',
  //   description: 'Hosted office space services, Hosted shared services (secretarial, admin, HR, legal, accounting, etc), Video conferencing services…',
  //   imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/08/visual_office2-512x364.jpg',
  //   imageAlt: 'visual_office2',
  //   linkUrl: '/services/visual-office-hosted-services-business-unit/',
  //   external: false,
  // },
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
    imageAlt: 'invent-shortlet-home-scaled',
    linkUrl: 'https://properties.inventallianceco.com/',
    external: true,
  },
  {
    title: 'Invent Shortlet',
    description: 'Invent Apartment (Short-let) are tastefully designed for executives with top notch facilities that matches the global trend for hospitality.',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2023/06/invent-shortlet-home-scaled-1-512x364.jpg',
    imageAlt: 'Tokyo(Invent)-7',
    linkUrl: 'https://shortlet.inventallianceco.com',
    external: true,
  },
  {
    title: 'iWorkZone',
    description: 'A creative fully furnished work station located in the heart of Ajah, which has a kitchenette and of course 24/7 power and fast internet access..',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2025/12/iwork-zone-desk-scaled-1-512x364.jpg',
    imageAlt: 'iwork-zone-desk-scaled',
    linkUrl: 'https://iworkzone.ng/',
    external: true,
  },
];

export default function ProductsServices() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-12 text-center text-elevated-strong">Our Products & Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} />
            ))}
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

