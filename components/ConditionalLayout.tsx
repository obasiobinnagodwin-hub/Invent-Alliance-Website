'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Conditionally use dynamic import for ChatbotWidget when feature is enabled
// Load chatbot only when user opens it or after a small delay to reduce initial bundle
// Always use dynamic import to avoid SSR issues - Next.js handles this efficiently
const ChatbotWidget = dynamic(() => import('@/components/Chatbot'), {
  ssr: false, // Chatbot is client-only, no SSR needed
  loading: () => null, // No loading indicator for chatbot button
});

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

