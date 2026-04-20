"use client";
import React from 'react';
import { MessageSquare, Book, Layers, BarChart3, Settings, Zap } from 'lucide-react';

interface MobileSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    credits: number;
}

export default function MobileSidebar({ activeSection, setActiveSection, credits }: MobileSidebarProps) {
    const tabs = [
        { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Synthesis' },
        { id: 'knowledge', icon: <Book className="w-5 h-5" />, label: 'Knowledge' },
        { id: 'workflows', icon: <Layers className="w-5 h-5" />, label: 'Pipeline' },
        { id: 'analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Metrics' },
        { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Power' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 px-4 pb-safe-area-inset-bottom">
            <div className="flex items-center justify-between h-20 max-w-lg mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 transition-all relative ${activeSection === tab.id ? 'text-blue-600' : 'text-neutral-400'}`}
                    >
                        {activeSection === tab.id && (
                            <div className="absolute -top-4 w-12 h-1 bg-blue-600 rounded-full animate-in slide-in-from-top-1 duration-300" />
                        )}
                        <div className={`p-2 rounded-2xl transition-all ${activeSection === tab.id ? 'bg-blue-600/10' : ''}`}>
                            {tab.icon}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
                    </button>
                ))}
            </div>
            
            {/* Mobile Credits Floating Tag */}
            <div className="absolute -top-12 right-6 bg-neutral-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-white/10 dark:border-black/10 scale-90">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> {credits}
            </div>
        </div>
    );
}
