"use client";
import React, { useState } from 'react';
import { Layers, Plus, Play, Shield, X, Cpu, Zap, Trash2, CheckCircle2, Book, FileText, BarChart3, Settings, MessageSquare, Sun, Moon, LogOut, User, Image, Download, PanelLeft, Search, Database } from 'lucide-react';

export default function WorkflowSection() {
    const [showModal, setShowModal] = useState(false);
    const [workflowName, setWorkflowName] = useState('');
    const [steps, setSteps] = useState([{ model: 'openai', instruction: '', order: 1 }]);
    const [running, setRunning] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const addStep = () => {
        setSteps([...steps, { model: 'openai', instruction: '', order: steps.length + 1 }]);
    };

    const updateStep = (index: number, field: string, value: string) => {
        const newSteps = [...steps];
        (newSteps[index] as any)[field] = value;
        setSteps(newSteps);
    };

    const removeStep = (index: number) => {
        if (steps.length === 1) return;
        setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 })));
    };

    const handleExecute = async () => {
        if (!workflowName.trim()) return alert("Please name your workflow.");
        setRunning(true);
        setLastResult(null);
        try {
            const res = await fetch('/api/v1/workflows/execute', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: workflowName,
                    steps: steps,
                    initialPrompt: "Starting custom neural workflow..." 
                })
            });
            const data = await res.json();
            if (data.finalAnswer) {
                setLastResult(data);
                setShowModal(false);
            } else {
                alert("Execution failed: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Network error executing workflow.");
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">AI Neural Workflows</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Orchestrate complex automation chains by connecting multiple intelligence cores.</p>
                </div>
                <button 
                    onClick={() => { setShowModal(true); setLastResult(null); }}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Create Pipeline
                </button>
            </div>

            {lastResult && (
                <div className="mb-10 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[40px] p-8 animate-in zoom-in duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="w-6 h-6" />
                             </div>
                             <div>
                                <h3 className="text-lg font-black tracking-tight">Execution Complete</h3>
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Workflow: {workflowName}</p>
                             </div>
                        </div>
                        <button onClick={() => setLastResult(null)} className="p-2 text-neutral-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-6">
                        {lastResult.results.map((res: any, i: number) => (
                            <div key={i} className="relative pl-10 border-l-2 border-dashed border-neutral-200 dark:border-white/10 pb-6 last:pb-0">
                                <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-black">
                                    {res.step}
                                </div>
                                <div className="bg-neutral-50 dark:bg-black/20 rounded-3xl p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-violet-500">Step {res.step}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">•</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{res.model}</span>
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 mb-4 italic">"{res.instruction}"</p>
                                    <div className="text-sm font-medium leading-relaxed opacity-90 whitespace-pre-wrap">{res.answer}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Empty State / Call to Action */}
                <div className="lg:col-span-3 py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-white/5 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-[40px] group hover:border-violet-500/50 transition-all">
                     <div className="w-20 h-20 rounded-3xl bg-violet-600/10 flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                        <Layers className="w-10 h-10" />
                     </div>
                     <h3 className="text-xl font-black uppercase tracking-tightest mb-2">Build Your First Chain</h3>
                     <p className="text-sm text-neutral-500 font-medium mb-8 leading-relaxed max-w-sm">
                        Workflows allow you to take the output of one model and feed it into another for deeper refinement and professional automation.
                     </p>
                     <button 
                        onClick={() => setShowModal(true)}
                        className="px-10 py-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                     >
                        Initialize New Pipeline
                     </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-3xl rounded-[40px] border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors z-10"><X className="w-5 h-5" /></button>
                        
                        <div className="p-10 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-500/20">
                                    <Plus className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Neural Pipeline Architect</h3>
                                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Connect multiple models into a singular execution chain</p>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 block mb-3 px-1">Workflow Identity</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Content Research & Synthesis Pipeline"
                                        value={workflowName}
                                        onChange={(e) => setWorkflowName(e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-[24px] px-8 py-5 text-sm font-bold outline-none focus:border-violet-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 block px-1">Execution Steps</label>
                                    {steps.map((step, index) => (
                                        <div key={index} className="bg-neutral-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-[32px] p-8 relative animate-in slide-in-from-right-4 duration-300">
                                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                                                {index + 1}
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <select 
                                                            value={step.model}
                                                            onChange={(e) => updateStep(index, 'model', e.target.value)}
                                                            className="bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-violet-500"
                                                        >
                                                            <option value="openai">OpenAI GPT-4o</option>
                                                            <option value="deepseek">DeepSeek V3</option>
                                                            <option value="gemini">Gemini 2.5 Pro</option>
                                                            <option value="meta">Llama 3 (Meta)</option>
                                                        </select>
                                                        {steps.length > 1 && (
                                                            <button onClick={() => removeStep(index)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <textarea 
                                                        placeholder="Specific instructions for this step..."
                                                        value={step.instruction}
                                                        onChange={(e) => updateStep(index, 'instruction', e.target.value)}
                                                        className="w-full bg-transparent border-none outline-none text-xs font-bold resize-none min-h-[60px]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={addStep}
                                        className="w-full py-5 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:border-violet-500/50 hover:text-violet-500 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Neural Step
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-black/40 mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-violet-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{steps.length} Steps Sequence</span>
                            </div>
                            <button 
                                onClick={handleExecute}
                                disabled={running || !workflowName.trim() || steps.some(s => !s.instruction.trim())}
                                className="px-12 py-5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-violet-500/30 disabled:opacity-50 disabled:grayscale flex items-center gap-3"
                            >
                                {running ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
                                {running ? 'Executing Neural Chain...' : 'Initialize & Execute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
