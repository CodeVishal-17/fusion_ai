"use client";
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, Zap, Cpu } from 'lucide-react';

export default function AnalyticsSection() {
    const [stats, setStats] = useState<any[]>([]);

    useEffect(() => {
        // Mock data
        setStats([
            { model: 'OpenAI (GPT-4o)', tokens: 154200, cost: 0.31, avgTime: 1.2, color: 'blue' },
            { model: 'DeepSeek V3', tokens: 89000, cost: 0.04, avgTime: 0.8, color: 'emerald' },
            { model: 'Gemini 2.5 Pro', tokens: 45000, cost: 0.05, avgTime: 1.5, color: 'violet' },
            { model: 'Meta Llama 3', tokens: 12000, cost: 0.01, avgTime: 0.9, color: 'orange' }
        ]);
    }, []);

    const totalCost = stats.reduce((acc, curr) => acc + curr.cost, 0);
    const maxTokens = Math.max(...stats.map(s => s.tokens));

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">Intelligence Analytics</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Real-time tracking of model performance, token usage, and cost efficiency.</p>
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
                    { label: 'Total Queries', value: '412', icon: <Zap className="w-5 h-5" />, color: 'blue' },
                    { label: 'Avg Latency', value: '1.1s', icon: <Clock className="w-5 h-5" />, color: 'emerald' },
                    { label: 'Tokens Saved', value: '12.4k', icon: <TrendingUp className="w-5 h-5" />, color: 'violet' },
                    { label: 'Cost Avoidance', value: '$12.50', icon: <DollarSign className="w-5 h-5" />, color: 'amber' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[28px] p-6 group hover:shadow-xl transition-all">
                        <div className={`w-10 h-10 rounded-2xl bg-${kpi.color}-500/10 flex items-center justify-center text-${kpi.color}-500 mb-4`}>
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
                    Model Utilization %
                </h3>
                
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
                                    <span className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest">${s.cost.toFixed(2)}</span>
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
            </div>
        </div>
    );
}
