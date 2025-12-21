import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Force static generation
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'News',
  description: 'Latest news and updates from Invent Alliance Limited. Stay informed about our company activities, events, and achievements.',
  openGraph: {
    title: 'News - Invent Alliance Limited',
    description: 'Latest news and updates from Invent Alliance Limited.',
    type: 'website',
  },
};

const blogPosts = [
  {
    title: 'An Appreciation from Lead-Fort Gate College',
    date: 'June 5, 2023',
    slug: '/an-appreciation-from-lead-fort-gate-college',
    excerpt: 'We received an appreciation letter from Lead-Fort Gate College...',
  },
  {
    title: "National Open University Students' Tour At The Invent",
    date: 'April 20, 2023',
    slug: '/national-open-university-students-tour-at-the-invent',
    excerpt: 'Students from National Open University visited our facilities...',
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-12 text-center text-elevated-strong">News</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="glass-dark rounded-lg shadow-neon-purple overflow-hidden hover:shadow-neon-cyan transition-all duration-300 border border-purple-500/30 hover:border-cyan-500/50">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2 text-elevated">
                    <Link href={post.slug} className="hover:text-neon-purple transition-colors duration-300">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-white/70 text-sm mb-4 font-medium">{post.date}</p>
                  <p className="text-white mb-4 font-medium">{post.excerpt}</p>
                  <Link
                    href={post.slug}
                    className="text-neon-cyan hover:text-neon-blue font-bold transition-colors duration-300"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

