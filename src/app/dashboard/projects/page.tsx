// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter, useSearchParams } from 'next/navigation';
// import { signIn } from 'next-auth/react'; 
// Removing unused NextAuth import completely
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
    Activity,
    Github,
    CheckCircle,
    ArrowRight,
    Loader2,
    GitBranch,
    Copy,
    Download
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
    const [activeTab, setActiveTab] = useState<'plan' | 'logs' | 'insights' | 'timeline' | 'patterns' | 'details'>('plan');

    // Onboarding State
    const [executionPlan, setExecutionPlan] = useState<any>(null);
    const [linkedOpportunity, setLinkedOpportunity] = useState<any>(null);
    const [githubConnected, setGithubConnected] = useState(false);
    const [repos, setRepos] = useState<any[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [showRepoSelector, setShowRepoSelector] = useState(false);
    const [publishingMasterPlan, setPublishingMasterPlan] = useState(false);
    const [githubNotice, setGithubNotice] = useState<string | null>(null);

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
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Check for GitHub access token presence - TO DO: Re-implement with Supabase provider token if needed
            // if (session.accessToken) {
            //     setGithubConnected(true);
            // }

            await fetchProjects(user.id);
            fetchPatterns();
            fetchInsight();
            fetchProfile();
            fetchDrift();
        };
        init();
    }, [router]);

    // Handle initial selection via props or detailed check
    useEffect(() => {
        if (activeProject && projects.length > 0) {
            // Fetch linked opportunity plan if exists
            fetchExecutionPlan(activeProject.id);
        }
    }, [activeProject]);


    const fetchExecutionPlan = async (projectId: string) => {
        const project = projects.find((p) => p.id === projectId) || activeProject;
        if (project?.opportunity_id) {
            try {
                const res = await fetch(`/api/opportunities/${project.opportunity_id}`);
                const data = await res.json();
                setLinkedOpportunity(data);
                if (data.execution_plans) {
                    setExecutionPlan(data.execution_plans);
                }
            } catch (e) {
                console.error("Failed to fetch execution plan", e);
            }
        }
    }

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

    // GitHub Repo Handling
    const handleConnectGitHub = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                scopes: 'repo',
                redirectTo: `${window.location.origin}/dashboard/projects`
            }
        });
        if (error) console.error("GitHub Auth Error:", error);
    };

    const fetchGitHubRepos = async () => {
        setLoadingRepos(true);
        try {
            const res = await fetch('/api/github/repos');

            if (res.ok) {
                const data = await res.json();
                setRepos(data);
                setGithubConnected(true);
                return data;
            } else {
                const errorData = await res.json();
                console.error("Failed to fetch repos from API:", errorData.error);
                if (res.status === 401) {
                    setGithubConnected(false);
                }
                return [];
            }
        } catch (e) {
            console.error("Error fetching repos:", e);
            return [];
        } finally {
            setLoadingRepos(false);
        }
    };

    // Replace the old connect logic with a dual-mode button (Auth vs Fetch)
    const handleRepoSelectorClick = async () => {
        setGithubNotice(null);
        if (!githubConnected) {
            const fetchedRepos = await fetchGitHubRepos();
            if (!fetchedRepos.length) {
                await handleConnectGitHub();
                return;
            }
        }
        setShowRepoSelector(true);
    };

    const handlePublishMasterPlan = async () => {
        if (!activeProject) return;

        if (!githubConnected) {
            await handleConnectGitHub();
            return;
        }

        const report = getFullExecutionReport();
        if (!report) return;

        setPublishingMasterPlan(true);
        setGithubNotice(null);

        try {
            const res = await fetch('/api/github/master-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    repoName: `${activeProject.name}-master-plan`,
                    repoFullName: activeProject.github_repo_full_name || undefined,
                    description: `MASTER_PLAN.md for ${activeProject.name}`,
                    content: report,
                    private: true,
                    createIfMissing: !activeProject.github_repo_full_name
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to publish MASTER_PLAN.md to GitHub');
            }

            setGithubNotice(`Published MASTER_PLAN.md to ${data.repo}`);
            setActiveProject((prev: any) => prev ? { ...prev, github_repo_full_name: data.repo } : prev);
            setProjects((prev) => prev.map((project) => project.id === activeProject.id ? { ...project, github_repo_full_name: data.repo } : project));
            setGithubConnected(true);
            setShowRepoSelector(false);
        } catch (error) {
            console.error(error);
            setGithubNotice(error instanceof Error ? error.message : 'Failed to publish MASTER_PLAN.md');
        } finally {
            setPublishingMasterPlan(false);
        }
    };

    const selectRepo = async (repoName: string) => {
        if (!activeProject) return;

        // Update local state optimistic
        const updatedProject = { ...activeProject, github_repo_full_name: repoName };
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p.id === activeProject.id ? updatedProject : p));
        setShowRepoSelector(false);

        const { error } = await supabase
            .from('projects')
            .update({ github_repo_full_name: repoName })
            .eq('id', activeProject.id);

        if (error) {
            console.error("Failed to update project repo", error);
        }
    };

    const buildIdeaLabAppendix = () => {
        if (!activeProject) return '';

        const score = linkedOpportunity?.opportunity_scores;
        const monetization = linkedOpportunity?.monetization_maps;
        const validationReport = score?.analysis?.validationReport;
        const demandSignals = validationReport?.demandSignals || [];
        const competitors = validationReport?.competitors || [];
        const launchChannels = validationReport?.launchChannels || [];
        const risks = validationReport?.risks || [];
        const experiments = validationReport?.validationExperiments || [];
        const sources = validationReport?.sources || [];

        return `

---

## Appendix: Idea Lab Intelligence

### Demand Signals
${demandSignals.length ? demandSignals.map((signal: any, index: number) => `${index + 1}. ${signal.signal}\n   - ${signal.evidence}`).join('\n') : '- None yet'}

### Source-Backed Competitors
${competitors.length ? competitors.map((competitor: any, index: number) => `${index + 1}. ${competitor.name}\n   - Positioning: ${competitor.positioning}\n   - Strength: ${competitor.strength}\n   - Weakness: ${competitor.weakness}\n   - Wedge: ${competitor.differentiationOpportunity}`).join('\n') : '- None yet'}

### Launch Channels
${launchChannels.length ? launchChannels.map((channel: string, index: number) => `${index + 1}. ${channel}`).join('\n') : '- None yet'}

### Primary Risks
${risks.length ? risks.map((risk: any, index: number) => `${index + 1}. ${risk.risk} (${risk.severity})\n   - ${risk.mitigation}`).join('\n') : '- None yet'}

### Next Validation Experiments
${experiments.length ? experiments.map((experiment: any, index: number) => `${index + 1}. ${experiment.experiment}\n   - Goal: ${experiment.goal}\n   - Execution: ${experiment.execution}\n   - Success Metric: ${experiment.successMetric}`).join('\n') : '- None yet'}

### Research Sources
${sources.length ? sources.map((source: any, index: number) => `${index + 1}. ${source.title}\n   - ${source.url}\n   - ${source.publisher}\n   - ${source.evidence}`).join('\n') : '- None yet'}

### Monetization Notes
- Revenue Model: ${monetization?.revenue_model || 'N/A'}
- Pricing Strategy: ${monetization?.pricing_strategy || 'N/A'}
- Estimated ARPU: ${monetization?.estimated_arpu || 'N/A'}
- Time to Revenue: ${monetization?.time_to_revenue || 'N/A'}

### Marketing Guide
- Positioning: ${validationReport?.competitionAnalysis || 'Position around the clearest pain point and the fastest path to value.'}
- Headline: ${activeProject.name} for ${activeProject.audience || 'your audience'}
- CTA: Start Validating Now
`;
    };

    const getFullExecutionReport = () => `${buildExecutionReport()}${buildIdeaLabAppendix()}`;

    const buildExecutionReport = () => {
        if (!activeProject) return '';

        const features = executionPlan?.mvp_features || [];
        const stack = executionPlan?.tech_stack || [];
        const gtm = executionPlan?.go_to_market || [];
        const score = linkedOpportunity?.opportunity_scores;
        const monetization = linkedOpportunity?.monetization_maps;

        return `# ${activeProject.name} — Full Implementation Plan\n\n## 1) Project Brief\n- Project: ${activeProject.name}\n- Goal: ${activeProject.description || 'Not provided'}\n- Audience: ${activeProject.audience || 'Not provided'}\n- Linked Repo: ${activeProject.github_repo_full_name || 'Not connected'}\n\n## 2) Validation Snapshot\n- Weighted Validation Score: ${score?.weighted_average ?? 'N/A'}\n- Demand Score: ${score?.demand_score ?? 'N/A'}\n- Competition Score: ${score?.competition_score ?? 'N/A'}\n- Monetization Score: ${score?.monetization_score ?? 'N/A'}\n- Complexity Score: ${score?.complexity_score ?? 'N/A'}\n- Founder Fit Score: ${score?.founder_fit_score ?? 'N/A'}\n\n## 3) Build Strategy\n### MVP Features\n${features.map((f: any, i: number) => `${i + 1}. ${f.feature} (Priority: ${f.priority}, Complexity: ${f.complexity})`).join('\n') || '- No features generated yet'}\n\n### Recommended Tech Stack\n${stack.map((s: any, i: number) => `${i + 1}. ${s.name} [${s.category}] — ${s.reason}`).join('\n') || '- No stack generated yet'}\n\n## 4) Execution Timeline (90-Day)\n### Phase 1 (Week 1-2): Discovery + Foundation\n- Convert MVP features into user stories and acceptance criteria\n- Define architecture + repo structure\n- Implement auth, data model, and core scaffold\n\n### Phase 2 (Week 3-6): Core Build\n- Build high-priority MVP workflows end-to-end\n- Add analytics/events to measure activation\n- Run weekly QA and remove blockers\n\n### Phase 3 (Week 7-10): Beta + Feedback\n- Onboard first beta users from target segment\n- Track friction points and iterate UX\n- Improve retention loops + reliability\n\n### Phase 4 (Week 11-12): Launch Readiness\n- Harden onboarding and billing flow\n- Finalize positioning + landing assets\n- Prepare launch checklist and support docs\n\n## 5) Go-To-Market Actions\n${gtm.map((g: any, i: number) => `${i + 1}. ${g.step} via ${g.channel} (${g.timeline})`).join('\n') || '- No GTM plan generated yet'}\n\n## 6) Monetization Plan\n- Revenue Model: ${monetization?.revenue_model || 'N/A'}\n- Pricing Strategy: ${monetization?.pricing_strategy || 'N/A'}\n- Estimated ARPU: ${monetization?.estimated_arpu || 'N/A'}\n- Time to Revenue: ${monetization?.time_to_revenue || 'N/A'}\n- Secondary Streams: ${(monetization?.secondary_streams || []).join(', ') || 'N/A'}\n\n## 7) Copy/Paste Build Prompt (for coding agents)\n\"You are my senior product + engineering copilot. Build the MVP based on this implementation plan.\nRequirements:\n1) Ship in iterative milestones with clear deliverables each week.\n2) Prioritize MVP features by business impact and lowest complexity first.\n3) Use the recommended stack unless a better justified alternative exists.\n4) Add instrumentation for activation, retention, and conversion events.\n5) Output work as: architecture, schema, API contracts, UI tasks, QA checklist, deployment steps.\n6) Include risks, assumptions, and fallback options for each milestone.\"\n\n## 8) Next Actions\n- Connect repo and create milestone issues\n- Start Week 1 backlog from Phase 1\n- Log daily execution updates in FounderOS\n`;
    };

    const copyExecutionReport = async () => {
        const report = getFullExecutionReport();
        if (!report) return;
        await navigator.clipboard.writeText(report);
    };

    const exportExecutionReport = () => {
        const report = getFullExecutionReport();
        if (!report || !activeProject) return;

        const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-implementation-plan.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Check for provider token on mount to set "connected" state
    useEffect(() => {
        const checkGitHubToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.provider_token) {
                setGithubConnected(true);
            }
        };
        checkGitHubToken();
    }, []);

    if (loading) return <div className="h-full flex items-center justify-center p-8"><Skeleton className="w-12 h-12 rounded-full" /></div>;

    // Derived state for empty project
    const isNewProject = logs.length === 0;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Project List Sidebar */}
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
                {showNewProject ? (
                    // ... Existing New Project Form ...
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
                                    {['plan', 'logs', 'insights'].map((tab) => (
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
                            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                                {/* ONBOARDING VIEW FOR NEW PROJECTS */}
                                {isNewProject && executionPlan && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 mb-8 shadow-sm"
                                    >
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold mb-1">Ready to Execute?</h2>
                                                <p className="text-[var(--muted)]">Here is your validation roadmap for the MVP.</p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h3 className="font-bold text-sm uppercase tracking-wider text-[var(--muted)] mb-4">Mvp Feature Set</h3>
                                                <ul className="space-y-3">
                                                    {executionPlan.mvp_features?.map((f: any, i: number) => (
                                                        <li key={i} className="flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                                            <span className="text-sm">{f.feature || f}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                                                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                                        <Github className="w-4 h-4" />
                                                        GitHub Tracking
                                                    </h3>
                                                    {activeProject.github_repo_full_name ? (
                                                        <div className="flex items-center gap-2 text-sm text-[var(--success-text)] bg-[var(--success-bg)]/10 p-2 rounded border border-[var(--success-bg)]/20 mb-4">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Connected to {activeProject.github_repo_full_name}
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs text-[var(--muted)] mb-4">Connect your repository to track commits and build activity automatically.</p>
                                                            {!showRepoSelector ? (
                                                                <div className="space-y-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full gap-2"
                                                                        onClick={githubConnected ? handleRepoSelectorClick : handleConnectGitHub}
                                                                    >
                                                                        <Github className="w-4 h-4" />
                                                                        {githubConnected ? 'Select Repository' : 'Connect GitHub Account'}
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="w-full gap-2"
                                                                        onClick={handlePublishMasterPlan}
                                                                        disabled={publishingMasterPlan}
                                                                    >
                                                                        {publishingMasterPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
                                                                        {publishingMasterPlan ? 'Publishing MASTER_PLAN' : 'Create MASTER_PLAN Repo'}
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                                    {loadingRepos ? (
                                                                        <div className="flex justify-center p-4"><Loader2 className="animate-spin w-4 h-4" /></div>
                                                                    ) : (
                                                                        <div className="max-h-40 overflow-y-auto border border-[var(--border)] rounded-md bg-[var(--card)]">
                                                                            {repos.map(repo => (
                                                                                <button
                                                                                    key={repo.id}
                                                                                    onClick={() => selectRepo(repo.full_name)}
                                                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--foreground)]/5 truncate flex items-center gap-2"
                                                                                >
                                                                                    <GitBranch className="w-3 h-3 text-[var(--muted)]" />
                                                                                    {repo.full_name}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <button onClick={() => setShowRepoSelector(false)} className="text-xs text-[var(--muted)] hover:underline">Cancel</button>
                                                                </div>
                                                            )}
                                                            {githubNotice && (
                                                                <p className="text-xs text-[var(--muted)] mt-2">{githubNotice}</p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="text-sm text-[var(--muted)] bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                                    <p className="font-semibold text-blue-500 mb-1">💡 Founder Tip</p>
                                                    Start by logging your first code session below. Tracking momentum is key.
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <AnimatePresence mode="wait">
                                    {activeTab === 'plan' && (
                                        <motion.div
                                            key="plan"
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                                                    <div>
                                                        <h2 className="text-2xl font-bold">Full Implementation Plan</h2>
                                                        <p className="text-[var(--muted)] mt-1">A complete build guide for your validated idea. Copy it into Cursor, Claude, or your coding agent to start execution instantly.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="secondary" onClick={copyExecutionReport} className="h-9 text-xs gap-1"><Copy className="w-3.5 h-3.5" /> Copy Full Plan</Button>
                                                        <Button onClick={exportExecutionReport} className="h-9 text-xs gap-1"><Download className="w-3.5 h-3.5" /> Export .md</Button>
                                                    </div>
                                                </div>

                                                <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 md:p-5 max-h-[70vh] overflow-auto">{getFullExecutionReport()}</pre>
                                            </div>
                                        </motion.div>
                                    )}

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
                                                    placeholder="What did you build today? Log your progress..."
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
                                                        Log Activity
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
