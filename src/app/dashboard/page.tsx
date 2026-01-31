// @ts-nocheck
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
  Plus,
  Layout,
  Settings,
  FileText,
  MessageSquare,
  Clock,
  MoreVertical,
  ChevronRight,
  Folder,
  LogOut,
  Sparkles,
  Save,
  PenTool,
  History,
  Activity,
  Zap,
  Target,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, Log, BuilderPattern, BuilderInsight, BuilderOSProfile, BuilderOSDrift } from '@/types/schema_v2';
import { ChatterRatioCard } from '@/components/dashboard/ChatterRatioCard';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [patterns, setPatterns] = useState<BuilderPattern[]>([]);
  const [insight, setInsight] = useState<BuilderInsight | null>(null);
  const [profile, setProfile] = useState<BuilderOSProfile | null>(null);
  const [drift, setDrift] = useState<BuilderOSDrift | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'details' | 'timeline' | 'patterns'>('logs');
  const [showSubscription, setShowSubscription] = useState(false);

  // New Project Form
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', audience: '' });

  // Log Input
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'update' | 'learning' | 'blocker'>('update');
  const [savingLog, setSavingLog] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // 1. Auth & Subscription Check
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Strict Subscription Check
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', session.user.id)
        .in('status', ['active', 'on_trial'])
        .maybeSingle();

      // Uncomment for production strictness
      // if (!sub) {
      //   router.push('/pricing');
      //   return;
      // }

      await fetchProjects(session.user.id);
      fetchPatterns();
      fetchInsight();
      fetchProfile();
      fetchDrift();
    };
    init();
  }, [router, supabase]);

  const fetchPatterns = async () => {
    const res = await fetch('/api/patterns');
    if (res.ok) {
      setPatterns(await res.json());
    }
  };

  const fetchInsight = async () => {
    const res = await fetch('/api/insights');
    if (res.ok) {
      const data = await res.json();
      if (data) setInsight(data);
    }
  };

  const fetchProfile = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const data = await res.json();
      if (data) setProfile(data);
    }
  };

  const fetchDrift = async () => {
    const res = await fetch('/api/drift');
    if (res.ok) {
      const data = await res.json();
      if (data) setDrift(data);
    }
  };

  const fetchProjects = async (userId: string) => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      if (data.length > 0) {
        setActiveProject(data[0]);
        fetchLogs(data[0].id);
      } else {
        setShowNewProject(true);
      }
    }
    setLoading(false);
  };

  const fetchLogs = async (projectId: string) => {
    const res = await fetch(`/api/logs?project_id=${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name) return;

    const res = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProjectData)
    });

    if (res.ok) {
      const project = await res.json();
      setProjects([project, ...projects]);
      setActiveProject(project);
      setShowNewProject(false);
      setNewProjectData({ name: '', description: '', audience: '' });
      setLogs([]); // New project has no logs
    }
  };

  const submitLog = async () => {
    if (!logContent.trim() || !activeProject) return;
    setSavingLog(true);

    const res = await fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({
        project_id: activeProject.id,
        content: logContent,
        log_type: logType
      })
    });

    if (res.ok) {
      const newLog = await res.json();
      setLogs([newLog, ...logs]);
      setLogContent('');
      // Refresh patterns, insight, and profile
      fetchPatterns();
      // setTimeout to allow async generation
      setTimeout(() => {
        fetchInsight();
        fetchProfile();
        fetchDrift();
      }, 2000);
    }
    setSavingLog(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'momentum': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'focus': return <Target className="w-5 h-5 text-blue-500" />;
      case 'friction': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'execution': return <Activity className="w-5 h-5 text-green-500" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--background)]"><Skeleton className="w-12 h-12 rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[var(--background)] flex">

      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <span className="font-bold tracking-tight">FounderOS</span>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Projects</h3>
              <button onClick={() => setShowNewProject(true)} className="hover:bg-[var(--background)] p-1 rounded">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setActiveProject(p); fetchLogs(p.id); setShowNewProject(false); }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                    activeProject?.id === p.id
                      ? "bg-[var(--background)] text-[var(--foreground)] font-medium"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
                  )}
                >
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
              {projects.length === 0 && <p className="text-xs text-[var(--muted)]">No projects yet.</p>}
            </div>
          </div>
        </div>



        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <button onClick={() => setShowSubscription(true)} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full text-left px-1 py-1 rounded hover:bg-[var(--background)]/50 transition-colors">
            <Settings className="w-4 h-4" /> Subscription & Settings
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full text-left px-1 py-1 rounded hover:bg-[var(--background)]/50 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside >

      {/* Main Content */}
      < main className="flex-1 flex flex-col h-screen overflow-hidden" >

        {/* Mobile Header */}
        < header className="md:hidden h-14 border-b border-[var(--border)] flex items-center justify-between px-4" >
          <span className="font-bold">FounderOS</span>
          <button onClick={() => setShowNewProject(true)}><Plus className="w-5 h-5" /></button>
        </header >

        {
          showNewProject ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-[var(--background)]" >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
                <form onSubmit={createProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input
                      required
                      value={newProjectData.name}
                      onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      className="w-full p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                      placeholder="My AI SaaS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Goal</label>
                    <input
                      value={newProjectData.description}
                      onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      className="w-full p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                      placeholder="Validate MVP in 2 weeks"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setShowNewProject(false)}>Cancel</Button>
                    <Button type="submit">Create Project</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          ) : activeProject ? (
            <>
              {/* Project Header */}
              <header className="h-16 border-b border-[var(--border)] px-8 flex items-center justify-between bg-[var(--background)]/80 backdrop-blur-sm z-10">
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    {activeProject.name}
                  </h1>
                  <p className="text-xs text-[var(--muted)]">{activeProject.current_goal || 'No goal set'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-[var(--card)] rounded-lg p-1 border border-[var(--border)]">
                    {['logs', 'timeline', 'patterns', 'details'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                          activeTab === tab ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </header>

              {/* Project Body */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                  {/* Builder Insight & Profile Section */}
                  {(insight || profile || drift) && (
                    <div className="grid gap-6">
                      {/* Chatter Ratio Card - The Killer Feature */}
                      <ChatterRatioCard />
                      {insight && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-[var(--card)] to-[var(--background)] border border-[var(--border)] p-6 rounded-xl shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">Your Builder Insight</h3>
                            <span className="text-[10px] text-[var(--muted)]">• Updated {new Date(insight.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-lg leading-relaxed font-medium text-[var(--foreground)] opacity-90">
                            "{insight.insight_text}"
                          </p>
                        </motion.div>
                      )}

                      {profile && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                            <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Builder Mode</h4>
                            <p className="text-sm font-bold text-[var(--foreground)]">{profile.builder_mode}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                            <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Execution Style</h4>
                            <p className="text-sm font-bold text-[var(--foreground)]">{profile.execution_style}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                            <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Constraint</h4>
                            <p className="text-sm font-bold text-red-400">{profile.friction_type}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-lg border border-[var(--border)]">
                            <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Dominant Pattern</h4>
                            <p className="text-sm font-bold text-blue-400 truncate" title={profile.dominant_pattern}>{profile.dominant_pattern}</p>
                          </div>
                        </motion.div>
                      )}

                      {drift && drift.severity !== 'stable' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="w-3 h-3 text-[var(--muted)]" />
                              <h4 className="text-[10px] uppercase font-bold text-[var(--muted)]">System Drift</h4>
                            </div>
                            <p className="text-sm text-[var(--foreground)]">{drift.summary}</p>
                          </div>
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                            drift.severity === 'major shift' ? "border-purple-500/30 text-purple-500" : "border-yellow-500/30 text-yellow-500"
                          )}>
                            {drift.severity}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {activeTab === 'logs' && (
                      <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        {/* Log Input */}
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
                          <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50 rounded-t-xl">
                            <div className="flex gap-2">
                              {['update', 'learning', 'blocker'].map(t => (
                                <button
                                  key={t}
                                  onClick={() => setLogType(t as any)}
                                  className={cn(
                                    "px-3 py-1 text-xs rounded-full border capitalize transition-all",
                                    logType === t
                                      ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]"
                                  )}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                            <Button size="sm" onClick={submitLog} isLoading={savingLog} className="h-7 text-xs">
                              Log Entry
                            </Button>
                          </div>
                          <textarea
                            className="w-full p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed min-h-[120px]"
                            placeholder="What did you work on? What did you learn?"
                            value={logContent}
                            onChange={(e) => setLogContent(e.target.value)}
                          />
                        </div>

                        {/* Log Stream */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Recent Logs</h3>
                          {logs.map(log => (
                            <div key={log.id} className="group relative pl-8 pb-8 border-l border-[var(--border)] last:border-0 last:pb-0">
                              <div className={cn(
                                "absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border border-[var(--background)]",
                                log.log_type === 'blocker' ? "bg-red-400" : log.log_type === 'learning' ? "bg-blue-400" : "bg-[var(--foreground)]"
                              )}></div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-[var(--muted)]">
                                  {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={cn(
                                  "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                                  log.log_type === 'blocker' ? "border-red-400/30 text-red-400" :
                                    log.log_type === 'learning' ? "border-blue-400/30 text-blue-400" :
                                      "border-[var(--border)] text-[var(--muted)]"
                                )}>
                                  {log.log_type}
                                </span>
                              </div>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--foreground)]">
                                {log.content}
                              </div>
                            </div>
                          ))}
                          {logs.length === 0 && <p className="text-sm text-[var(--muted)] pl-2">No logs yet. Start tracking.</p>}
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'patterns' && (
                      <motion.div
                        key="patterns"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-2 gap-6"
                      >
                        <div className="md:col-span-2 mb-4">
                          <h2 className="text-xl font-bold">Builder Patterns</h2>
                          <p className="text-[var(--muted)] text-sm">Patterns detected from your activity stream.</p>
                        </div>

                        {patterns.length > 0 ? patterns.map(p => (
                          <div key={p.id} className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--foreground)] transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                  {getPatternIcon(p.pattern_type)}
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm capitalize">{p.pattern_label}</h3>
                                  <p className="text-xs text-[var(--muted)] capitalize">{p.pattern_type} Pattern</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                                {Math.round(p.confidence_score * 100)}% Conf
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">
                              {p.explanation}
                            </p>
                          </div>
                        )) : (
                          <div className="md:col-span-2 text-center py-12 border border-[var(--border)] rounded-xl border-dashed">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 text-[var(--muted)] opacity-50" />
                            <p className="text-sm text-[var(--muted)]">Not enough data to detect patterns yet.<br />Keep logging your progress.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'timeline' && (
                      <div className="text-center py-20 opacity-50">
                        <History className="w-12 h-12 mx-auto mb-4" />
                        <p>Timeline visualization coming soon.</p>
                      </div>
                    )}

                    {activeTab === 'details' && (
                      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
                        <div>
                          <label className="text-xs text-[var(--muted)] uppercase">Project Name</label>
                          <p className="font-medium">{activeProject.name}</p>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted)] uppercase">Target Audience</label>
                          <p className="font-medium">{activeProject.audience || 'None'}</p>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--muted)] uppercase">Current Goal</label>
                          <p className="font-medium">{activeProject.current_goal || 'None'}</p>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
              <div className="text-center">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a project or create a new one.</p>
              </div>
            </div>
          )
        }
      </main >

      <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} />
    </div >
  );
}