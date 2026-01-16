import Link from 'next/link';

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
    <footer className="bg-slate-800/95 backdrop-blur-md text-white border-t border-slate-600/40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-neon opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h4 className="text-white text-lg font-extrabold mb-4 gradient-text-blue text-elevated-bold">Invent Alliance Limited</h4>
            <p className="text-sm mb-4 text-white font-medium">
              Invent Alliance Limited is a company specialized on creation of multi sector and multi discipline business platform with specialist partnerships for value co-creation in each of the different business segments through modern co-petition business principles.
            </p>
            <Link
              href="/about-us"
              className="text-neon-cyan hover:text-neon-blue text-sm font-bold transition-colors duration-300 inline-flex items-center gap-1 group text-elevated"
            >
              Learn more
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>

          {/* Recent News */}
          <div>
            <h4 className="text-white text-lg font-extrabold mb-4 gradient-text-purple text-elevated-bold">Recent News</h4>
            <ul className="space-y-2">
              {recentNews.map((news, index) => (
                <li key={index}>
                  <Link
                    href={news.slug}
                    className="text-sm text-white hover:text-neon-purple transition-colors duration-300 inline-block group font-semibold"
                  >
                    {news.title}
                    <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </Link>
                  <p className="text-xs text-white/70 mt-1 font-medium">{news.date}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-extrabold mb-4 gradient-text-cyan text-elevated-bold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-white hover:text-neon-cyan transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Home
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="text-sm text-white hover:text-neon-purple transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  About Us
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/our-team" className="text-sm text-white hover:text-neon-purple transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Our Team
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/products-services" className="text-sm text-white hover:text-neon-cyan transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Services
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white hover:text-neon-purple transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  News
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-white hover:text-neon-cyan transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Careers
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/invent-academy-registration" className="text-sm text-white hover:text-neon-purple transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Invent Academy
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-sm text-white hover:text-neon-cyan transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Contact
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-white hover:text-neon-cyan transition-colors duration-300 inline-flex items-center gap-1 group font-semibold">
                  Privacy Policy
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-600/40 mt-8 pt-8 text-center text-sm">
          <p className="text-white/80">
            &copy; {new Date().getFullYear()} Invent Alliance Limited. All rights reserved.
          </p>
          <p className="mt-2 text-white/80">Redesigned by Invent IT Team</p>
        </div>
      </div>
    </footer>
  );
}

