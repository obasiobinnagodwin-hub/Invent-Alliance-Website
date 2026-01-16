'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    analytics: false, // Default false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookie-consent='));

    if (consentCookie) {
      // Parse existing consent
      const consentValue = consentCookie.split('=')[1];
      try {
        const parsed = JSON.parse(decodeURIComponent(consentValue));
        setPreferences({
          necessary: true, // Always true
          analytics: parsed.analytics === true,
        });
        setShowBanner(false);
      } catch {
        // If parsing fails, show banner
        setShowBanner(true);
      }
    } else {
      // No consent cookie found, show banner
      // Note: Middleware will check FEATURE_COOKIE_CONSENT flag and only respect consent if enabled
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (analytics: boolean) => {
    const consent: CookiePreferences = {
      necessary: true,
      analytics,
    };

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie-preferences', JSON.stringify(consent));
    }

    // Set cookie (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const cookieValue = JSON.stringify(consent);
    document.cookie = `cookie-consent=${encodeURIComponent(cookieValue)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

    setPreferences(consent);
    setShowBanner(false);

    // Reload page to apply consent changes (analytics tracking will start/stop)
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleAcceptAll = () => {
    savePreferences(true);
  };

  const handleRejectAll = () => {
    savePreferences(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">Cookie Consent</h3>
            <p className="text-white/80 text-sm mb-2">
              We use cookies to enhance your browsing experience and analyze site traffic. 
              Necessary cookies are always enabled. You can choose to accept or reject analytics cookies.
            </p>
            <p className="text-white/70 text-xs">
              By continuing to use this site, you consent to our use of necessary cookies. 
              For more information, please read our{' '}
              <Link 
                href="/privacy-policy" 
                className="text-neon-cyan hover:text-neon-blue underline font-semibold"
              >
                Privacy Policy
              </Link>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-300 font-semibold text-sm"
            >
              Reject Analytics
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-neon-cyan hover:bg-neon-blue text-slate-900 rounded-lg transition-colors duration-300 font-bold text-sm"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

