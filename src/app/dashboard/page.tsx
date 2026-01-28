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
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, ProjectLog } from '@/types/schema';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspace' | 'details' | 'timeline'>('workspace');
  
  // New Project Form
  const [newProjectData, setNewProjectData] = useState({ name: '', description: '', audience: '' });
  
  // Workspace State
  const [noteContent, setNoteContent] = useState('');
  const [logs, setLogs] = useState<ProjectLog[]>([]);

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
    };
    init();
  }, [router, supabase]);

  const fetchProjects = async (userId: string) => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      if (data.length > 0) setActiveProject(data[0]);
      else setShowNewProject(true);
    }
    setLoading(false);
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
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Mock AI Help
  const handleAiAssist = () => {
    const suggestions = [
      "Based on your audience, try focusing on LinkedIn organic reach.",
      "Your blocker seems technical. Have you considered using a pre-built library?",
      "Simplify the MVP. Only build the core 'Happy Path' first."
    ];
    setNoteContent(prev => prev + '\n\n🤖 AI Suggestion: ' + suggestions[Math.floor(Math.random() * suggestions.length)]);
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
                  onClick={() => { setActiveProject(p); setShowNewProject(false); }}
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

        <div className="p-4 border-t border-[var(--border)]">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden h-14 border-b border-[var(--border)] flex items-center justify-between px-4">
           <span className="font-bold">FounderOS</span>
           <button onClick={() => setShowNewProject(true)}><Plus className="w-5 h-5" /></button>
        </header>

        {showNewProject ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-[var(--background)]">
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
                    onChange={e => setNewProjectData({...newProjectData, name: e.target.value})}
                    className="w-full p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                    placeholder="My AI SaaS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Audience</label>
                  <input 
                    value={newProjectData.audience}
                    onChange={e => setNewProjectData({...newProjectData, audience: e.target.value})}
                    className="w-full p-2.5 rounded-md bg-[var(--background)] border border-[var(--border)] outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                    placeholder="e.g. Legal Tech"
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
                  <span className="text-xs font-normal text-[var(--muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">Active</span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex bg-[var(--card)] rounded-lg p-1 border border-[var(--border)]">
                    {['workspace', 'details', 'timeline'].map((tab) => (
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
              <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'workspace' && (
                    <motion.div 
                      key="workspace"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm flex flex-col h-[60vh]">
                        <div className="p-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/50 rounded-t-xl">
                          <span className="text-xs font-medium text-[var(--muted)] flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Scratchpad
                          </span>
                          <div className="flex gap-2">
                             <Button size="sm" variant="ghost" onClick={handleAiAssist} className="h-7 text-xs gap-1">
                               <Sparkles className="w-3 h-3 text-purple-500" /> Ask AI
                             </Button>
                             <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                               <Save className="w-3 h-3" /> Save
                             </Button>
                          </div>
                        </div>
                        <textarea 
                          className="flex-1 p-6 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed"
                          placeholder="Start typing your ideas, snippets, or blockers here..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'details' && (
                    <motion.div 
                      key="details"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="grid gap-6"
                    >
                      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                        <h3 className="text-sm font-bold mb-4">Project Overview</h3>
                        <div className="space-y-4">
                           <div>
                             <label className="text-xs text-[var(--muted)] uppercase tracking-wider">Description</label>
                             <p className="mt-1 text-sm">{activeProject.description || 'No description added.'}</p>
                           </div>
                           <div>
                             <label className="text-xs text-[var(--muted)] uppercase tracking-wider">Audience</label>
                             <p className="mt-1 text-sm">{activeProject.audience || 'No audience defined.'}</p>
                           </div>
                        </div>
                      </div>
                      <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                        <h3 className="text-sm font-bold mb-4">Current Context</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                           <div>
                             <label className="text-xs text-red-400 uppercase tracking-wider">Blockers</label>
                             <p className="mt-1 text-sm opacity-80">{activeProject.current_blockers || 'None reported.'}</p>
                           </div>
                           <div>
                             <label className="text-xs text-yellow-400 uppercase tracking-wider">Uncertainties</label>
                             <p className="mt-1 text-sm opacity-80">{activeProject.uncertainties || 'None reported.'}</p>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'timeline' && (
                    <motion.div 
                       key="timeline"
                       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                       className="text-center py-12 text-[var(--muted)]"
                    >
                       <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                       <p>Timeline logic to be implemented.</p>
                       <p className="text-xs mt-2">Will track project milestones and AI verdicts.</p>
                    </motion.div>
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
        )}
      </main>
    </div>
  );
}