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

    if (error && error.code !== '23505') { 
      setStatus('error');
    } else {
      setStatus('success');
    }
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      
      {/* Header - No longer absolute to prevent overlap */}
      <nav className="w-full max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
        <a href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
          FounderOS
        </a>
        <ThemeToggle />
      </nav>

      {/* Main Content - Centered properly in the remaining space */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full space-y-12 text-center animate-fade-in">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Join the early AI builder waitlist
            </h1>
            <p className="text-lg text-[var(--muted)] font-normal leading-relaxed">
              FounderOS is an <span className="text-[var(--foreground)]">operating system</span> for AI builders.
            </p>
            <p className="text-sm text-[var(--muted)] opacity-80 leading-relaxed font-light">
              A calm system to think, build, ship, and improve AI products.
            </p>
          </motion.div>

          {/* Waitlist Form Area */}
          <div className="max-w-xs mx-auto w-full">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-md bg-[var(--success-bg)] text-[var(--success-text)] border border-[var(--success-bg)]"
              >
                <p className="font-medium text-sm">You’re on the list.</p>
                <p className="text-xs opacity-80 mt-1">We’ll invite AI builders gradually.</p>
              </motion.div>
            ) : (
              <div className="space-y-10">
                <form onSubmit={handleJoinWaitlist} className="space-y-4">
                  <input
                    type="email"
                    placeholder="builder@project.ai"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-center bg-[var(--card)] border border-[var(--border)] rounded-md text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--foreground)] transition-colors"
                  />
                  <Button 
                    type="submit" 
                    isLoading={status === 'loading'}
                    className="w-full h-12 text-sm shadow-sm"
                  >
                    Join the early AI builder waitlist
                  </Button>
                  {status === 'error' && <p className="text-sm text-red-500">Something went wrong. Please try again.</p>}
                </form>

                {/* Pricing Anchor - Structured with better spacing */}
                <div className="pt-10 border-t border-[var(--border)]">
                  <h2 className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] mb-4">Planned Pricing</h2>
                  <div className="flex justify-between text-sm text-[var(--foreground)] font-medium px-4">
                    <span>$15/mo — Solo</span>
                    <span>$29/mo — Teams</span>
                  </div>
                  <p className="text-[10px] text-[var(--muted)] italic mt-4 opacity-70">
                    Early beta users receive priority access and discounted pricing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Learn More Link */}
          <div className="pt-8">
            <a href="/" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors border-b border-transparent hover:border-[var(--muted)] pb-0.5">
              Learn more about FounderOS
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] opacity-50 font-medium">
          Confidential by design
        </p>
      </footer>
    </div>
  );
}