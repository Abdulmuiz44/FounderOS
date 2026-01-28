'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getNextBriefDate, daysAgo } from '@/utils/date';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface FounderBrief {
  id: string;
  executive_summary: string;
  key_observations: string[];
  meaning: string;
  founder_focus: string[];
  week_start_date: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [briefs, setBriefs] = useState<FounderBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  
  // Beta Onboarding States
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: approved } = await supabase
          .from('approved_users')
          .select('*')
          .eq('email', currentUser.email)
          .single();
        
        if (approved) {
          setIsApproved(true);
          if (!approved.onboarding_completed) {
            setShowWelcome(true);
          }
          fetchBriefs(currentUser.id);
        } else {
          setIsApproved(false);
          setLoading(false);
        }
        setCheckingApproval(false);
      } else {
        setLoading(false);
        setCheckingApproval(false);
      }
    };

    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setAuthLoading(false);
    if (error) setAuthMessage('Unable to send magic link.');
    else setAuthMessage('Magic link sent! Check your inbox.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const fetchBriefs = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('founder_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setBriefs(data);
      setSelectedBrief(data[0]);
    }
    setLoading(false);
  };

  const generateBrief = async (isFirstTime = false) => {
    setGenerating(true);
    try {
      const res = await fetch('/api/brief');
      if (!res.ok) throw new Error('Generation failed');
      
      if (user) {
        await fetchBriefs(user.id);
        
        if (isFirstTime) {
          await supabase.from('approved_users')
            .update({ 
              onboarding_completed: true,
              first_brief_at: new Date().toISOString(),
              total_briefs: 1
            })
            .eq('email', user.email);
            
          setShowWelcome(false);
          setShowFeedback(true);
        } else {
           const { data: stats } = await supabase.from('approved_users').select('total_briefs').eq('email', user.email).single();
           if (stats) {
             await supabase.from('approved_users').update({ total_briefs: (stats.total_briefs || 0) + 1 }).eq('email', user.email);
           }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const submitFeedback = async () => {
    if (!user || !feedbackText) return;
    const { error } = await supabase.from('user_feedback').insert({
      user_id: user.id,
      feedback_text: feedbackText
    });
    if (!error) {
      setFeedbackSubmitted(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  const getBriefSentiment = (summary: string) => {
    const text = summary.toLowerCase();
    if (text.includes('growth') || text.includes('surge')) return 'positive';
    if (text.includes('risk') || text.includes('drop') || text.includes('stall')) return 'concern';
    return 'mixed';
  };

  const SentimentBadge = ({ type }: { type: string }) => {
    const styles = {
      positive: 'text-[var(--success-text)] bg-[var(--success-bg)]',
      concern: 'text-[var(--warning-text)] bg-[var(--warning-bg)]',
      mixed: 'text-[var(--foreground)] bg-[var(--border)]'
    };
    const labels = { positive: 'Momentum', concern: 'Attention', mixed: 'Stable' };
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  if (checkingApproval) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><Skeleton className="w-12 h-12 rounded-full" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
        <div className="max-w-xs w-full space-y-8 animate-fade-in text-center">
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Builder Log In</h1>
            <p className="text-[var(--muted)] text-sm">Secure building system.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all outline-none text-center"
              placeholder="builder@project.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full h-11" isLoading={authLoading}>Send Magic Link</Button>
            {authMessage && <p className="text-sm text-[var(--muted)]">{authMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)] text-center">
        <div className="max-w-md space-y-6 animate-fade-in">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold">Invite Only</h1>
          <p className="text-[var(--muted)] leading-relaxed text-sm">
            FounderOS is currently in private beta.<br/>
            We are inviting AI builders gradually. <br/>
            You are on the waitlist as <strong>{user.email}</strong>.
          </p>
          <Button onClick={handleLogout} variant="ghost">Sign Out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300 relative">
      
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-[var(--card)] p-8 rounded-xl max-w-md w-full shadow-2xl border border-[var(--border)] text-center space-y-6"
            >
              <h2 className="text-2xl font-bold">Welcome to FounderOS Beta</h2>
              <p className="text-[var(--muted)] leading-relaxed">
                Your building system is ready. <br/>
                Every Sunday at 6 PM UTC, you will receive a calm system for building.
              </p>
              <div className="pt-4">
                <Button onClick={() => generateBrief(true)} isLoading={generating} className="w-full h-12 text-base">
                  Generate First Brief
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-[var(--card)] p-8 rounded-xl max-w-md w-full shadow-2xl border border-[var(--border)] space-y-4"
            >
              {feedbackSubmitted ? (
                <div className="text-center py-8">
                  <span className="text-4xl">✨</span>
                  <p className="mt-4 font-medium">Thank you. Enjoy your Sunday.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-center">First Impression?</h3>
                  <textarea 
                    className="w-full p-3 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] h-32 focus:outline-none focus:border-[var(--foreground)] resize-none"
                    placeholder="Be honest..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setShowFeedback(false)} className="flex-1">Skip</Button>
                    <Button onClick={submitFeedback} className="flex-1">Send</Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-10 md:py-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1">FounderOS</h1>
            <p className="text-[var(--muted)] text-sm">System for building</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-0.5">Next Update</p>
                <p className="text-xs font-medium text-[var(--foreground)]">
                  {getNextBriefDate().toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
                </p>
             </div>
             <div className="h-8 w-px bg-[var(--border)] hidden md:block"></div>
            <ThemeToggle />
            <button onClick={handleLogout} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-fade-in">
          
          {/* Timeline Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">History</span>
               <button onClick={() => generateBrief(false)} disabled={generating} className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)] hover:opacity-60 transition-opacity">
                 {generating ? '...' : '+ Generate'}
               </button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="space-y-3 opacity-50"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
              ) : briefs.length > 0 ? (
                briefs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrief(b)}
                    className={`w-full text-left px-3 py-3 rounded-md transition-all duration-200 group ${
                      selectedBrief?.id === b.id
                        ? 'bg-[var(--card)] shadow-sm'
                        : 'hover:bg-[var(--card)] hover:opacity-100 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        {new Date(b.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {selectedBrief?.id === b.id && <span className="w-1 h-1 rounded-full bg-[var(--foreground)]"></span>}
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-1">
                      {getBriefSentiment(b.executive_summary) === 'positive' ? 'Positive Signals' : 'Attention Needed'}
                    </p>
                  </button>
                ))
              ) : (
                 <div className="text-sm text-[var(--muted)] py-4">No updates found.</div>
              )}
            </div>
          </aside>

          {/* Main Brief Content */}
          <div className="lg:col-span-9">
            {selectedBrief ? (
              <div className="space-y-16 max-w-3xl">
                
                {/* Brief Header */}
                <div className="border-b border-[var(--border)] pb-8">
                  <div className="flex items-center gap-3 mb-2">
                     <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Weekly Update</h2>
                     <SentimentBadge type={getBriefSentiment(selectedBrief.executive_summary)} />
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    Generated {daysAgo(selectedBrief.created_at)} • Week of {new Date(selectedBrief.week_start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Executive Summary */}
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Executive Summary</h3>
                  <p className="text-xl leading-relaxed text-[var(--foreground)] font-normal">
                    {selectedBrief.executive_summary}
                  </p>
                </section>

                {/* Builder Verdict (Featured) */}
                <section className="bg-[var(--card)] p-8 rounded-lg border border-[var(--border)] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--foreground)]"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)] mb-4">Builder Verdict</h3>
                  <p className="text-lg leading-relaxed text-[var(--foreground)] opacity-90">
                    {selectedBrief.meaning}
                  </p>
                </section>

                <div className="grid md:grid-cols-2 gap-12">
                  {/* Observations */}
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Key Signals</h3>
                    <ul className="space-y-4">
                      {selectedBrief.key_observations.map((obs, i) => (
                        <li key={i} className="flex gap-3 text-sm text-[var(--foreground)] leading-relaxed border-l border-[var(--border)] pl-4">
                          {obs}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Focus */}
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Priorities</h3>
                    <div className="space-y-3">
                      {selectedBrief.founder_focus.map((focus, i) => (
                        <div key={i} className="group flex items-start gap-3 p-3 -ml-3 rounded-md transition-colors hover:bg-[var(--card)]">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded bg-[var(--background)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted)] mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-[var(--foreground)]">{focus}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-[var(--card)] rounded-lg border border-[var(--border)] border-dashed opacity-50">
                 <h3 className="text-lg font-medium text-[var(--foreground)]">Ready for Building</h3>
                 <p className="text-[var(--muted)] text-sm mt-2 mb-6">
                   Generate your first Sunday update to begin.
                 </p>
                 <Button onClick={() => generateBrief(false)} isLoading={generating}>
                   Generate Update
                 </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}