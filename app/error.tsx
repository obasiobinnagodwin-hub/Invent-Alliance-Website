'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-extrabold text-white mb-4 text-elevated-strong neon-text-red">Something went wrong!</h1>
          <p className="text-white mb-8 text-lg font-semibold">
            We encountered an unexpected error. Please try again or return to the homepage.
          </p>
          
          {error.digest && (
            <p className="text-sm text-white/70 mb-8 font-medium">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-block bg-gradient-neon-blue text-white px-8 py-3 rounded-lg font-bold hover-glow-blue transition-all duration-300 shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 text-elevated"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-block glass-dark text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-500/30 transition-all duration-300 border border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-neon-purple focus:ring-offset-2 text-elevated"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

