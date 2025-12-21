import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'An Appreciation from Lead-Fort Gate College - Invent Alliance Limited',
  description: 'An appreciation letter from Lead-Fort Gate College.',
};

export default function BlogPost() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-neon-cyan hover:text-neon-blue mb-4 inline-block font-bold transition-colors duration-300">
            ← Back to News
          </Link>
          <article className="glass-dark rounded-lg shadow-neon-purple p-8 border border-purple-500/30">
            <h1 className="text-4xl font-extrabold text-white mb-4 text-elevated-strong">
              An Appreciation from Lead-Fort Gate College
            </h1>
            <p className="text-white/70 mb-8 font-semibold">June 5, 2023</p>
            <div className="prose max-w-none text-white">
              <p className="font-semibold mb-4">
                We are honored to have received an appreciation letter from Lead-Fort Gate College. 
                This recognition reflects our commitment to excellence and our dedication to serving 
                the community through our various business units.
              </p>
              <p className="font-semibold">
                At Invent Alliance Limited, we believe in creating value through partnerships and 
                collaboration. The appreciation from Lead-Fort Gate College serves as a testament 
                to our mission of providing quality services across all our business segments.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

