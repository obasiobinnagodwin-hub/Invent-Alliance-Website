import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Invent Alliance Limited. Have a question, comment, or need further information? Contact us today.',
  openGraph: {
    title: 'Contact Us - Invent Alliance Limited',
    description: 'Get in touch with Invent Alliance Limited. Have a question, comment, or need further information?',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

