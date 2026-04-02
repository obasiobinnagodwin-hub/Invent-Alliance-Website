import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const recentNews = [
    {
      title: "An Appreciation from Lead-Fort Gate College",
      date: "June 5, 2023",
      slug: "/an-appreciation-from-lead-fort-gate-college"
    },
    {
      title: "National Open University Students' Tour At The Invent",
      date: "April 20, 2023",
      slug: "/national-open-university-students-tour-at-the-invent"
    }
  ];

  return (
    <footer className="bg-invent-dark text-white relative overflow-hidden">
      
      {/* subtle glow */}
      <div className="absolute inset-0 bg-invent-gradient-glow opacity-20 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* COMPANY */}
          <div>
            <h4 className="text-xl font-bold mb-4">
              Invent Alliance Limited
            </h4>

            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Invent Alliance Limited is a multi-sector business platform focused on value co-creation through strategic partnerships and modern business principles.
            </p>

            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--invent-yellow)] hover:opacity-90 transition"
            >
              Learn more →
            </Link>
          </div>

          {/* NEWS */}
          <div>
            <h4 className="text-xl font-bold mb-4">
              Recent News
            </h4>

            <ul className="space-y-4">
              {recentNews.map((news, index) => (
                <li key={index}>
                  <Link
                    href={news.slug}
                    className="text-sm font-medium text-white hover:text-[var(--invent-yellow)] transition"
                  >
                    {news.title}
                  </Link>
                  <p className="text-xs text-white/60 mt-1">
                    {news.date}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* LINKS */}
          <div>
            <h4 className="text-xl font-bold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about-us" },
                { name: "Our Team", href: "/our-team" },
                { name: "Services", href: "/products-services" },
                { name: "News", href: "/blog" },
                { name: "Careers", href: "/careers" },
                { name: "Invent Academy", href: "/invent-academy-registration" },
                { name: "Contact", href: "/contacts" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 hover:text-[var(--invent-yellow)] transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items flex justify-center gap-6">

          <div className="text-sm text-white/70 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Invent Alliance Limited. All rights reserved.</p>
            <p className="mt-1">Redesigned by Invent IT Team</p>
          </div>

          {/* SOCIALS */}
          <div className="flex gap-5 text-lg">
            <a
              href="#"
              className="text-white/70 hover:text-[var(--invent-yellow)] transition transform hover:scale-110"
            >
              <FaFacebookF />
            </a>

            <a
              href="#"
              className="text-white/70 hover:text-[var(--invent-yellow)] transition transform hover:scale-110"
            >
              <FaTwitter />
            </a>

            <a
              href="#"
              className="text-white/70 hover:text-[var(--invent-yellow)] transition transform hover:scale-110"
            >
              <FaInstagram />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}