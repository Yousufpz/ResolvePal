import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Resolve Pal — Intelligent Multi-Agent Customer Support',
  description: 'Route Every Ticket. Resolve With Precision. An intelligent supervisor agent orchestrates support requests through specialized billing and technical agents.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg-deep text-text-primary font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}