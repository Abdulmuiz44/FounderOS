'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const supabase = createClient();

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email, source: 'landing' }]);

    if (error) {
      if (error.code === '23505') { // Unique violation
        setStatus('success'); // Treat as success
      } else {
        setStatus('error');
      }
    } else {
      setStatus('success');
    }
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        <span className="font-bold text-lg tracking-tight">FounderOS</span>
        <a href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          Log In
        </a>
      </nav>

      <main className="max-w-xl mx-auto w-full space-y-16 text-center z-10">
        
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Your weekly company <br/> intelligence briefing.
          </h1>
          <p className="text-xl text-[var(--muted)] font-light leading-relaxed max-w-md mx-auto">
            One calm summary. <br/>
            One clear direction. <br/>
            Every Monday.
          </p>
        </motion.div>

        {/* CTA / Waitlist */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-sm mx-auto w-full"
        >
          {status === 'success' ? (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 text-green-800 dark:text-green-300">
              <p className="font-medium">You’re on the list.</p>
              <p className="text-sm opacity-80 mt-1">We’ll invite founders gradually.</p>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-center bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <Button 
                type="submit" 
                isLoading={status === 'loading'}
                className="w-full py-3 text-base"
              >
                Request Early Access
              </Button>
              {status === 'error' && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
            </form>
          )}
        </motion.div>

        {/* Pricing Anchor */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="space-y-4 pt-8"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">Planned Pricing</p>
          <div className="flex justify-center gap-8 text-sm text-[var(--muted)]">
            <div>
              <span className="block text-[var(--foreground)] font-medium">$15/mo</span>
              <span>Solo Founder</span>
            </div>
            <div>
              <span className="block text-[var(--foreground)] font-medium">$29/mo</span>
              <span>Growing Startup</span>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center w-full">
        <p className="text-xs text-[var(--muted)] opacity-60">
          Free during private beta. Confidential by design.
        </p>
      </footer>
    </div>
  );
}
