import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-9xl font-extrabold text-white mb-4 text-elevated-strong neon-text-cyan">404</h1>
            <h2 className="text-3xl font-bold text-white mb-4 text-elevated-bold">Page Not Found</h2>
            <p className="text-white mb-8 text-lg font-semibold">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The page may have been moved, deleted, or the URL may be incorrect.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-gradient-neon-blue text-white px-8 py-3 rounded-lg font-bold hover-glow-blue transition-all duration-300 shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 text-elevated"
            >
              Go to Homepage
            </Link>
            <Link
              href="/products-services"
              className="inline-block glass-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-500/30 transition-all duration-300 border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:ring-offset-2 text-elevated"
            >
              View Services
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-purple-500/30">
            <p className="text-sm text-white/80 mb-4 font-semibold">Popular Pages:</p>
            <nav className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/about-us" className="text-neon-cyan hover:text-neon-blue underline font-bold transition-colors duration-300">
                About Us
              </Link>
              <Link href="/our-team" className="text-neon-purple hover:text-neon-pink underline font-bold transition-colors duration-300">
                Our Team
              </Link>
              <Link href="/blog" className="text-neon-cyan hover:text-neon-blue underline font-bold transition-colors duration-300">
                News
              </Link>
              <Link href="/contacts" className="text-neon-purple hover:text-neon-pink underline font-bold transition-colors duration-300">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

