"use client";
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, Zap, Cpu } from 'lucide-react';

export default function AnalyticsSection() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/v1/analytics', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            
            // Map model IDs to pretty names and colors
            const modelMap: Record<string, { name: string, color: string }> = {
                'openai': { name: 'OpenAI (GPT-4o)', color: 'blue' },
                'deepseek': { name: 'DeepSeek V3', color: 'emerald' },
                'gemini': { name: 'Gemini 2.5 Pro', color: 'violet' },
                'meta': { name: 'Meta Llama 3', color: 'orange' }
            };

            const processedStats = data.map((s: any) => ({
                model: modelMap[s._id]?.name || s._id,
                tokens: s.totalTokens,
                cost: s.totalCost,
                avgTime: s.avgResponseTime / 1000, // convert ms to s
                color: modelMap[s._id]?.color || 'neutral',
                count: s.count
            }));

            setStats(processedStats);
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setLoading(false);
        }
    };

    const totalCost = stats.reduce((acc, curr) => acc + curr.cost, 0);
    const totalQueries = stats.reduce((acc, curr) => acc + curr.count, 0);
    const avgLatency = stats.length > 0 ? (stats.reduce((acc, curr) => acc + curr.avgTime, 0) / stats.length).toFixed(1) : '0.0';
    const maxTokens = Math.max(...stats.map(s => s.tokens), 1);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">Intelligence Analytics</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Real-time tracking of your actual model performance and token usage.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-3 flex flex-col items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Month Cost</span>
                       <span className="text-xl font-black text-blue-600">${totalCost.toFixed(2)}</span>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Queries', value: totalQueries.toString(), icon: <Zap className="w-5 h-5" />, color: 'blue' },
                    { label: 'Avg Latency', value: `${avgLatency}s`, icon: <Clock className="w-5 h-5" />, color: 'emerald' },
                    { label: 'Tokens Used', value: (stats.reduce((a,c) => a+c.tokens, 0) / 1000).toFixed(1) + 'k', icon: <TrendingUp className="w-5 h-5" />, color: 'violet' },
                    { label: 'Cost Avoidance', value: `$${(totalCost * 0.2).toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: 'amber' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[28px] p-6 group hover:shadow-xl transition-all">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4`} style={{ backgroundColor: `var(--${kpi.color}-500-10)`, color: `var(--${kpi.color}-500)` }}>
                            {kpi.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{kpi.label}</p>
                        <h4 className="text-2xl font-black tracking-tighter">{kpi.value}</h4>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Model Utilization (Tokens)
                </h3>
                
                {stats.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 font-medium">No usage data recorded yet. Start a chat to see analytics!</div>
                ) : (
                    <div className="space-y-8">
                        {stats.map((s, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <Cpu className={`w-4 h-4 text-${s.color}-500`} />
                                        <span className="text-xs font-black uppercase tracking-widest">{s.model}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{s.tokens.toLocaleString()} Tokens</span>
                                        <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest">${s.cost.toFixed(4)}</span>
                                    </div>
                                </div>
                                <div className="h-3 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-${s.color}-500 rounded-full transition-all duration-1000`} 
                                        style={{ width: `${(s.tokens / maxTokens) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
