'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/about-us" className="flex items-center group" aria-label="Invent Alliance Limited - About Us">
            <div className="relative px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-white/60 group-hover:bg-white/90 group-hover:border-white/70 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_4px_16px_rgba(255,165,0,0.3)] group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.5),0_8px_24px_rgba(255,165,0,0.5)] group-hover:-translate-y-1 transform transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Image
                src="https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png"
                alt="Invent Alliance Limited"
                width={160}
                height={64}
                className="h-auto relative z-10 transition-all duration-300 group-hover:scale-115 brightness-125 contrast-125 drop-shadow-[0_0_20px_rgba(255,165,0,0.6),0_0_40px_rgba(255,165,0,0.4),0_8px_16px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(255,165,0,0.8),0_0_60px_rgba(255,165,0,0.6),0_12px_24px_rgba(0,0,0,0.6)] transform group-hover:-translate-y-0.5"
                style={{ 
                  filter: 'sepia(0.3) saturate(1.5) hue-rotate(5deg) brightness(1.1) contrast(1.1)',
                  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                }}
                priority
                quality={100}
              />
              <div className="absolute inset-0 ring-2 ring-white/30 group-hover:ring-white/40 rounded-lg transition-all duration-300"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-400/20 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300 -z-10"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-white hover:text-neon-cyan transition-all duration-300 hover-neon relative group font-bold text-elevated"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-neon-cyan group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* About Us Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <Link
                href="/about-us"
                className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 flex items-center group font-bold text-elevated"
              >
                About Us
                <svg className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {isAboutOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-slate-800/98 backdrop-blur-md rounded-md py-1 border border-slate-600/50 shadow-xl z-50">
                  <Link
                    href="/our-team"
                    onClick={() => setIsAboutOpen(false)}
                    className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    Our Team
                  </Link>
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <Link
                href="/products-services"
                className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 flex items-center group font-bold text-elevated"
              >
                Services
                <svg className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {isServicesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-slate-800/98 backdrop-blur-md rounded-md py-1 border border-slate-600/50 shadow-xl z-50">
                  <Link
                    href="https://properties.inventallianceco.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsServicesOpen(false)}
                    className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    Invent Properties
                  </Link>
                  <Link
                    href="https://power.inventallianceco.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsServicesOpen(false)}
                    className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    Invent Power System
                  </Link>
                  <Link
                    href="https://ovenfreshng.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsServicesOpen(false)}
                    className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300"
                  >
                    Invent Bakery
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 relative group font-bold text-elevated"
            >
              News
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/careers"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 relative group font-bold text-elevated"
            >
              Careers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/invent-academy-registration"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 relative group font-bold text-elevated"
            >
              Invent Academy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/contacts"
              className="px-4 py-2 text-white hover:text-blue-300 transition-all duration-300 relative group font-bold text-elevated"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-blue-300 transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-600/40 bg-slate-800/98 backdrop-blur-md">
            <Link
              href="/"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/our-team"
              className="block px-4 py-2 pl-8 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Our Team
            </Link>
            <Link
              href="/products-services"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/blog"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link
              href="/careers"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Careers
            </Link>
            <Link
              href="/invent-academy-registration"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Invent Academy
            </Link>
            <Link
              href="/contacts"
              className="block px-4 py-2 text-white hover:text-blue-300 hover:bg-slate-700/50 transition-all duration-300 font-bold text-elevated"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

