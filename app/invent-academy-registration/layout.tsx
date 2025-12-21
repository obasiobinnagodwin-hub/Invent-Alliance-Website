import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invent Academy Registration',
  description: 'Register for Invent Academy - Learn how to start a Bakery business and how to bake the easy way. Training for aspiring bakery professionals and investors.',
  openGraph: {
    title: 'Invent Academy Registration - Invent Alliance Limited',
    description: 'Register for Invent Academy - Learn how to start a Bakery business and how to bake the easy way.',
    type: 'website',
  },
};

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

