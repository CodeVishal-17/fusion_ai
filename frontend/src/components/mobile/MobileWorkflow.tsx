"use client";
import React, { useState } from 'react';
import { Layers, Plus, Play, X, Cpu, CheckCircle2 } from 'lucide-react';

export default function MobileWorkflow() {
    const [steps, setSteps] = useState([{ model: 'openai', instruction: '', order: 1 }]);
    const [running, setRunning] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const addStep = () => setSteps([...steps, { model: 'openai', instruction: '', order: steps.length + 1 }]);
    
    const handleExecute = async () => {
        setRunning(true);
        try {
            const res = await fetch('/api/v1/workflows/execute', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ name: "Mobile Workflow", steps, initialPrompt: "Mobile trigger" })
            });
            const data = await res.json();
            setLastResult(data);
        } catch (err) {
            alert("Execution failed");
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight">AI Pipelines</h2>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Orchestration Chains</p>
                </div>
                <button onClick={handleExecute} disabled={running} className="px-6 py-2 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-600/20">
                    {running ? 'Running...' : 'Execute'}
                </button>
            </div>

            {lastResult && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-emerald-500">Pipeline Finished</span>
                    </div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 line-clamp-3">{lastResult.finalAnswer}</p>
                </div>
            )}

            <div className="space-y-4">
                {steps.map((step, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-4 relative">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase text-violet-500">Step {i+1}</span>
                            <select 
                                value={step.model}
                                onChange={(e) => {
                                    const newSteps = [...steps];
                                    newSteps[i].model = e.target.value;
                                    setSteps(newSteps);
                                }}
                                className="bg-transparent border-none text-[10px] font-black uppercase outline-none"
                            >
                                <option value="openai">GPT-4o</option>
                                <option value="deepseek">DeepSeek</option>
                                <option value="gemini">Gemini</option>
                            </select>
                        </div>
                        <textarea 
                            placeholder="Neural instruction..."
                            value={step.instruction}
                            onChange={(e) => {
                                const newSteps = [...steps];
                                newSteps[i].instruction = e.target.value;
                                setSteps(newSteps);
                            }}
                            className="w-full bg-transparent border-none outline-none text-xs font-bold resize-none min-h-[60px]"
                        />
                    </div>
                ))}
                
                <button 
                    onClick={addStep}
                    className="w-full py-4 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase text-neutral-400 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Step
                </button>
            </div>
        </div>
    );
}
