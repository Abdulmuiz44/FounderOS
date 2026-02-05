'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, ArrowRight, Target, MapPin, Clock, DollarSign } from 'lucide-react';
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
        preference: 'B2B'
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
                setStep(3);
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Opportunity Generator
                </h1>
                <p className="text-slate-500 mt-2">
                    Discover high-potential startup ideas tailored to your unique profile.
                </p>
            </div>

            {step === 1 && (
                <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-500" />
                        Founder Profile
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Key Interests</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g. AI, Healthcare, Finance"
                                onBlur={(e) => setProfile({ ...profile, interests: e.target.value.split(',').map(s => s.trim()) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Top Skills</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="e.g. React, Marketing, Sales"
                                onBlur={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Next: Logistics
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" />
                        Logistics
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Weekly Hours</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-lg"
                                value={profile.hoursPerWeek}
                                onChange={(e) => setProfile({ ...profile, hoursPerWeek: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Budget</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                            >
                                <option value="$0 - $1000">$0 - $1000 (Bootstrapper)</option>
                                <option value="$1k - $5k">$1k - $5k</option>
                                <option value="$5k+">$5k+ (Funded)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Generate Ideas
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="grid gap-6">
                    {generatedIdeas.map((idea, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-sm hover:shadow-md group">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-slate-800">{idea.title}</h3>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{idea.targetNiche}</span>
                            </div>
                            <p className="text-slate-600 mt-2 text-sm">{idea.problemStatement}</p>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-medium">Why now: {idea.whyNow}</span>
                                <button
                                    onClick={() => saveAndAnalyze(idea)}
                                    className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all p-0 border-0 bg-transparent cursor-pointer"
                                >
                                    Analyze & Validate <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
