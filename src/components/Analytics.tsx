'use client';

import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

export default function Analytics() {
  // Explicitly ensuring it runs in production environments
  return <VercelAnalytics mode={'production'} />;
}