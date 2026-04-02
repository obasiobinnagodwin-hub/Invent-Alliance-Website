'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const aboutTimeout = useRef<NodeJS.Timeout | null>(null);
  const servicesTimeout = useRef<NodeJS.Timeout | null>(null);

  const openMenu = (setFn: any, timeoutRef: any) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFn(true);
  };

  const closeMenu = (setFn: any, timeoutRef: any) => {
    timeoutRef.current = setTimeout(() => setFn(false), 300);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 navbar shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <img
            src="https://www.inventallianceco.com/wp-content/uploads/2018/01/invent_mainx1.png"
            alt="Invent Alliance Limited"
            className="h-12 w-auto"
          />
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-6">

          <NavLink href="/" active={isActive('/')}>Home</NavLink>

          {/* ABOUT */}
          <div
            className="relative"
            onMouseEnter={() => openMenu(setIsAboutOpen, aboutTimeout)}
            onMouseLeave={() => closeMenu(setIsAboutOpen, aboutTimeout)}
          >
            <button className="nav-link flex items-center gap-1">
              About Us <Chevron />
            </button>

            {isAboutOpen && (
              <Dropdown>
                <DropdownLink href="/about-us">Company Overview</DropdownLink>
                <DropdownLink href="/our-team">Our Team</DropdownLink>
              </Dropdown>
            )}
          </div>

          {/* SERVICES */}
          <div
            className="relative"
            onMouseEnter={() => openMenu(setIsServicesOpen, servicesTimeout)}
            onMouseLeave={() => closeMenu(setIsServicesOpen, servicesTimeout)}
          >
            <button className="nav-link flex items-center gap-1">
              Services <Chevron />
            </button>

            {isServicesOpen && (
              <Dropdown>
                <ExternalLink href="https://properties.inventallianceco.com/">Property Development</ExternalLink>
                <ExternalLink href="https://power.inventallianceco.com/">Invent Power & System</ExternalLink>
                <ExternalLink href="https://ovenfreshng.com/">Bakery & Consultancy Services</ExternalLink>
                <ExternalLink href="https://bpo.inventallianceco.com/">Telemarketing</ExternalLink>
                <ExternalLink href="https://iworkzone.ng/">Work Station</ExternalLink>
                <ExternalLink href="https://logistics.inventallianceco.com/">Hightech Warehousing</ExternalLink>
                <ExternalLink href="https://shortlet.inventallianceco.com/">Shortlet Apartments Rental</ExternalLink>
              </Dropdown>
            )}
          </div>

          <NavLink href="/blog" active={isActive('/blog')}>News</NavLink>
          <NavLink href="/careers" active={isActive('/careers')}>Careers</NavLink>
          <NavLink href="/invent-academy-registration" active={isActive('/invent-academy-registration')}>
            Invent Academy
          </NavLink>
          <NavLink href="/contacts" active={isActive('/contacts')}>Contact</NavLink>

          {/* CTA */}
          <Link
            href="/contacts"
            className="ml-4 bg-[var(--invent-yellow)] text-black px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>

        </div>

        {/* MOBILE BUTTON */}
        <button
          className="lg:hidden text-[var(--invent-blue)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-6 py-4 flex flex-col gap-4 text-sm text-[var(--invent-blue)]">

            <MobileLink href="/" close={() => setMobileOpen(false)}>Home</MobileLink>
            <MobileLink href="/about-us" close={() => setMobileOpen(false)}>About Us</MobileLink>
            <MobileLink href="/our-team" close={() => setMobileOpen(false)}>Our Team</MobileLink>
            <MobileLink href="/products-services" close={() => setMobileOpen(false)}>Services</MobileLink>
            <MobileLink href="/blog" close={() => setMobileOpen(false)}>News</MobileLink>
            <MobileLink href="/careers" close={() => setMobileOpen(false)}>Careers</MobileLink>
            <MobileLink href="/invent-academy-registration" close={() => setMobileOpen(false)}>Invent Academy</MobileLink>
            <MobileLink href="/contacts" close={() => setMobileOpen(false)}>Contact</MobileLink>

          </div>
        </div>
      )}
    </nav>
  );
}

/* Components */

function NavLink({ href, children, active }: any) {
  return (
    <Link
      href={href}
      className={`nav-link ${active ? 'nav-active font-semibold' : ''}`}
    >
      {children}
    </Link>
  );
}

function MobileLink({ href, children, close }: any) {
  return (
    <Link href={href} onClick={close} className="hover:text-[var(--invent-yellow)]">
      {children}
    </Link>
  );
}

function Dropdown({ children }: any) {
  return (
    <ul className="absolute left-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2">
      {children}
    </ul>
  );
}

function DropdownLink({ href, children }: any) {
  return (
    <li>
      <Link href={href} className="block px-4 py-2 text-sm text-dark hover:bg-light hover:text-primary transition">
        {children}
      </Link>
    </li>
  );
}

function ExternalLink({ href, children }: any) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer"
        className="block px-4 py-2 text-sm text-dark hover:bg-light hover:text-primary transition">
        {children}
      </a>
    </li>
  );
}

function Chevron() {
  return (
    <svg className="w-4 h-4 text-[var(--invent-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}