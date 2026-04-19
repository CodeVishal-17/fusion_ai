"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Shield, Coins, ArrowLeft, LogOut, 
  Zap, ChevronRight, CreditCard, Sparkles, Clock, Settings 
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/v1/user/me", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            setUserData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080809] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080809] text-neutral-900 dark:text-white p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-blue-600 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center group-hover:border-blue-600/30 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Workspace
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left: Identity Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#0c0c0e] rounded-[32px] border border-black/5 dark:border-white/5 p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all" />
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-blue-600 to-violet-500 p-1 mb-6 shadow-2xl shadow-blue-500/20">
                                    <div className="w-full h-full bg-white dark:bg-[#0c0c0e] rounded-[28px] flex items-center justify-center text-4xl font-black">
                                        {userData?.name?.[0] || <User className="w-10 h-10 text-blue-600" />}
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black tracking-tight">{userData?.name || "AI Architect"}</h2>
                                <p className="text-neutral-500 text-sm font-medium mt-1">{userData?.email}</p>
                                
                                <div className="mt-8 flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" /> {userData?.plan?.toUpperCase() || "FREE"} USER
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Energy Meter */}
                        <div className="bg-white dark:bg-[#0c0c0e] rounded-[32px] border border-black/5 dark:border-white/5 p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Total Credits</h3>
                                </div>
                                <span className="text-2xl font-black">{userData?.credits?.toLocaleString() || 0}</span>
                            </div>
                            
                            <div className="w-full h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000" 
                                    style={{ width: `${Math.min((userData?.credits / 10000) * 100, 100)}%` }}
                                />
                            </div>
                            
                            <button className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 group">
                                <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" /> Top Up Energy
                            </button>
                        </div>
                    </div>

                    {/* Right: Settings & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Features Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { icon: <Shield className="text-emerald-500" />, title: "Privacy Mode", status: "Always Active", desc: "Your prompts are never used for training." },
                                { icon: <Zap className="text-blue-500" />, title: "Turbo Output", status: "Pro Feature", desc: "Priority access to high-demand model clusters." },
                                { icon: <Clock className="text-purple-500" />, title: "Session History", status: "Cloud Sync", desc: "Access your synthesis sessions from any device." },
                                { icon: <Settings className="text-neutral-500" />, title: "Custom Presets", status: "Configured", desc: "Your model selection and layout are saved." },
                            ].map((f, i) => (
                                <div key={i} className="bg-white dark:bg-[#0c0c0e] rounded-3xl border border-black/5 dark:border-white/5 p-6 hover:border-blue-600/20 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                                            {f.icon}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400 bg-neutral-50 dark:bg-white/5 px-2 py-1 rounded-md">{f.status}</span>
                                    </div>
                                    <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Log */}
                        <div className="bg-white dark:bg-[#0c0c0e] rounded-[32px] border border-black/5 dark:border-white/5 p-8 shadow-xl">
                            <h3 className="text-lg font-black tracking-tight mb-8 flex items-center gap-3">
                                <Clock className="w-5 h-5 text-blue-600" /> Recent Synthesis Sessions
                            </h3>
                            
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Multi-Model Analysis Session #{842 - i}</p>
                                                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">AIFusion Core • 2 hours ago</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
