import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@/components/Analytics';
import { ReactNode } from 'react';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FounderOS – The Operating System for AI Builders',
  description: 'Track, analyze, and optimize every project with FounderOS. Paid SaaS workspace for AI builders.',
  openGraph: {
    title: 'FounderOS – The Operating System for AI Builders',
    description: 'Track, analyze, and optimize every project with FounderOS.',
    images: [
      {
        url: '/og-image.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'FounderOS',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FounderOS – The Operating System for AI Builders',
    description: 'Track, analyze, and optimize every project with FounderOS.',
    images: ['/og-image.png'], // Replace with your actual OG image URL
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}