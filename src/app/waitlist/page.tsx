'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const supabase = createClient();

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email, source: 'waitlist page' }]);

    if (error && error.code !== '23505') { // Ignore unique violation (already registered)
      setStatus('error');
    } else {
      setStatus('success');
    }
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 relative selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      
      {/* Minimal Header */}
      <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-3xl mx-auto w-full">
        <a href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          FounderOS
        </a>
        <ThemeToggle />
      </nav>

      <main className="max-w-md mx-auto w-full space-y-12 text-center z-10">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Request Early Access
          </h1>
          <p className="text-lg text-[var(--muted)] font-normal leading-relaxed">
            FounderOS delivers your weekly <span className="text-[var(--foreground)]">business intelligence</span> briefing.
          </p>
          <p className="text-sm text-[var(--muted)] opacity-80 leading-relaxed font-light">
            One calm summary. One clear focus.<br/>Every Sunday evening.
          </p>
        </motion.div>

        {/* Waitlist Form */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-xs mx-auto w-full"
        >
          {status === 'success' ? (
            <div className="p-5 rounded-md bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-bg)] animate-fade-in">
              <p className="font-medium text-sm">You’re on the list.</p>
              <p className="text-xs opacity-80 mt-1">We’ll invite founders gradually.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleJoinWaitlist} className="space-y-4">
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
                  className="w-full h-12 text-base shadow-sm"
                >
                  Join Waitlist
                </Button>
                {status === 'error' && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
              </form>

              {/* Pricing Anchor */}
              <div className="mt-12 space-y-4 pt-8 border-t border-[var(--border)]">
                <h2 className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Planned Pricing</h2>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  FounderOS will launch with simple monthly pricing.
                </p>
                <div className="flex justify-between text-xs text-[var(--foreground)] font-medium max-w-[200px] mx-auto">
                  <span>$15/mo — Solo</span>
                  <span>$29/mo — Teams</span>
                </div>
                <p className="text-[10px] text-[var(--muted)] opacity-70 italic pt-2">
                  Early beta users will receive priority access and discounted pricing.
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="pt-8"
        >
          <a href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors border-b border-transparent hover:border-[var(--muted)] pb-0.5">
            Learn more about FounderOS
          </a>
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] opacity-50 font-medium">
          Confidential by design
        </p>
      </footer>
    </div>
  );
}
