import './globals.css';
import type { Metadata } from 'next';
import Analytics from '@/components/Analytics';

export const metadata: Metadata = {
  title: 'FounderOS',
  description: 'An operating system for AI builders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
