import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: "National Open University Students' Tour At The Invent - Invent Alliance Limited",
  description: 'Students from National Open University visited The Invent on an educational tour.',
};

export default function BlogPost() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-neon-cyan hover:text-neon-blue mb-4 inline-block font-bold transition-colors duration-300">
            ← Back to News
          </Link>
          <article className="glass-dark rounded-lg shadow-neon-purple p-8 border border-purple-500/30">
            <h1 className="text-4xl font-extrabold text-white mb-4 text-elevated-strong">
              National Open University Students&apos; Tour At The Invent
            </h1>
            <p className="text-white/70 mb-8 font-semibold">April 20, 2023</p>
            <div className="prose max-w-none text-white">
              <p className="font-semibold mb-4">
                We were delighted to host students from the National Open University who visited 
                The Invent on an educational tour. The students had the opportunity to learn about 
                our various business units and operations.
              </p>
              <p className="font-semibold mb-4">
                During the tour, students explored our facilities and gained insights into our 
                multi-sector business platform, including our bakery services, business process 
                outsourcing, logistics, and other strategic business units.
              </p>
              <p className="font-semibold">
                At Invent Alliance Limited, we are committed to supporting educational 
                initiatives and providing learning opportunities for students. We believe in 
                fostering knowledge sharing and contributing to the development of future 
                professionals.
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

