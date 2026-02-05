'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, ArrowRight, Target, MapPin, Clock, DollarSign, Brain, TrendingUp, Frown, Lightbulb } from 'lucide-react';
import { FounderProfile } from '@/modules/opportunity-intelligence/types';

export default function CreateOpportunityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<FounderProfile>({
        interests: [],
        skills: [],
        budget: '$0 - $1000',
        hoursPerWeek: 10,
        location: 'Global',
        preference: 'B2B',
        unfairAdvantage: '',
        problemSpace: '',
        revenueGoal: 'Side Income ($1k-$5k/mo)',
        businessModelPreference: 'SaaS (Subscription)',
        dailyFrustrations: '',
        recentExcitement: ''
    });

    const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/opportunities/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile })
            });
            const data = await res.json();
            if (data.opportunities) {
                setGeneratedIdeas(data.opportunities);
                setStep(4);
            }
        } catch (error) {
            console.error('Failed to generate', error);
        } finally {
            setLoading(false);
        }
    };

    const saveAndAnalyze = async (idea: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunity: idea })
            });
            const data = await res.json();

            if (data.success && data.opportunity) {
                router.push(`/dashboard/opportunities/${data.opportunity.id}`);
            } else {
                console.error('Failed to create opportunity:', data.error);
                alert('Failed to save opportunity. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-[var(--background)] p-6 pb-20">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                        Opportunity Generator <Sparkles className="w-6 h-6 text-indigo-500" />
                    </h1>
                    <p className="text-[var(--muted)] mt-2 text-lg">
                        Discover high-potential startup ideas tailored to your unique profile.
                    </p>
                </div>

                {/* Stepper Progress */}
                <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                onClick={() => { if (step > s) setStep(s); }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${step >= s ? 'bg-indigo-600 text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)]'}`}
                            >
                                {s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-indigo-600' : 'bg-[var(--border)]'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Core Profile */}
                {step === 1 && (
                    <div className="space-y-6 bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-indigo-500" />
                            Founder DNA
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Key Interests</label>
                                <p className="text-xs text-[var(--muted)] mb-2">Topics you are passionate about (comma separated)</p>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)]"
                                    placeholder="e.g. AI, Healthcare, Finance, SaaS"
                                    defaultValue={profile.interests.join(', ')}
                                    onBlur={(e) => setProfile({ ...profile, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Top Skills</label>
                                <p className="text-xs text-[var(--muted)] mb-2">Technologies or hard skills you possess (comma separated)</p>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)]"
                                    placeholder="e.g. React, Marketing, Python, Sales"
                                    defaultValue={profile.skills.join(', ')}
                                    onBlur={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Unfair Advantage / Domain Expertise</label>
                                <p className="text-xs text-[var(--muted)] mb-2">What unique insight, network, or experience do you have that others don't?</p>
                                <textarea
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)] min-h-[80px]"
                                    placeholder="e.g. 10 years in logistics, Access to 50k dentist email list, Ex-Google Engineer..."
                                    value={profile.unfairAdvantage}
                                    onChange={(e) => setProfile({ ...profile, unfairAdvantage: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                                    <Frown className="w-4 h-4 text-orange-500" />
                                    Daily Frustrations
                                </label>
                                <p className="text-xs text-[var(--muted)] mb-2">What tedious tasks or problems do you (or people you know) encounter constantly?</p>
                                <textarea
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)] min-h-[80px]"
                                    placeholder="e.g. Managing invoices takes hours, Can't find reliable contractors..."
                                    value={profile.dailyFrustrations}
                                    onChange={(e) => setProfile({ ...profile, dailyFrustrations: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-xl font-medium hover:opacity-90 transition shadow-sm flex items-center gap-2"
                            >
                                Next: Problem Space <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Problem Space & Goals */}
                {step === 2 && (
                    <div className="space-y-6 bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <Brain className="w-5 h-5 text-indigo-500" />
                            Goals & Direction
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Target Problem Space / Industry</label>
                                <p className="text-xs text-[var(--muted)] mb-2">Is there a specific industry or problem you want to tackle?</p>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)]"
                                    placeholder="e.g. Problems in Creator Economy, Inefficiencies in Construction, or 'Open to anything'"
                                    value={profile.problemSpace}
                                    onChange={(e) => setProfile({ ...profile, problemSpace: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    Why Now? (Recent Trends)
                                </label>
                                <p className="text-xs text-[var(--muted)] mb-2">What recent change (tech, law, behavior) are you excited about?</p>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-[var(--muted)]"
                                    placeholder="e.g. Rise of Deepseek, New privacy laws, Remote work shift..."
                                    value={profile.recentExcitement}
                                    onChange={(e) => setProfile({ ...profile, recentExcitement: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Revenue Goal</label>
                                    <select
                                        className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.revenueGoal}
                                        onChange={(e) => setProfile({ ...profile, revenueGoal: e.target.value })}
                                    >
                                        <option value="Side Income ($1k-$5k/mo)">Side Income ($1k-$5k/mo)</option>
                                        <option value="Lifestyle Business ($10k-$50k/mo)">Lifestyle Business ($10k-$50k/mo)</option>
                                        <option value="Venture Scale ($1M+/yr)">Venture Scale ($1M+/yr)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Preferred Business Model</label>
                                    <select
                                        className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.businessModelPreference}
                                        onChange={(e) => setProfile({ ...profile, businessModelPreference: e.target.value })}
                                    >
                                        <option value="SaaS (Subscription)">SaaS (Subscription)</option>
                                        <option value="Marketplace">Marketplace</option>
                                        <option value="Transactional / One-time">Transactional / One-time</option>
                                        <option value="Productized Service">Productized Service</option>
                                        <option value="Open to anything">Open to anything</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => setStep(1)} className="text-[var(--muted)] hover:text-[var(--foreground)]">Back</button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-xl font-medium hover:opacity-90 transition shadow-sm flex items-center gap-2"
                            >
                                Next: Logistics <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Logistics */}
                {step === 3 && (
                    <div className="space-y-6 bg-[var(--card)] p-8 rounded-2xl border border-[var(--border)] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Logistics
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Weekly Hours Available</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={profile.hoursPerWeek}
                                        onChange={(e) => setProfile({ ...profile, hoursPerWeek: Number(e.target.value) })}
                                    />
                                    <span className="absolute right-4 top-3.5 text-sm text-[var(--muted)]">hrs/week</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Starting Budget</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={profile.budget}
                                        onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                                    >
                                        <option value="$0 - $1000">$0 - $1,000 (Bootstrapper)</option>
                                        <option value="$1k - $5k">$1,000 - $5,000</option>
                                        <option value="$5k+">$5,000+ (Funded)</option>
                                    </select>
                                    <DollarSign className="absolute right-4 top-3.5 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Location Preference</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 border border-[var(--border)] bg-[var(--background)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                                        value={profile.location}
                                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    >
                                        <option value="Global">Global / Remote</option>
                                        <option value="North America">North America</option>
                                        <option value="Europe">Europe</option>
                                        <option value="Asia">Asia</option>
                                        <option value="Local">Local / Hyperlocal</option>
                                    </select>
                                    <MapPin className="absolute right-4 top-3.5 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Customer Focus</label>
                                <div className="flex gap-4">
                                    {['B2B', 'B2C', 'Both'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setProfile({ ...profile, preference: opt as any })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${profile.preference === opt
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--foreground)]'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] py-3 rounded-xl hover:bg-[var(--card)] transition font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="flex-[2] bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-xl font-medium hover:opacity-90 transition shadow-sm flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate Ideas
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Generated Opportunities</h2>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] underline"
                            >
                                Adjust Profile
                            </button>
                        </div>

                        <div className="grid gap-6">
                            {generatedIdeas.map((idea, i) => (
                                <div key={i} className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-[var(--foreground)]">{idea.title}</h3>
                                        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{idea.targetNiche}</span>
                                    </div>
                                    <p className="text-[var(--muted)] text-base leading-relaxed mb-6">{idea.problemStatement}</p>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                                            <Sparkles className="w-4 h-4 text-yellow-500" />
                                            <span className="font-medium text-[var(--foreground)]">Why Now:</span> {idea.whyNow}
                                        </div>
                                        <button
                                            onClick={() => saveAndAnalyze(idea)}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition shadow-sm w-full md:w-auto"
                                        >
                                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze & Validate'}
                                            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
