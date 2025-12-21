import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our Team',
  description: 'Meet the experienced team at Invent Alliance Limited. Our professionals bring expertise in accounting, management, human resources, and more.',
  openGraph: {
    title: 'Our Team - Invent Alliance Limited',
    description: 'Meet the experienced team at Invent Alliance Limited.',
    type: 'website',
  },
};

const teamMembers = [
  {
    name: 'Francis Chidebe B.Sc, ACA',
    description: 'Francis is a seasoned Chartered Accountant and Management professional whose experience spans Investment...',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/03/1_francis-350x250.jpg',
    profileUrl: '/staff/francis-chidebe',
  },
  {
    name: 'Dumebi Ejeteh B.Sc',
    description: 'Dumebi is an astute professional with certification in Human resource and soft skill development...',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/08/dumebi-350x250.jpeg',
    profileUrl: '/staff/dumebi-ejeteh',
  },
  {
    name: 'Christopher Odinakachi B.Ed.',
    description: 'Cosmos is a gumptious professional whose experience spans the educational, political and management...',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/03/3_cosmos-350x250.jpg',
    profileUrl: '/staff/cosmos-eze',
  },
  {
    name: 'Rosemary Chukwukere B.Sc,M.Sc',
    description: 'Rosemary is a proactive, dynamic, multi-tasking and result-oriented professional with 7years experience...',
    imageUrl: 'https://www.inventallianceco.com/wp-content/uploads/2018/03/4_rose-350x250.jpg',
    profileUrl: '/staff/rosemary-chukwukere',
  },
];

export default function OurTeam() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-12 text-center text-elevated-strong">Our Team</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="glass-dark rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-slate-700/50 hover:border-slate-500/70">
                <div className="relative h-64 w-full aspect-square overflow-hidden">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover brightness-110 contrast-110 hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                    quality={90}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                  <div className="absolute inset-0 ring-2 ring-white/10 hover:ring-white/20 transition-all duration-300"></div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2 text-elevated">{member.name}</h4>
                  <p className="text-white text-sm mb-4 font-medium">{member.description}</p>
                  <Link
                    href={member.profileUrl}
                    className="text-neon-cyan hover:text-neon-blue font-bold text-sm transition-colors duration-300"
                  >
                    view profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

