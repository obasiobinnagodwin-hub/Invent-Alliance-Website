import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export const metadata = {
  title: 'About Us - Invent Alliance Limited',
  description: 'Discover Invent Alliance Limited: A globally recognized multi-sector enterprise delivering innovative business solutions through strategic partnerships. Learn about our mission, values, diverse portfolio, and commitment to excellence.',
  openGraph: {
    title: 'About Us - Invent Alliance Limited',
    description: 'A forward-thinking, diversified multi-sector enterprise pioneering innovative business platforms through strategic partnerships and collaborative value creation.',
    type: 'website',
  },
};

const teamMembers = [
  {
    name: 'Francis Chidebe B.Sc, ACA',
    description: 'Francis is a seasoned Chartered Accountant and Management professional whose experience spans Investment...',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/03/1_francis-350x250.jpg',
  },
  {
    name: 'Favour David',
    description: 'Updating...',
    imageUrl: 'https://ui-avatars.com/api/?name=Favour+David&background=3b82f6&color=fff&size=400&bold=true',
  },
  {
    name: 'Christopher Odinakachi',
    description: 'Updating...',
    imageUrl: 'https://ui-avatars.com/api/?name=Christopher+Odinakachi&background=3b82f6&color=fff&size=400&bold=true',
  },
  {
    name: 'Obinna Obasi',
    description: 'Updating...',
    imageUrl: 'https://ui-avatars.com/api/?name=Obinna+Obasi&background=3b82f6&color=fff&size=400&bold=true',
  },
  {
    name: 'Chizoba Ezeigwe',
    description: 'Updating...',
    imageUrl: 'https://ui-avatars.com/api/?name=Chizoba+Ezeigwe&background=3b82f6&color=fff&size=400&bold=true',
  },
  {
    name: 'Okechukwu Umehan',
    description: 'Updating...',
    imageUrl: 'https://ui-avatars.com/api/?name=Okechukwu+Umehan&background=3b82f6&color=fff&size=400&bold=true',
  },
];

