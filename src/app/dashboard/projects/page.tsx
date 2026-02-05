// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    FileText,
    Clock,
    MoreVertical,
    Folder,
    Sparkles,
    Zap,
    Target,
    AlertTriangle,
    History,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, Log, BuilderPattern, BuilderInsight, BuilderOSProfile, BuilderOSDrift } from '@/types/schema_v2';
import { ChatterRatioCard } from '@/components/dashboard/ChatterRatioCard';

export default function ProjectsPage() {
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
    const searchParams = useSearchParams();

    useEffect(() => {
        const init = async () => {
            const res = await fetch('/api/auth/session');
            const session = await res.json();

            if (!session?.user) {
                router.push('/login');
                return;
            }

            await fetchProjects(session.user.id);
            fetchPatterns();
            fetchInsight();
            fetchProfile();
            fetchDrift();
        };
        init();
    }, [router]);

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
                // Check URL for project ID? For now default to first
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
            setLogs([]);
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
            fetchPatterns();
            setTimeout(() => {
                fetchInsight();
                fetchProfile();
                fetchDrift();
            }, 2000);
        }
        setSavingLog(false);
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

    if (loading) return <div className="h-full flex items-center justify-center p-8"><Skeleton className="w-12 h-12 rounded-full" /></div>;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Project List Sidebar (Inner) */}
            <div className="w-64 border-r border-[var(--border)] bg-[var(--background)] hidden lg:flex flex-col">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="font-semibold text-sm">Your Projects</h2>
                    <button onClick={() => setShowNewProject(true)} className="p-1 hover:bg-[var(--card)] rounded transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => { setActiveProject(p); fetchLogs(p.id); setShowNewProject(false); }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                                activeProject?.id === p.id
                                    ? "bg-[var(--card)] text-[var(--foreground)] font-medium shadow-sm border border-[var(--border)]"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
                            )}
                        >
                            <Folder className="w-4 h-4" />
                            <span className="truncate">{p.name}</span>
                        </button>
                    ))}
                    {projects.length === 0 && <p className="text-xs text-[var(--muted)] p-2">No projects yet.</p>}
                </div>
            </div>

            {/* Main Execution Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Mobile Header for Projects */}
                <div className="lg:hidden p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="font-bold">Execution</h2>
                    <button onClick={() => setShowNewProject(true)}><Plus className="w-5 h-5" /></button>
                </div>

                {showNewProject ? (
                    <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
                        <div className="max-w-lg w-full bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] shadow-2xl my-8">
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
                                        placeholder="e.g., My AI SaaS"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Goal <span className="text-red-400">*</span></label>
                                    <input
                                        required
                                        value={newProjectData.description}
                                        onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                                        placeholder="e.g., Launch MVP"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                                    {projects.length > 0 && (
                                        <Button type="button" variant="ghost" onClick={() => setShowNewProject(false)}>Cancel</Button>
                                    )}
                                    <Button type="submit">Create Project</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : activeProject ? (
                    <>
                        {/* Context Header */}
                        <header className="h-14 border-b border-[var(--border)] px-6 flex items-center justify-between bg-[var(--background)]/80 backdrop-blur-sm z-10 shrink-0">
                            <div className="flex flex-col">
                                <h1 className="text-lg font-bold flex items-center gap-2">
                                    {activeProject.name}
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[var(--card)] rounded-lg p-1 border border-[var(--border)]">
                                    {['logs', 'insights', 'timeline', 'patterns', 'details'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                                                activeTab === tab ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                                <AnimatePresence mode="wait">
                                    {/* LOGS TAB */}
                                    {activeTab === 'logs' && (
                                        <motion.div
                                            key="logs"
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            {/* Input Area */}
                                            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm group focus-within:ring-2 focus-within:ring-[var(--foreground)]/10 transition-all">
                                                <textarea
                                                    className="w-full p-4 bg-transparent resize-none outline-none font-sans text-base min-h-[100px]"
                                                    placeholder="What are you working on? Any blockers?"
                                                    value={logContent}
                                                    onChange={(e) => setLogContent(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            submitLog();
                                                        }
                                                    }}
                                                />
                                                <div className="p-2 border-t border-[var(--border)] flex items-center justify-between bg-[var(--background)]/30 rounded-b-xl">
                                                    <div className="flex gap-2">
                                                        {['update', 'learning', 'blocker'].map(t => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setLogType(t as any)}
                                                                className={cn(
                                                                    "px-3 py-1 text-xs rounded-full border capitalize transition-all",
                                                                    logType === t
                                                                        ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                                                                        : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--background)]"
                                                                )}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button size="sm" onClick={submitLog} isLoading={savingLog} className="h-8 text-xs">
                                                        Log (Cmd+Enter)
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Logs List */}
                                            <div className="space-y-4">
                                                {logs.map(log => (
                                                    <div key={log.id} className="group relative pl-6 pb-6 border-l border-[var(--border)] last:border-0 last:pb-0">
                                                        <div className={cn(
                                                            "absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full border border-[var(--background)] ring-4 ring-[var(--background)]",
                                                            log.log_type === 'blocker' ? "bg-red-400" : log.log_type === 'learning' ? "bg-blue-400" : "bg-green-400"
                                                        )}></div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={cn(
                                                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                                                                log.log_type === 'blocker' ? "border-red-400/30 text-red-400 bg-red-400/10" :
                                                                    log.log_type === 'learning' ? "border-blue-400/30 text-blue-400 bg-blue-400/10" :
                                                                        "border-green-400/30 text-green-400 bg-green-400/10"
                                                            )}>
                                                                {log.log_type}
                                                            </span>
                                                            <span className="text-xs text-[var(--muted)]">
                                                                {new Date(log.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--foreground)] bg-[var(--card)]/50 p-3 rounded-lg border border-[var(--border)]">
                                                            {log.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                {logs.length === 0 && <p className="text-sm text-[var(--muted)] italic">No logs yet. Start the momentum.</p>}
                                            </div>
                                        </motion.div>
                                    )}
                                    {/* INSIGHTS TAB */}
                                    {activeTab === 'insights' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                            <ChatterRatioCard />
                                            {/* Reuse existing insights UI code here if needed, simplified for brevity */}
                                            <div className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                                                <h3 className="font-bold mb-2">AI Insights</h3>
                                                {insight ? <p>{insight.insight_text}</p> : <p className="text-[var(--muted)]">Not enough data generated yet. Keep logging.</p>}
                                            </div>
                                        </motion.div>
                                    )}
                                    {/* Other tabs placeholders */}
                                    {activeTab === 'patterns' && (
                                        <div className="grid gap-4">
                                            {patterns.map(p => (
                                                <div key={p.id} className="p-4 border rounded-xl">
                                                    <h3 className="font-bold">{p.pattern_label}</h3>
                                                    <p className="text-sm text-[var(--muted)]">{p.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {activeTab === 'details' && (
                                        <div className="p-6 bg-[var(--card)] rounded-xl border border-[var(--border)]">
                                            <h3 className="font-bold mb-4">Project Details</h3>
                                            <div className="grid gap-4">
                                                <div><label className="text-xs text-[var(--muted)] uppercase">Name</label><p>{activeProject.name}</p></div>
                                                <div><label className="text-xs text-[var(--muted)] uppercase">Goal</label><p>{activeProject.current_goal}</p></div>
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
                        <p>Select a project.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
