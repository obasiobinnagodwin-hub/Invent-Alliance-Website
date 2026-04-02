'use client';

import Navbar from '@/components/Navbar'; // ✅ NORMAL IMPORT
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/Chatbot';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="pt-20 min-h-screen">
        {children}
      </main>

      <Footer />
      <ChatbotWidget />
    </>
  );
}