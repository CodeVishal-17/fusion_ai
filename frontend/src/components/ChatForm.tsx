"use client";
import React, { useState } from 'react';
import { Send, Sparkles, Clock, ImageIcon, Cpu, Paperclip, Mic, X, File as FileIcon } from 'lucide-react';

interface ChatFormProps {
    onSend: (input: string, imageMode: boolean, searchMode: boolean, activeModels: string[]) => void;
    onVoice: () => void;
    onFile: (files: File[]) => void;
    loading: boolean;
    dailyCredits: number;
    tokens: number;
    files: File[];
    removeFile: (index: number) => void;
}

export default function ChatForm({ onSend, onVoice, onFile, loading, dailyCredits, tokens, files, removeFile }: ChatFormProps) {
    const [localInput, setLocalInput] = useState('');
    const [imageMode, setImageMode] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [activeModels, setActiveModels] = useState(['openai', 'deepseek', 'meta', 'gemini']);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || loading) return;
        onSend(localInput, imageMode, searchMode, activeModels);
        setLocalInput('');
    };

    const toggleModel = (m: string) => {
        setActiveModels(prev => 
            prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-violet-600/20 rounded-[32px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white dark:bg-[#121214] border border-black/10 dark:border-white/10 rounded-[28px] shadow-2xl overflow-hidden transition-all duration-300 group-focus-within:border-blue-500/50">
                    
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-6 pt-4">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl animate-in zoom-in-95 duration-300">
                                    <FileIcon className="w-3 h-3 text-blue-500" />
                                    <span className="text-[10px] font-bold text-blue-600 truncate max-w-[100px]">{f.name}</span>
                                    <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-blue-500/20 rounded-lg transition-all">
                                        <X className="w-3 h-3 text-blue-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex flex-col">
                        <textarea
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Neural Core Command... (Shift+Enter for new line)"
                            className="w-full bg-transparent border-none outline-none px-6 py-5 text-sm font-medium resize-none min-h-[100px] max-h-[300px] custom-scrollbar"
                        />

                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setSearchMode(!searchMode); setImageMode(false); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-500 hover:border-blue-500/30'}`}
                                >
                                    <Clock className="w-3 h-3" /> {searchMode ? 'Search ON' : 'Search'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setImageMode(!imageMode); setSearchMode(false); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${imageMode ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-500 hover:border-violet-500/30'}`}
                                >
                                    <ImageIcon className="w-3 h-3" /> {imageMode ? 'Image ON' : 'Image'}
                                </button>
                                <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('chat-file-input')?.click()}
                                    className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-500 hover:text-blue-500 transition-all"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <input 
                                    id="chat-file-input"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files) onFile(Array.from(e.target.files));
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={onVoice}
                                    className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-500 hover:text-blue-500 transition-all"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                                <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />
                                <div className="flex items-center gap-1">
                                    {['openai', 'deepseek', 'meta', 'gemini'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => toggleModel(m)}
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${activeModels.includes(m) ? 'bg-blue-500/10 text-blue-500' : 'text-neutral-400 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'}`}
                                            title={m.toUpperCase()}
                                        >
                                            <Cpu className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[9px] font-black uppercase text-neutral-400">Sync Cost</span>
                                    <span className="text-[10px] font-black text-blue-500">{(activeModels.length * 4)} Tokens</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!localInput.trim() || loading}
                                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-6 px-4">
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Neural Link Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Sparkles className="w-3 h-3 text-amber-500" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Hybrid Synthesis Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Daily Balance:</span>
                         <span className="text-[10px] font-black text-blue-600">{dailyCredits + tokens}</span>
                    </div>
                </div>
            </div>
        </form>
    );
}
