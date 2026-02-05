// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
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
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, Log, BuilderPattern, BuilderInsight, BuilderOSProfile, BuilderOSDrift } from '@/types/schema_v2';
import { ChatterRatioCard } from '@/components/dashboard/ChatterRatioCard';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [patterns, setPatterns] = useState<BuilderPattern[]>([]);
  const [insight, setInsight] = useState<BuilderInsight | null>(null);
  const [profile, setProfile] = useState<BuilderOSProfile | null>(null);
  const [drift, setDrift] = useState<BuilderOSDrift | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'insights' | 'timeline' | 'patterns' | 'details'>('logs');
  const [showSubscription, setShowSubscription] = useState(false);

  // New Project Form
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    audience: '',
    current_blockers: '',
    uncertainties: ''
  });

  // Log Input
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'update' | 'learning' | 'blocker'>('update');
  const [savingLog, setSavingLog] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // 1. Auth & Subscription Check
  useEffect(() => {
    const init = async () => {
      // Use NextAuth session instead of Supabase auth
      const res = await fetch('/api/auth/session');
      const session = await res.json();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Strict Subscription Check
      const isAdmin = session.user.email === 'abdulmuizproject@gmail.com';

      let sub = null;
      if (!isAdmin) {
        const { data } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'on_trial'])
          .maybeSingle();
        sub = data;

        // Strict Subscription Check - redirect to pricing if no active subscription
        if (!sub) {
          router.push('/pricing');
          return;
        }
      }

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
      setNewProjectData({ name: '', description: '', audience: '', current_blockers: '', uncertainties: '' });
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
    await signOut({ callbackUrl: '/' });
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Modules</h3>
            <Link
              href="/dashboard/opportunities"
              className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50 transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Opportunity Intelligence</span>
            </Link>
          </div>

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
            <div className="flex-1 flex items-start justify-center p-6 bg-[var(--background)] overflow-y-auto" >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-2xl my-8"
              >
                <h2 className="text-2xl font-bold mb-2">Create New Project</h2>
                <p className="text-sm text-[var(--muted)] mb-6">Tell us about what you're building so we can track your progress.</p>
                <form onSubmit={createProject} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name <span className="text-red-400">*</span></label>
                    <input
                      required
                      value={newProjectData.name}
                      onChange={e => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                      placeholder="e.g., My AI SaaS, Side Project"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Goal <span className="text-red-400">*</span></label>
                    <input
                      required
                      value={newProjectData.description}
                      onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                      placeholder="e.g., Launch MVP in 2 weeks, Get 10 paying users"
                    />
                    <p className="text-xs text-[var(--muted)] mt-1">What are you trying to achieve with this project right now?</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Audience</label>
                    <input
                      value={newProjectData.audience}
                      onChange={e => setNewProjectData({ ...newProjectData, audience: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                      placeholder="e.g., Solo founders, Small agencies, Developers"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Blockers</label>
                    <textarea
                      value={newProjectData.current_blockers || ''}
                      onChange={e => setNewProjectData({ ...newProjectData, current_blockers: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all resize-none"
                      rows={2}
                      placeholder="e.g., Payment integration, Marketing copy, Landing page"
                    />
                    <p className="text-xs text-[var(--muted)] mt-1">What's currently slowing you down or blocking progress?</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Key Uncertainties</label>
                    <textarea
                      value={newProjectData.uncertainties || ''}
                      onChange={e => setNewProjectData({ ...newProjectData, uncertainties: e.target.value })}
                      className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all resize-none"
                      rows={2}
                      placeholder="e.g., Will users pay? Is the market big enough?"
                    />
                    <p className="text-xs text-[var(--muted)] mt-1">What questions do you need to answer to move forward?</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                    {projects.length > 0 && (
                      <Button type="button" variant="ghost" onClick={() => setShowNewProject(false)}>Cancel</Button>
                    )}
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
                    {['logs', 'insights', 'timeline', 'patterns', 'details'].map((tab) => (
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

                  <AnimatePresence mode="wait">
                    {/* INSIGHTS TAB */}
                    {activeTab === 'insights' && (
                      <motion.div
                        key="insights"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {/* Logging Streak */}
                          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-4 rounded-xl border border-orange-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-[var(--muted)] uppercase font-bold">Streak</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-500">
                              {(() => {
                                // Calculate streak
                                const today = new Date().toISOString().split('T')[0];
                                let streak = 0;
                                const dates = [...new Set(logs.map(l => l.created_at.split('T')[0]))].sort().reverse();
                                for (let i = 0; i < dates.length; i++) {
                                  const expectedDate = new Date();
                                  expectedDate.setDate(expectedDate.getDate() - i);
                                  if (dates[i] === expectedDate.toISOString().split('T')[0]) {
                                    streak++;
                                  } else break;
                                }
                                return streak;
                              })()}
                            </p>
                            <p className="text-xs text-[var(--muted)]">days in a row</p>
                          </div>

                          {/* Productivity Score */}
                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-[var(--muted)] uppercase font-bold">Productivity</span>
                            </div>
                            <p className="text-3xl font-bold text-green-500">
                              {logs.length > 0 ? Math.round((logs.filter(l => l.log_type === 'update').length / logs.length) * 100) : 0}%
                            </p>
                            <p className="text-xs text-[var(--muted)]">updates vs total</p>
                          </div>

                          {/* Total Logs */}
                          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 rounded-xl border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span className="text-xs text-[var(--muted)] uppercase font-bold">Total Logs</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-500">{logs.length}</p>
                            <p className="text-xs text-[var(--muted)]">entries recorded</p>
                          </div>

                          {/* Blockers Resolved */}
                          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-purple-500" />
                              <span className="text-xs text-[var(--muted)] uppercase font-bold">Blockers</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-500">
                              {logs.filter(l => l.log_type === 'blocker').length}
                            </p>
                            <p className="text-xs text-[var(--muted)]">identified</p>
                          </div>
                        </div>

                        {/* Chatter Ratio Card */}
                        <ChatterRatioCard />

                        {/* Log Type Breakdown */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                          <h3 className="text-sm font-bold mb-4">Log Type Breakdown</h3>
                          <div className="space-y-3">
                            {['update', 'learning', 'blocker'].map(type => {
                              const count = logs.filter(l => l.log_type === type).length;
                              const percentage = logs.length > 0 ? (count / logs.length) * 100 : 0;
                              const colors = {
                                update: 'bg-green-500',
                                learning: 'bg-blue-500',
                                blocker: 'bg-red-500'
                              };
                              return (
                                <div key={type} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="capitalize font-medium">{type}s</span>
                                    <span className="text-[var(--muted)]">{count} ({Math.round(percentage)}%)</span>
                                  </div>
                                  <div className="w-full h-2 bg-[var(--background)] rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className={`h-full rounded-full ${colors[type as keyof typeof colors]}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Builder Insight */}
                        {insight && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-[var(--card)] to-[var(--background)] border border-[var(--border)] p-6 rounded-xl shadow-sm"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">AI Builder Insight</h3>
                              <span className="text-[10px] text-[var(--muted)]">• Updated {new Date(insight.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-lg leading-relaxed font-medium text-[var(--foreground)] opacity-90">
                              "{insight.insight_text}"
                            </p>
                          </motion.div>
                        )}

                        {/* Builder Profile Grid */}
                        {profile && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          >
                            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                              <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Builder Mode</h4>
                              <p className="text-sm font-bold text-[var(--foreground)] capitalize">{profile.builder_mode?.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                              <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Execution Style</h4>
                              <p className="text-sm font-bold text-[var(--foreground)] capitalize">{profile.execution_style?.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                              <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Constraint</h4>
                              <p className="text-sm font-bold text-red-400 capitalize">{profile.friction_type?.replace('_', ' ')}</p>
                            </div>
                            <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                              <h4 className="text-[10px] uppercase font-bold text-[var(--muted)] mb-1">Dominant Pattern</h4>
                              <p className="text-sm font-bold text-blue-400 truncate capitalize" title={profile.dominant_pattern}>{profile.dominant_pattern?.replace('_', ' ')}</p>
                            </div>
                          </motion.div>
                        )}

                        {/* System Drift Alert */}
                        {drift && drift.severity !== 'stable' && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-3 h-3 text-[var(--muted)]" />
                                <h4 className="text-[10px] uppercase font-bold text-[var(--muted)]">System Drift Detected</h4>
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

                        {/* Empty State */}
                        {logs.length === 0 && (
                          <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl">
                            <Sparkles className="w-8 h-8 mx-auto mb-3 text-[var(--muted)] opacity-50" />
                            <p className="text-[var(--muted)]">Start logging your progress to see insights!</p>
                            <button
                              onClick={() => setActiveTab('logs')}
                              className="mt-4 text-sm font-medium text-[var(--foreground)] underline underline-offset-4"
                            >
                              Go to Logs →
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}


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
                      <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Timeline Header with Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <p className="text-xs text-[var(--muted)] uppercase mb-1">Total Logs</p>
                            <p className="text-2xl font-bold">{logs.length}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <p className="text-xs text-[var(--muted)] uppercase mb-1">Updates</p>
                            <p className="text-2xl font-bold text-green-500">{logs.filter(l => l.log_type === 'update').length}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <p className="text-xs text-[var(--muted)] uppercase mb-1">Learnings</p>
                            <p className="text-2xl font-bold text-blue-500">{logs.filter(l => l.log_type === 'learning').length}</p>
                          </div>
                          <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <p className="text-xs text-[var(--muted)] uppercase mb-1">Blockers</p>
                            <p className="text-2xl font-bold text-red-500">{logs.filter(l => l.log_type === 'blocker').length}</p>
                          </div>
                        </div>

                        {/* Activity Heat Map (Last 7 Days) */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                          <h3 className="text-sm font-bold mb-4">Activity - Last 7 Days</h3>
                          <div className="flex gap-2 justify-between">
                            {Array.from({ length: 7 }, (_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - (6 - i));
                              const dateStr = date.toISOString().split('T')[0];
                              const dayLogs = logs.filter(l => l.created_at.split('T')[0] === dateStr);
                              const count = dayLogs.length;
                              const intensity = count === 0 ? 'bg-[var(--background)]' :
                                count < 2 ? 'bg-green-500/30' :
                                  count < 4 ? 'bg-green-500/50' :
                                    count < 6 ? 'bg-green-500/70' : 'bg-green-500';
                              return (
                                <div key={i} className="flex-1 text-center">
                                  <div className={`h-12 rounded-lg ${intensity} border border-[var(--border)] flex items-center justify-center`}>
                                    <span className="text-xs font-bold">{count}</span>
                                  </div>
                                  <p className="text-[10px] text-[var(--muted)] mt-1">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                          <h3 className="text-sm font-bold mb-6">Log Timeline</h3>
                          <div className="relative">
                            {/* Center Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]"></div>

                            {logs.length > 0 ? (
                              <div className="space-y-4">
                                {logs.slice(0, 15).map((log, idx) => {
                                  const isUpdate = log.log_type === 'update';
                                  const isLearning = log.log_type === 'learning';
                                  const isBlocker = log.log_type === 'blocker';

                                  return (
                                    <motion.div
                                      key={log.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="relative pl-10"
                                    >
                                      {/* Node */}
                                      <div className={cn(
                                        "absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 border-[var(--background)]",
                                        isUpdate ? "bg-green-500" :
                                          isLearning ? "bg-blue-500" :
                                            isBlocker ? "bg-red-500" : "bg-[var(--muted)]"
                                      )}></div>

                                      <div className={cn(
                                        "p-4 rounded-lg border transition-all hover:border-[var(--foreground)]/30",
                                        isBlocker ? "bg-red-500/5 border-red-500/20" :
                                          isLearning ? "bg-blue-500/5 border-blue-500/20" :
                                            "bg-[var(--background)] border-[var(--border)]"
                                      )}>
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={cn(
                                            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                                            isUpdate ? "bg-green-500/20 text-green-500" :
                                              isLearning ? "bg-blue-500/20 text-blue-500" :
                                                "bg-red-500/20 text-red-500"
                                          )}>
                                            {log.log_type}
                                          </span>
                                          <span className="text-[10px] text-[var(--muted)] font-mono">
                                            {new Date(log.created_at).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-sm leading-relaxed line-clamp-2">{log.content}</p>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-12 pl-10">
                                <History className="w-8 h-8 mx-auto mb-2 text-[var(--muted)] opacity-50" />
                                <p className="text-sm text-[var(--muted)]">No activity yet. Start logging!</p>
                              </div>
                            )}
                          </div>

                          {logs.length > 15 && (
                            <p className="text-center text-xs text-[var(--muted)] mt-4 pt-4 border-t border-[var(--border)]">
                              Showing 15 of {logs.length} logs. Switch to Logs tab for full list.
                            </p>
                          )}
                        </div>
                      </motion.div>
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