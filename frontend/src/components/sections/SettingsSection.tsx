"use client";
import React, { useState } from 'react';
import { Settings, Key, Shield, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsSection() {
    const [keys, setKeys] = useState({
        openai: '',
        gemini: '',
        anthropic: '',
        perplexity: ''
    });
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('/api/v1/user/keys', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ keys })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Save failed", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleShow = (provider: string) => {
        setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">Power Settings</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Configure your personal intelligence infrastructure and API credentials.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* BYOK Section */}
                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Bring Your Own Key (BYOK)</h3>
                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Your keys are encrypted and used only for your requests.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { id: 'openai', label: 'OpenAI API Key', placeholder: 'sk-...' },
                            { id: 'gemini', label: 'Google Gemini Key', placeholder: 'AIza...' },
                            { id: 'anthropic', label: 'Anthropic Key', placeholder: 'sk-ant-...' },
                            { id: 'perplexity', label: 'Perplexity Key', placeholder: 'pplx-...' },
                        ].map((field) => (
                            <div key={field.id} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1">{field.label}</label>
                                <div className="relative group">
                                    <input 
                                        type={showKeys[field.id] ? 'text' : 'password'}
                                        placeholder={field.placeholder}
                                        value={(keys as any)[field.id]}
                                        onChange={(e) => setKeys(prev => ({ ...prev, [field.id]: e.target.value }))}
                                        className="w-full bg-neutral-50 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl px-5 py-3.5 text-xs font-mono focus:border-blue-500/50 outline-none transition-all pr-12"
                                    />
                                    <button 
                                        onClick={() => toggleShow(field.id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-blue-500 transition-colors"
                                    >
                                        {showKeys[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Shield className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">AES-256 Storage Encryption</span>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'}`}
                        >
                            {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
                            {saved ? 'Saved' : 'Save Credentials'}
                        </button>
                    </div>
                </div>

                {/* Personalization Section */}
                <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[32px] p-8">
                    <div className="flex items-center gap-3 mb-8">
                         <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest">Global Preferences</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400 px-1">Response Personality</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {['Concise', 'Balanced', 'Verbose'].map(tone => (
                                    <button key={tone} className="py-2.5 bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all">
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-400 px-1">Long-Term Memory</h4>
                            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <span className="text-xs font-bold">Enabled</span>
                                <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
