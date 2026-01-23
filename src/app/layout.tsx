import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FounderOS',
  description: 'Automated Founder Brief',
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
      </body>
    </html>
  );
}
