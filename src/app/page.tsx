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
          <Link href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Log In
          </Link>
          <Link href="/waitlist">
            <Button variant="primary" className="hidden md:inline-flex h-9 text-xs">Request Access</Button>
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
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Your weekly <br/> business intelligence.
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-lg mx-auto">
            One calm summary. <br/>
            One clear focus. <br/>
            <span className="text-[var(--foreground)] font-medium">Every Sunday evening.</span>
          </motion.p>
          <motion.div variants={fadeInUp} className="pt-4">
            <Link href="/waitlist">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Request Early Access
              </Button>
            </Link>
          </motion.div>
        </motion.section>

        {/* Intro / Philosophy */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8 }}
          className="max-w-xl mx-auto text-center space-y-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">The Philosophy</h2>
          <p className="text-2xl font-serif italic text-[var(--foreground)] leading-relaxed">
            "Founders don't need more charts. They need a verdict."
          </p>
          <p className="text-[var(--muted)] leading-relaxed">
            FounderOS connects to your existing tools—Google Analytics, HubSpot, GitHub—and silently analyzes the noise. No dashboards to configure. No metrics to hunt down. Just a single, high-signal briefing waiting for you before the week begins.
          </p>
        </motion.section>

        {/* Target Audience */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-start pt-12 border-t border-[var(--border)]"
        >
          <div>
            <h3 className="text-lg font-bold mb-2">Built for Operators</h3>
            <p className="text-[var(--muted)] mb-6">
              Designed for SaaS founders who value clarity over complexity.
            </p>
            <ul className="space-y-3">
              {['Bootstrapped Founders', 'Early-Stage CEOs', 'Product Leaders'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--foreground)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Solves the Noise</h3>
            <p className="text-[var(--muted)] mb-6">
              Stop drowning in dashboards.
            </p>
            <ul className="space-y-3">
              {['Analysis paralysis', 'Missed growth signals', 'Unclear engineering velocity'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[var(--muted)]">
                  <span className="text-[var(--foreground)] opacity-40">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-12 pt-12 border-t border-[var(--border)]"
        >
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-[var(--muted)]">
              We replace your Monday morning anxiety with Sunday evening clarity.
            </p>
          </div>

          <div className="grid gap-8">
            {[
              { title: "Signal Detection", desc: "We track growth, conversion, and velocity signals across your entire stack." },
              { title: "Pattern Matching", desc: "Our engine identifies mismatches—like high traffic but low conversion, or stalled engineering." },
              { title: "Founder Verdict", desc: "You get one clear recommendation on where to focus your energy for the week." }
            ].map((feature, i) => (
              <div key={i} className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)]">
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Closing CTA */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center py-24 space-y-8"
        >
          <h2 className="text-4xl font-bold tracking-tight">Ready for clarity?</h2>
          <p className="text-[var(--muted)]">
            Join the private beta. We are inviting founders gradually.
          </p>
          <Link href="/waitlist">
            <Button className="h-12 px-8 text-base">
              Join the Waitlist
            </Button>
          </Link>
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest pt-4 opacity-60">
            Limited Spots Available
          </p>
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
