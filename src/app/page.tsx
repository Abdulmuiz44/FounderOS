'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
        <div className="flex items-center gap-4 md:gap-6">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Log In
          </Link>
          <Link href="/pricing">
            <Button variant="primary" className="hidden md:inline-flex h-9 text-xs">Get Access</Button>
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
            FounderOS → The workspace for AI builders
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-2xl mx-auto">
            A calm, dedicated operating system to organize, build, and ship your AI projects.
          </motion.p>
          <motion.div variants={fadeInUp} className="pt-4">
            <Link href="/pricing">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Start Building - $9/mo
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        {/* Benefits */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid gap-8"
        >
            {[
              { title: "Project Organizer", desc: "Keep all your AI experiments, prompts, and code snippets in one focused place." },
              { title: "AI Assistant", desc: "Built-in AI tools to help you unblock technical challenges and validate ideas." },
              { title: "Momentum Tracking", desc: "Visualize your velocity. Know when to pivot and when to double down." }
            ].map((feature, i) => (
              <div key={i} className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)]">
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
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