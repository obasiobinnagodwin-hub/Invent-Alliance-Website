'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
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
                  <ExternalLink href="https://bpo.inventallianceco.com/">Telemarketing</ExternalLink>
                  <ExternalLink href="https://iworkzone.ng/">Work Station</ExternalLink>
                  <ExternalLink href="https://logistics.inventallianceco.com/">Hightech Warehousing</ExternalLink>
                  <ExternalLink href="https://shortlet.inventallianceco.com/">Invent Shortlet Apartments</ExternalLink>
                  
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

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="nav-link px-3 py-2">
      {children}
    </Link>
  );
}

function Dropdown({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ul className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-md z-50 py-2">
      {children}
    </ul>
  );
}

function DropdownLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block px-4 py-2 text-sm text-yellow-500 hover:bg-yellow-50"
      >
        {children}
      </Link>
    </li>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-yellow-500 hover:bg-yellow-50"
      >
        {children}
      </a>
    </li>
  );
}

function Chevron() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}