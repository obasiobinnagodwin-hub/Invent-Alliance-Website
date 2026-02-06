import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "./metadata";
import ClientLayout from "@/components/ClientLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="canonical"
          href={process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inventallianceco.com'}
        />
      </head>
      <body className="antialiased bg-white min-h-screen">
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
