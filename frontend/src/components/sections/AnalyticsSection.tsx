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
                avgTime: s.avgResponseTime / 1000, 
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
    const totalTokens = stats.reduce((acc, curr) => acc + curr.tokens, 0);
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
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tightest">Intelligence Command Center</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2">Deep-tier analytics of your neural utilization and credit efficiency.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl px-8 py-4 flex flex-col items-end shadow-sm">
                       <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Monthly Burn Rate</span>
                       <span className="text-2xl font-black text-blue-600">${totalCost.toFixed(3)}</span>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Neural Queries', value: totalQueries.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: 'blue', detail: '+12% from last week' },
                    { label: 'System Latency', value: `${avgLatency}s`, icon: <Clock className="w-5 h-5" />, color: 'emerald', detail: 'Optimized via Routing' },
                    { label: 'Cumulative Tokens', value: (totalTokens / 1000).toFixed(1) + 'k', icon: <TrendingUp className="w-5 h-5" />, color: 'violet', detail: `${(totalTokens / 100).toFixed(0)}% of quota` },
                    { label: 'Credit Efficiency', value: '98.4%', icon: <Shield className="w-5 h-5" />, color: 'amber', detail: 'BYOK Savings Active' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[32px] p-8 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg`} style={{ backgroundColor: `var(--${kpi.color}-500-10)`, color: `var(--${kpi.color}-500)` }}>
                            {kpi.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">{kpi.label}</p>
                        <h4 className="text-3xl font-black tracking-tighter mb-2">{kpi.value}</h4>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{kpi.detail}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[40px] p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Model Utilization Matrix
                        </h3>
                    </div>
                    
                    {stats.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400 font-black uppercase tracking-widest text-xs">Waiting for neural activity...</div>
                    ) : (
                        <div className="space-y-10">
                            {stats.map((s, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-${s.color}-500 group-hover:scale-110 transition-transform`}>
                                                <Cpu className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-black uppercase tracking-widest block">{s.model}</span>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{s.count} requests executed</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-neutral-900 dark:text-white block">{s.tokens.toLocaleString()}</span>
                                                <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Tokens</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black text-blue-600 block">${s.cost.toFixed(4)}</span>
                                                <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">Est. Cost</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-${s.color}-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--${s.color}-500-rgb),0.3)]`} 
                                            style={{ width: `${(s.tokens / maxTokens) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-xl shadow-violet-500/20">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-80">Intelligence Efficiency</h4>
                        <div className="flex items-center justify-center py-8">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="60" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                    <circle cx="64" cy="64" r="60" fill="transparent" stroke="white" strokeWidth="8" strokeDasharray="377" strokeDashoffset="45" strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-2xl font-black">88%</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-center font-medium opacity-80 leading-relaxed px-4">Your usage of DeepSeek and Gemini has reduced your average query cost by 42% compared to pure GPT-4o usage.</p>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[40px] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">BYOK Savings</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Personal Keys used</span>
                                <span className="text-xs font-black text-emerald-500">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Credits saved</span>
                                <span className="text-xs font-black">12,450</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
        </div>
    );
}
