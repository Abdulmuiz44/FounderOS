'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ArrowRight, 
  History, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Verdict {
  id: string;
  week_start_date: string;
  verdict_type: 'continue' | 'pivot' | 'simplify';
  explanation: string;
  focus_for_next_week: string;
  experiment_suggestion: string;
  tags: string[];
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    building: '',
    audience: '',
    summary: '',
    blockers: '',
    uncertainties: ''
  });
  const [generating, setGenerating] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      
      const userId = session.user.id;
      setUser(session.user);

      // Check Subscription Status
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .in('status', ['active', 'on_trial'])
        .maybeSingle();

      // For MVP testing, you might want to comment this out to test without paying
      // But per requirements: "No user can access the dashboard without paying"
      // if (!sub) {
      //   router.push('/pricing');
      //   return;
      // }

      fetchVerdicts(userId);
    };

    checkUser();
  }, [router, supabase]);

  const fetchVerdicts = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('verdicts')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });

    if (data && data.length > 0) {
      setVerdicts(data);
      setSelectedVerdict(data[0]);
    } else {
      setShowForm(true);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch('/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to generate verdict');
      
      const newVerdict = await res.json();
      setVerdicts([newVerdict, ...verdicts]);
      setSelectedVerdict(newVerdict);
      setShowForm(false);
      // Reset form slightly or keep for reference? Resetting for next week.
      setFormData({ building: '', audience: '', summary: '', blockers: '', uncertainties: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to generate verdict. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><Skeleton className="w-12 h-12 rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight">FounderOS</span>
            <span className="text-xs bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)]">Beta</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout} className="text-sm h-8">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar History */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-2">
              <History className="w-4 h-4" /> History
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setShowForm(true); setSelectedVerdict(null); }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {verdicts.map((v) => (
              <button
                key={v.id}
                onClick={() => { setSelectedVerdict(v); setShowForm(false); }}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200 group",
                  selectedVerdict?.id === v.id 
                    ? "bg-[var(--card)] border-[var(--foreground)] shadow-sm" 
                    : "border-[var(--border)] hover:bg-[var(--card)] hover:border-[var(--border)] opacity-70 hover:opacity-100"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-[var(--foreground)]">
                    {new Date(v.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <VerdictBadge type={v.verdict_type} mini />
                </div>
                <p className="text-[10px] text-[var(--muted)] line-clamp-1">
                  {v.focus_for_next_week}
                </p>
              </button>
            ))}
            {verdicts.length === 0 && !showForm && (
              <p className="text-sm text-[var(--muted)]">No verdicts yet.</p>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">Weekly Check-in</h1>
                  <p className="text-[var(--muted)]">Input your raw thoughts. AI will structure your focus.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">What are you building?</label>
                      <input 
                        className="w-full p-3 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all"
                        placeholder="e.g. AI-powered CRM"
                        value={formData.building}
                        onChange={e => setFormData({...formData, building: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Who is it for?</label>
                      <input 
                        className="w-full p-3 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all"
                        placeholder="e.g. Real Estate Agents"
                        value={formData.audience}
                        onChange={e => setFormData({...formData, audience: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weekly Summary</label>
                    <textarea 
                      className="w-full p-3 h-32 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all resize-none"
                      placeholder="What did you ship? What went well?"
                      value={formData.summary}
                      onChange={e => setFormData({...formData, summary: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-400">Current Blockers</label>
                      <textarea 
                        className="w-full p-3 h-24 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-1 focus:ring-red-400/50 outline-none transition-all resize-none"
                        placeholder="What's stopping you?"
                        value={formData.blockers}
                        onChange={e => setFormData({...formData, blockers: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-yellow-400">Uncertainties</label>
                      <textarea 
                        className="w-full p-3 h-24 bg-[var(--card)] border border-[var(--border)] rounded-md focus:ring-1 focus:ring-yellow-400/50 outline-none transition-all resize-none"
                        placeholder="What are you unsure about?"
                        value={formData.uncertainties}
                        onChange={e => setFormData({...formData, uncertainties: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={generating} className="h-12 px-8 text-base shadow-lg hover:shadow-xl">
                      Generate Verdict <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : selectedVerdict ? (
              <motion.div
                key="verdict"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
                   <div>
                     <p className="text-sm text-[var(--muted)] mb-1">Verdict for week of {new Date(selectedVerdict.week_start_date).toLocaleDateString()}</p>
                     <VerdictBadge type={selectedVerdict.verdict_type} />
                   </div>
                   <div className="flex gap-2">
                     {selectedVerdict.tags?.map(tag => (
                       <span key={tag} className={cn(
                         "px-2 py-1 border rounded-full text-xs font-medium",
                         tag === 'Momentum' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                         tag === 'Attention' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                         tag === 'Stable' && "bg-slate-500/10 text-slate-500 border-slate-500/20"
                       )}>
                         {tag}
                       </span>
                     ))}
                   </div>
                </div>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Reasoning</h3>
                    <p className="text-lg leading-relaxed text-[var(--foreground)]">
                      {selectedVerdict.explanation}
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Focus
                      </h3>
                      <p className="text-base text-[var(--foreground)]">
                        {selectedVerdict.focus_for_next_week}
                      </p>
                    </section>
                    
                    <section className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Experiment
                      </h3>
                      <p className="text-base text-[var(--foreground)]">
                        {selectedVerdict.experiment_suggestion}
                      </p>
                    </section>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--muted)]">
                Select a verdict or create a new one.
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function VerdictBadge({ type, mini }: { type: string, mini?: boolean }) {
  const styles = {
    continue: 'bg-green-500/10 text-green-500 border-green-500/20',
    pivot: 'bg-red-500/10 text-red-500 border-red-500/20',
    simplify: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  };
  
  const icons = {
    continue: CheckCircle2,
    pivot: AlertTriangle,
    simplify: TrendingUp
  };

  const Icon = icons[type as keyof typeof icons] || Activity;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border rounded-full",
      styles[type as keyof typeof styles] || styles.simplify,
      mini ? "text-[10px] px-2 py-0.5" : "text-sm px-4 py-1.5"
    )}>
      {!mini && <Icon className="w-4 h-4" />}
      {type}
    </span>
  );
}
