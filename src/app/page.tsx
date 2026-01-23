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

    if (error && error.code !== '23505') {
      setStatus('error');
    } else {
      setStatus('success');
    }
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-3xl mx-auto w-full">
        <span className="font-bold text-lg tracking-tight">FounderOS</span>
        <a href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          Log In
        </a>
      </nav>

      <main className="max-w-xl mx-auto w-full space-y-20 text-center z-10">
        
        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]">
            Your weekly company <br/> intelligence briefing.
          </h1>
          <p className="text-xl text-[var(--muted)] font-normal leading-relaxed max-w-sm mx-auto">
            One calm summary. <br/>
            One clear direction. <br/>
            <span className="text-[var(--foreground)] font-medium">Every Sunday evening.</span>
          </p>
        </motion.div>

        {/* CTA / Waitlist */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-xs mx-auto w-full"
        >
          {status === 'success' ? (
            <div className="p-4 rounded-md bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-bg)]">
              <p className="font-medium text-sm">You’re on the list.</p>
              <p className="text-xs opacity-80 mt-1">We invite founders gradually.</p>
            </div>
          ) : (
            <form onSubmit={handleJoinWaitlist} className="space-y-3">
              <input
                type="email"
                placeholder="founder@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-center bg-[var(--card)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
              />
              <Button 
                type="submit" 
                isLoading={status === 'loading'}
                className="w-full h-12 text-base"
              >
                Request Access
              </Button>
              {status === 'error' && <p className="text-sm text-red-500">Something went wrong.</p>}
            </form>
          )}
        </motion.div>

        {/* Pricing Anchor */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6 pt-8 border-t border-[var(--border)] max-w-xs mx-auto"
        >
          <div className="flex justify-between text-sm">
            <div className="text-left">
              <span className="block text-[var(--foreground)] font-medium">$15/mo</span>
              <span className="text-[var(--muted)]">Solo Founder</span>
            </div>
            <div className="text-right">
              <span className="block text-[var(--foreground)] font-medium">$29/mo</span>
              <span className="text-[var(--muted)]">Growing Startup</span>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] opacity-60 font-medium">
          Confidential by design
        </p>
      </footer>
    </div>
  );
}