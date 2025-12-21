'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/Chatbot';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR and initial render, show children without layout to prevent hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/login');

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ChatbotWidget />
    </>
  );
}

