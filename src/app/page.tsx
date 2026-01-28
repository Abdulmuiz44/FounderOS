'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Check } from 'lucide-react';

export default function Landing() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50 bg-[var(--background)]/80 backdrop-blur-sm">
        <span className="font-bold text-lg tracking-tight">FounderOS</span>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="hidden md:inline-flex h-9 text-xs">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24 space-y-32">
        
        {/* Hero */}
        <motion.section 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="text-center space-y-8"
        >
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            The operating system for AI builders
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-2xl mx-auto">
            A private, persistent workspace to think, build, and track your AI projects.
            Stop losing context. Start building momentum.
          </motion.p>
          <motion.div variants={fadeInUp} className="pt-8">
            <Link href="/signup">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Start Your Workspace
              </Button>
            </Link>
            <p className="text-xs text-[var(--muted)] mt-4">
              Join 500+ builders shipping daily.
            </p>
          </motion.div>
        </motion.section>

        {/* How it works */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-12 pt-12 border-t border-[var(--border)]"
        >
          <div className="text-center max-w-lg mx-auto">
             <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">The System</h2>
             <p className="text-2xl font-bold">How FounderOS works</p>
          </div>

          <div className="grid gap-6">
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] flex items-start gap-4">
               <div className="bg-[var(--background)] p-2 rounded border border-[var(--border)] text-sm font-bold">01</div>
               <div>
                 <h3 className="text-lg font-bold mb-2">Create Projects</h3>
                 <p className="text-[var(--muted)]">Define your goal, audience, and open questions. Keep the context clear.</p>
               </div>
            </div>
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] flex items-start gap-4">
               <div className="bg-[var(--background)] p-2 rounded border border-[var(--border)] text-sm font-bold">02</div>
               <div>
                 <h3 className="text-lg font-bold mb-2">Log Progress</h3>
                 <p className="text-[var(--muted)]">Capture what you learned, what blocked you, and what changed. Every single day.</p>
               </div>
            </div>
            <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] flex items-start gap-4">
               <div className="bg-[var(--background)] p-2 rounded border border-[var(--border)] text-sm font-bold">03</div>
               <div>
                 <h3 className="text-lg font-bold mb-2">Build Momentum</h3>
                 <p className="text-[var(--muted)]">Review your timeline. Spot patterns. Use AI summaries to unstuck yourself.</p>
               </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 text-center">
        <p className="text-sm font-medium">FounderOS</p>
        <p className="text-xs text-[var(--muted)] mt-2 opacity-60">
          &copy; {new Date().getFullYear()} • Confidential by design.
        </p>
      </footer>
    </div>
  );
}
