'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Zap, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface ChatterData {
    current_ratio: number;
    weekly_average: number;
    builder_mode: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'no_data';
    ai_minutes_today: number;
    execution_minutes_today: number;
    top_model: string | null;
    warning: string | null;
}

const modeLabels: Record<string, { label: string; color: string; description: string }> = {
    deep_flow: {
        label: 'Deep Flow',
        color: 'text-green-400',
        description: 'Excellent. You are shipping.'
    },
    balanced_building: {
        label: 'Balanced',
        color: 'text-blue-400',
        description: 'Healthy AI-assisted building.'
    },
    planning_loop: {
        label: 'Planning Loop',
        color: 'text-red-400',
        description: 'Too much chatting, not enough shipping.'
    },
    momentum_decay: {
        label: 'Momentum Decay',
        color: 'text-orange-400',
        description: 'Your execution rate is declining.'
    },
    attention_scatter: {
        label: 'Scattered',
        color: 'text-yellow-400',
        description: 'Focus is fragmented across projects.'
    }
};

export function ChatterRatioCard() {
    const [data, setData] = useState<ChatterData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChatter = async () => {
            try {
                const res = await fetch('/api/chatter');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error('Failed to fetch chatter data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChatter();
    }, []);

    if (loading) {
        return (
            <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] animate-pulse">
                <div className="h-4 bg-[var(--muted)] rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-[var(--muted)] rounded w-1/2"></div>
            </div>
        );
    }

    if (!data) return null;

    const modeInfo = modeLabels[data.builder_mode] || modeLabels.balanced_building;
    const ratioPercent = Math.round(data.current_ratio * 100);
    const isHealthy = data.current_ratio < 0.5;

    const TrendIcon = data.trend === 'increasing' ? TrendingUp :
        data.trend === 'decreasing' ? TrendingDown : Minus;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] relative overflow-hidden"
        >
            {/* Background Gradient Indicator */}
            <div
                className={`absolute inset-0 opacity-10 ${isHealthy ? 'bg-gradient-to-br from-green-500 to-blue-500' : 'bg-gradient-to-br from-orange-500 to-red-500'}`}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isHealthy ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            <MessageSquare className={`w-5 h-5 ${isHealthy ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                        <span className="text-sm font-medium text-[var(--muted)]">Chatter Ratio</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${data.trend === 'increasing' ? 'text-red-400' : data.trend === 'decreasing' ? 'text-green-400' : 'text-[var(--muted)]'}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{data.trend}</span>
                    </div>
                </div>

                {/* Main Metric */}
                <div className="flex items-end gap-3 mb-4">
                    <span className={`text-4xl font-bold ${isHealthy ? 'text-[var(--foreground)]' : 'text-red-400'}`}>
                        {ratioPercent}%
                    </span>
                    <span className="text-sm text-[var(--muted)] mb-1">AI Chatter</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-[var(--background)] rounded-full mb-4 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ratioPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${ratioPercent < 30 ? 'bg-green-500' : ratioPercent < 50 ? 'bg-blue-500' : ratioPercent < 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                    />
                </div>

                {/* Builder Mode */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${modeInfo.color}`} />
                        <span className={`font-semibold ${modeInfo.color}`}>{modeInfo.label}</span>
                    </div>
                    {data.top_model && (
                        <span className="text-xs text-[var(--muted)] bg-[var(--background)] px-2 py-1 rounded">
                            {data.top_model}
                        </span>
                    )}
                </div>
                <p className="text-xs text-[var(--muted)] mb-4">{modeInfo.description}</p>

                {/* Today's Breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                        <span className="text-xs text-[var(--muted)]">AI Time Today</span>
                        <p className="text-lg font-semibold text-[var(--foreground)]">{data.ai_minutes_today}m</p>
                    </div>
                    <div>
                        <span className="text-xs text-[var(--muted)]">Execution Time</span>
                        <p className="text-lg font-semibold text-green-400">{data.execution_minutes_today}m</p>
                    </div>
                </div>

                {/* Warning */}
                {data.warning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
                    >
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-red-400">{data.warning}</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
