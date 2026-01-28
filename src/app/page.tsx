'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/Footer';
import { 
  ArrowRight, 
  Activity, 
  Target, 
  TrendingUp, 
  Layout, 
  Sparkles,
  GitCommit,
  Shield,
  Clock
} from 'lucide-react';

export default function Landing() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const features = [
    {
      icon: GitCommit,
      title: "Builder Logs",
      desc: "Track your projects, updates, and blockers in a continuous stream. The single source of truth for your work."
    },
    {
      icon: Target,
      title: "Pattern Detection",
      desc: "Discover patterns in your workflow automatically. Are you a 'Burst Builder' or stuck in a 'Planning Loop'?"
    },
    {
      icon: Sparkles,
      title: "Builder Insight",
      desc: "Get actionable summaries from your activity. A concise, neutral reflection of how you really build."
    },
    {
      icon: TrendingUp,
      title: "System Drift",
      desc: "See how your approach changes over time. Understand if your system is evolving or fragmenting."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--foreground)] selection:text-[var(--background)] overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)]/50 md:border-transparent">
        <span className="font-bold text-lg tracking-tight">FounderOS</span>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="hidden md:inline-flex h-9 text-xs px-4">Get Started</Button>
          </Link>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        
        {/* Hero Section */}
        <motion.section 
          initial="initial"
          animate="animate"
          variants={stagger}
          className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 max-w-5xl mx-auto text-center space-y-8"
        >
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop building in chaos.
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-3xl mx-auto">
            FounderOS is the operating system for AI builders to track, analyze, and optimize every project.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="pt-8">
            <Link href="/signup">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            variants={fadeInUp}
            className="mt-20 p-2 bg-[var(--border)]/20 rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden max-w-4xl mx-auto"
          >
            <div className="bg-[var(--card)] rounded-lg aspect-[16/10] p-8 flex items-center justify-center relative overflow-hidden group">
               {/* Abstract UI Representation */}
               <div className="absolute inset-4 grid grid-cols-12 gap-4 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="col-span-3 bg-[var(--background)] rounded-lg border border-[var(--border)] h-full p-3 space-y-2">
                     <div className="h-4 bg-[var(--border)]/50 rounded"></div>
                     <div className="h-4 bg-[var(--border)]/50 rounded w-2/3"></div>
                  </div>
                  <div className="col-span-9 space-y-4">
                     <div className="h-1/3 bg-[var(--background)] rounded-lg border border-[var(--border)] flex items-center justify-center p-3">
                        <p className="text-xs font-mono text-[var(--muted)] text-left">Your logs show a consistent streak of activity, channeled into a single project...</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4 h-1/3">
                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-3">
                           <h4 className="text-[10px] font-bold text-[var(--muted)]">BUILDER MODE</h4>
                           <p className="text-xs font-bold">Deep Focus</p>
                        </div>
                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-3">
                           <h4 className="text-[10px] font-bold text-[var(--muted)]">SYSTEM DRIFT</h4>
                           <p className="text-xs font-bold">Stable</p>
                        </div>
                     </div>
                     <div className="h-1/3 bg-[var(--background)] rounded-lg border border-[var(--border)] p-3">
                        <div className="h-2 bg-[var(--border)]/50 rounded w-full"></div>
                        <div className="h-2 bg-[var(--border)]/50 rounded w-3/4 mt-2"></div>
                     </div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent"></div>
            </div>
          </motion.div>
        </motion.section>

        {/* Features Grid */}
        <section className="py-32 px-6 max-w-6xl mx-auto" id="features">
           <div className="text-center mb-24 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Core OS Features</h2>
              <p className="text-4xl font-bold">A complete mirror for your process.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl relative overflow-hidden group"
                  >
                   <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                     <feature.icon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                   <p className="text-[var(--muted)] text-sm">{feature.desc}</p>
                 </motion.div>
              ))}
           </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]" id="how-it-works">
           <div className="max-w-4xl mx-auto px-6">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold">The Loop of Self-Awareness</h2>
             </div>
             
             <div className="space-y-12 relative before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-[var(--border)] before:-translate-x-1/2">
                {[
                  { step: "01", title: "Log", desc: "Capture updates, learnings, and blockers in a friction-free stream." },
                  { step: "02", title: "Detect", desc: "FounderOS analyzes your activity and detects behavioral patterns." },
                  { step: "03", title: "Reflect", desc: "Receive neutral insights that mirror your process back to you." },
                  { step: "04", title: "Evolve", desc: "Track your System Drift and intentionally shape how you build." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex items-start md:items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse text-left md:text-right'}`}
                  >
                     <div className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-xs font-bold z-10 shrink-0">
                       {item.step}
                     </div>
                     <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-[var(--muted)]">{item.desc}</p>
                     </div>
                     <div className="flex-1 hidden md:block"></div>
                  </motion.div>
                ))}
             </div>
           </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-12">
           <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">From the Beta</h2>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Alex K.", role: "Building AI CRM", quote: "I thought I was shipping, but FounderOS showed me I was just planning. The 'Preparation Loop' pattern was a wake-up call." },
                { name: "Sarah J.", role: "Indie Hacker", quote: "The System Drift feature is scary good. It caught my momentum decay three days before I even felt it." },
                { name: "Mike R.", role: "AI SaaS Founder", quote: "Finally, a tool that's not about useless charts. It's a mirror for my execution. Essential." }
              ].map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] text-left"
                >
                   <p className="text-lg italic mb-6">"{t.quote}"</p>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--foreground)] rounded-full"></div>
                      <div>
                         <p className="text-sm font-bold">{t.name}</p>
                         <p className="text-xs text-[var(--muted)]">{t.role}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* FAQ */}
        <section className="py-24 max-w-3xl mx-auto px-6">
           <h2 className="text-2xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
           <div className="space-y-6">
              {[
                { q: "What is FounderOS?", a: "It's a paid SaaS workspace designed to be an 'operating system' for solo AI builders. It helps you track your work, detect behavioral patterns, and build with more clarity." },
                { q: "Who is it for?", a: "AI builders, indie hackers, and developers who are building products and need a system to manage their own execution and psychology." },
                { q: "How does billing work?", a: "FounderOS is a monthly subscription. You can cancel at any time. There is no free plan, as we believe paying for a tool ensures commitment." },
                { q: "Is my data secure?", a: "Yes. Your data is yours and is never used for training models. All data is encrypted and stored securely with Supabase." },
                { q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription from your settings page with one click. You will retain access until the end of your billing period." }
              ].map((item, i) => (
                <div key={i} className="border-b border-[var(--border)] pb-6">
                   <h3 className="font-bold mb-2">{item.q}</h3>
                   <p className="text-[var(--muted)]">{item.a}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Pricing CTA */}
        <section className="py-32 text-center space-y-8 bg-[var(--card)] border-t border-[var(--border)]">
           <h2 className="text-4xl font-bold tracking-tight">Invest in your output.</h2>
           <p className="text-[var(--muted)]">Join the builders who treat their work like a system.</p>
           <Link href="/pricing">
             <Button className="h-14 px-12 text-lg rounded-full shadow-xl">
                View Plans
             </Button>
           </Link>
           <p className="text-xs text-[var(--muted)]">
             Starts at $12/mo. Cancel anytime.
           </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
