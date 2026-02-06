'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/about-us" className="flex items-center">
            <img
              src="https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png"
              alt="Invent Alliance Limited"
              width={150}
              height={56}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>

            <div
              className="relative"
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <button type="button" className="nav-link flex items-center gap-1 px-3 py-2">
                About Us <Chevron />
              </button>

              {isAboutOpen && (
                <Dropdown>
                  <DropdownLink href="/about-us">Company Overview</DropdownLink>
                  <DropdownLink href="/our-team">Our Team</DropdownLink>
                </Dropdown>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button type="button" className="nav-link flex items-center gap-1 px-3 py-2">
                Services <Chevron />
              </button>

              {isServicesOpen && (
                <Dropdown>
                  <ExternalLink href="https://properties.inventallianceco.com/">Invent Properties</ExternalLink>
                  <ExternalLink href="https://power.inventallianceco.com/">Invent Power System</ExternalLink>
                  <ExternalLink href="https://ovenfreshng.com/">Invent Bakery</ExternalLink>
                </Dropdown>
              )}
            </div>

            <NavLink href="/blog">News</NavLink>
            <NavLink href="/careers">Careers</NavLink>
            <NavLink href="/invent-academy-registration">Invent Academy</NavLink>
            <NavLink href="/contacts">Contact</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* Components */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="nav-link px-3 py-2">{children}</Link>;
}

function Dropdown({ children }: { children: React.ReactNode }) {
  return <div className="nav-dropdown absolute left-0 mt-2 w-56 z-50">{children}</div>;
}

function DropdownLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="dropdown-link">{children}</Link>;
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="dropdown-link">
      {children}
    </a>
  );
}

function Chevron() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
