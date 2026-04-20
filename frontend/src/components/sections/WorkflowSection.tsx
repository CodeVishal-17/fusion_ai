"use client";
import React, { useState } from 'react';
import { Layers, Plus, Play, Shield, X, Cpu, Zap } from 'lucide-react';

export default function WorkflowSection() {
    const [showModal, setShowModal] = useState(false);
    const [workflowName, setWorkflowName] = useState('');

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">Workflow Builder</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Chain multiple AI agents together to automate complex research and writing tasks.</p>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center py-20 text-center bg-white dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 rounded-[40px]">
                <div className="max-w-md">
                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-500 mx-auto mb-6">
                        <Layers className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tightest mb-2">Build Your First Chain</h2>
                    <p className="text-sm text-neutral-500 font-medium mb-8 leading-relaxed px-4">
                        Connect different models (OpenAI, DeepSeek, Gemini) in sequence to perform high-level analysis and content generation automatically.
                    </p>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 active:scale-95"
                    >
                        Create Neural Workflow
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-lg rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden">
                        <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">New Workflow</h3>
                                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Architect your automation chain</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-2 px-1">Workflow Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Market Research Synthesis"
                                        value={workflowName}
                                        onChange={(e) => setWorkflowName(e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:border-violet-500/50 transition-all"
                                    />
                                </div>

                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <p className="text-[10px] font-bold text-neutral-500 leading-normal">
                                        Workflows allow you to take the output of one model and feed it into another for deeper refinement.
                                    </p>
                                </div>

                                <button 
                                    className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                                    disabled={!workflowName.trim()}
                                >
                                    Initialize Workflow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
