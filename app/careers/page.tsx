import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Careers',
  description: 'Join our team at Invent Alliance Limited. We believe in potentials, embrace creativity, encourage innovation and inspire leadership.',
  openGraph: {
    title: 'Careers - Invent Alliance Limited',
    description: 'Join our team at Invent Alliance Limited. Explore career opportunities.',
    type: 'website',
  },
};

export default function Careers() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white mb-8 text-center text-elevated-strong">Careers</h1>
          
          <div className="glass-dark rounded-lg shadow-neon-purple p-8 mb-8 border border-purple-500/30">
            <p className="text-white mb-4 text-lg font-bold text-elevated">
              At Invent Alliance, we believe in potentials, we embrace creativity, encourage innovation and inspire leadership.
            </p>
            <p className="text-white mb-6 text-lg font-semibold">
              We won&apos;t offer you just a job, we will offer you a career. Got what it takes to be on our team? Start the first step below.
            </p>
            <div className="bg-yellow-500/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r">
              <p className="text-sm text-white font-semibold">
                <strong className="text-elevated">Important Notice:</strong> Invent Alliance Limited will NEVER request monetary or any other form of gift in return for processing or offering employment into any Invent Alliance entity/affiliate across the globe. We also DO NOT send job offers to individuals via emails. All current job openings can be found on our career page and our social media platforms.
              </p>
            </div>
          </div>

          <div className="glass-dark rounded-lg shadow-neon-cyan p-8 border border-cyan-500/30">
            <h2 className="text-2xl font-bold text-white mb-6 text-elevated-bold">Open Positions</h2>
            <p className="text-white font-medium">
              Currently, there are no open positions. Please check back later or follow us on our social media platforms for updates.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

