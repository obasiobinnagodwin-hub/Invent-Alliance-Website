import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "./metadata";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inventallianceco.com'} />
      </head>
      <body className="antialiased bg-gradient-to-b from-slate-800 via-slate-700/50 to-slate-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}