const values = [
  { 
    title: 'Customer Excellence', 
    description: 'We forge strategic, long-term partnerships with our clients, delivering innovative solutions and exceptional service excellence that consistently exceed expectations. Our commitment to understanding and anticipating client needs drives our continuous pursuit of superior value creation across all business segments.' 
  },
  { 
    title: 'Global Quality Standards', 
    description: 'We maintain world-class quality standards through continuous innovation, diverse product portfolios, and proactive adaptation to evolving global industry trends. Our rigorous quality assurance processes ensure compliance with international best practices while meeting the unique requirements of local and international markets.' 
  },
  { 
    title: 'Strategic Partnerships', 
    description: 'We cultivate robust, mutually beneficial relationships with our supplier network, fostering collaboration and reliability. Through transparent communication and ethical business practices, we ensure sustainable value creation for all stakeholders while maintaining the highest standards of corporate governance and shareholder value enhancement.' 
  },
  { 
    title: 'People & Culture', 
    description: 'We invest in our people as our most valuable asset, creating an inclusive, high-performance culture that empowers professional growth and career advancement. Our commitment includes providing a safe, rewarding work environment, competitive compensation, and recognition programs that celebrate excellence and innovation in service delivery.' 
  },
  { 
    title: 'Innovation & Technology', 
    description: 'We leverage cutting-edge technology and industry expertise to deliver customized solutions across all sectors, optimizing quality, functionality, and value. Our technical consulting services enable clients to enhance their competitive advantage through strategic product development and service optimization initiatives.' 
  },
  { 
    title: 'Sustainable Growth', 
    description: 'We drive sustainable, profitable growth through strategic management, operational excellence, and prudent financial stewardship. Our diversified business model ensures long-term financial stability while delivering exceptional returns through the strategic marketing and delivery of premium products and services across multiple industry verticals.' 
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-elevated-strong">About Us</h1>

          {/* Company Description */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-4 text-elevated-bold">About Invent Alliance Limited</h3>
            <p className="text-white mb-4 font-medium leading-relaxed text-lg">
              Invent Alliance Limited is a globally recognized, diversified multi-sector enterprise that specializes in creating innovative business ecosystems through strategic partnerships and collaborative value creation. We operate on the principle of co-opetition; a forward-thinking business model that harmonizes collaboration with competitive excellence. This enables us to deliver exceptional value across diverse industry sectors while maintaining our position as a trusted partner to clients, stakeholders, and communities worldwide.
            </p>
            <p className="text-white mb-4 font-medium leading-relaxed">
              Our unique organizational architecture is built around autonomous Strategic Business Units (SBUs), each operating with complete profit and loss accountability. This decentralized, entrepreneurial model empowers our teams to respond swiftly to market opportunities, make data-driven decisions, and drive innovation while maintaining strategic alignment with our unified corporate mission and values.
            </p>
            <p className="text-white mb-4 font-medium leading-relaxed">
              With a presence spanning multiple continents and a commitment to excellence, we leverage our diverse expertise to create sustainable, scalable solutions that address complex business challenges. Our integrated approach enables cross-sector synergies, knowledge sharing, and resource optimization, resulting in enhanced value delivery across all our business segments.
            </p>
            <div className="mt-6 p-6 glass-dark rounded-lg border border-slate-600/50">
              <h4 className="text-xl font-bold text-white mb-4 text-elevated-bold">Our Strategic Business Units</h4>
              <p className="text-white/90 mb-4 font-medium">
                Our diversified portfolio encompasses the following strategic sectors, each managed by dedicated teams of industry experts:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white/90 font-medium">
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Real Estate Development & Property Management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Energy & Power Solutions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Food & Beverage Services (Bakery & Confectionery)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Business Process Outsourcing & Digital Services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Logistics & Supply Chain Management</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Hospitality & Short-Term Accommodation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Virtual Office & Hosted Business Services</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Mission Statement */}
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-2 text-elevated-bold">Mission Statement</h3>
            <p className="text-white/90 mb-6 font-medium leading-relaxed max-w-4xl">
              To be a globally recognized leader in multi-sector business innovation, delivering exceptional value through strategic partnerships, operational excellence, and sustainable growth. We are committed to transforming industries, empowering communities, and creating lasting impact through our diverse portfolio of world-class products and services.
            </p>
            <h4 className="text-xl font-bold text-white mb-4 text-elevated-bold mt-8">Our Core Values</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="glass-dark p-6 rounded-lg shadow-xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300">
                  <h5 className="text-lg font-bold text-white mb-3 text-elevated">{value.title}</h5>
                  <p className="text-white/90 text-sm font-medium leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <h4 className="text-2xl font-bold text-white mb-4 text-elevated-bold">Leadership Team</h4>
            <p className="text-white/90 mb-6 font-medium leading-relaxed max-w-3xl">
              Our leadership team comprises accomplished professionals with diverse expertise spanning finance, human resources, operations, and strategic management. Their collective experience and commitment to excellence drive our organization&apos;s continued growth and success in delivering world-class solutions to our global clientele.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="glass-dark rounded-lg shadow-xl overflow-hidden border border-slate-700/50 hover:border-slate-500/70 transition-all duration-300">
                  <div className="relative h-64 w-full aspect-square overflow-hidden bg-slate-700 flex items-center justify-center">
                    {member.imageUrl.includes('ui-avatars.com') || member.description === 'Updating...' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
                        <span className="text-white text-6xl font-bold">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    ) : (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover brightness-110 contrast-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        loading="lazy"
                        quality={90}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    )}
                    <div className="absolute inset-0 ring-2 ring-white/10"></div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-white mb-2 text-elevated">{member.name}</h4>
                    <p className="text-white text-sm font-medium">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

