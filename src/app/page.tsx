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
  Zap, 
  AlertTriangle, 
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
            <Button variant="primary" className="hidden md:inline-flex h-9 text-xs px-4">Start Workspace</Button>
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
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            v1.0 Available for Builders
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop building in chaos.<br />
            <span className="text-[var(--muted)]">Start building with a system.</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-2xl mx-auto">
            FounderOS is the operating system for AI builders. Track your execution patterns, detect system drift, and build with extreme clarity.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                Start Your Workspace <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" className="h-14 px-8 text-lg rounded-full w-full md:w-auto">
                How it Works
              </Button>
            </Link>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            variants={fadeInUp}
            className="mt-20 p-2 bg-[var(--border)]/20 rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden max-w-4xl mx-auto"
          >
            <div className="bg-[var(--card)] rounded-lg aspect-[16/10] flex items-center justify-center relative overflow-hidden group">
               {/* Abstract UI Representation */}
               <div className="absolute inset-0 grid grid-cols-12 gap-4 p-8 opacity-50 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="col-span-3 bg-[var(--background)] rounded-lg border border-[var(--border)] h-full"></div>
                  <div className="col-span-9 space-y-4">
                     <div className="h-1/3 bg-[var(--background)] rounded-lg border border-[var(--border)] flex items-center justify-center">
                        <span className="text-sm font-mono text-[var(--muted)]">Your Builder Insight</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4 h-1/3">
                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)]"></div>
                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)]"></div>
                     </div>
                     <div className="h-1/3 bg-[var(--background)] rounded-lg border border-[var(--border)]"></div>
                  </div>
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent"></div>
               <div className="relative z-10 text-center space-y-2">
                 <Layout className="w-16 h-16 mx-auto text-[var(--foreground)]" />
                 <p className="font-bold text-lg">Builder Workspace</p>
               </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Problem Statement */}
        <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]">
           <div className="max-w-4xl mx-auto px-6 text-center space-y-16">
              <div>
                <h2 className="text-3xl font-bold mb-4">Why most builders stall.</h2>
                <p className="text-[var(--muted)] text-lg">It's not lack of skill. It's lack of a system.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { icon: AlertTriangle, title: "Loss of Context", desc: "Forgetting why you made a decision 3 days ago." },
                   { icon: Activity, title: "Momentum Decay", desc: "Starting fast but slowing down without noticing." },
                   { icon: Zap, title: "Context Switching", desc: "Jumping between projects until nothing ships." }
                 ].map((item, i) => (
                   <div key={i} className="space-y-4">
                      <div className="w-12 h-12 mx-auto bg-[var(--background)] rounded-full flex items-center justify-center border border-[var(--border)]">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Features Grid */}
        <section className="py-32 px-6 max-w-6xl mx-auto" id="features">
           <div className="text-center mb-24 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Core Features</h2>
              <p className="text-4xl font-bold">A complete mirror for your process.</p>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="col-span-1 lg:col-span-2 bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                      <GitCommit className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Builder Logs</h3>
                    <p className="text-[var(--muted)] max-w-md">Capture updates, learnings, and blockers in a friction-free stream. The raw data of your progress.</p>
                 </div>
                 <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-[var(--background)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl">
                 <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                   <Target className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Pattern Detection</h3>
                 <p className="text-[var(--muted)] text-sm">Automatically detects if you are in "Deep Focus" or "Context Switching" modes.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl">
                 <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                   <Sparkles className="w-5 h-5 text-purple-500" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Builder Insight</h3>
                 <p className="text-[var(--muted)] text-sm">A synthesis of your behavior. It feels like a mirror reflecting your true habits.</p>
              </div>

               {/* Feature 4 */}
               <div className="col-span-1 lg:col-span-2 bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-[var(--background)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">System Drift Tracking</h3>
                    <p className="text-[var(--muted)] max-w-md">Watch how your operating system changes over time. Detect major shifts in execution style before they kill your project.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]" id="how-it-works">
           <div className="max-w-4xl mx-auto px-6">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold">The Loop</h2>
             </div>
             
             <div className="space-y-12 relative before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-[var(--border)] before:-translate-x-1/2">
                {[
                  { step: "01", title: "Log", desc: "You log your work at the end of the day." },
                  { step: "02", title: "Detect", desc: "FounderOS analyzes your patterns (Momentum, Focus, Friction)." },
                  { step: "03", title: "Reflect", desc: "You read your Builder Insight and adjust your system." },
                  { step: "04", title: "Evolve", desc: "You track System Drift to ensure you are improving." }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse text-left md:text-right'}`}>
                     <div className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-xs font-bold z-10 shrink-0">
                       {item.step}
                     </div>
                     <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-[var(--muted)]">{item.desc}</p>
                     </div>
                     <div className="flex-1 hidden md:block"></div>
                  </div>
                ))}
             </div>
           </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-12">
           <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">From the Beta</h2>
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] text-left">
                 <p className="text-lg italic mb-6">"I thought I was shipping, but FounderOS showed me I was just planning. The 'Preparation Loop' pattern was a wake-up call."</p>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--foreground)] rounded-full"></div>
                    <div>
                       <p className="text-sm font-bold">Alex K.</p>
                       <p className="text-xs text-[var(--muted)]">Building AI CRM</p>
                    </div>
                 </div>
              </div>
              <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] text-left">
                 <p className="text-lg italic mb-6">"The System Drift feature is scary good. It caught my momentum decay three days before I even felt it."</p>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--foreground)] rounded-full"></div>
                    <div>
                       <p className="text-sm font-bold">Sarah J.</p>
                       <p className="text-xs text-[var(--muted)]">Indie Hacker</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* FAQ */}
        <section className="py-24 max-w-3xl mx-auto px-6">
           <h2 className="text-2xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
           <div className="space-y-6">
              {[
                { q: "Is there a free plan?", a: "No. FounderOS is a premium tool for serious builders. We believe paying for a tool increases your commitment to using it." },
                { q: "Does the AI train on my data?", a: "No. Your data is yours. We use LLMs only to synthesize your specific logs into insights for you. Nothing is used for training." },
                { q: "Can I export my data?", a: "Yes. You can export your logs and profile data at any time." }
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