"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, Sparkles, Mic, Layout, Download, Cpu, Shield, Globe, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    // --- 🔗 BRIDGE: SYNC NEXTAUTH TO BACKEND JWT ---
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            syncWithBackend();
        }
    }, [status, session]);

    const syncWithBackend = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/auth/social-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session?.user?.email,
                    name: session?.user?.name,
                    authProvider: 'social',
                    isSimulation: false // REAL LOGIN
                })
            });

            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError("Authentication bridge failed.");
            }
        } catch (err) {
            setError("Neural gateway connection lost.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Connection error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const features = [
      { icon: <Cpu className="w-5 h-5" />, title: "5-Model Comparative Engine", desc: "OpenAI, Meta, Gemini, DeepSeek, and Together AI in one grid." },
      { icon: <Mic className="w-5 h-5" />, title: "Voice & Speech Intelligence", desc: "Talk to your AI and listen to responses with natural voices." },
      { icon: <Layout className="w-5 h-5" />, title: "Dynamic Adaptive Grid", desc: "Layouts that automatically optimize for your workspace." },
      { icon: <Download className="w-5 h-5" />, title: "Pro Markdown Exports", desc: "Save your entire multi-model conversation with one click." }
    ];

    const handleSocialLogin = async (provider: string) => {
        setError("");
        try {
            await signIn(provider);
        } catch (err) {
            setError("Failed to initiate secure link.");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080809] flex overflow-hidden relative">
            {/* --- 🌌 CINEMATIC BACKGROUND ELEMENTS --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[150px] animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]" />
            </div>

            {/* Left Side: Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-white dark:bg-[#0c0c0e] border-r border-black/5 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="relative z-10 animate-in slide-in-from-left duration-700">
                    <div className="flex items-center gap-4 mb-20 group/logo">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover/logo:scale-110 group-hover/logo:rotate-12 transition-all duration-500">
                            <Zap className="w-7 h-7 text-white fill-white/20" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter">AI<span className="text-blue-600">Fusion</span></h1>
                    </div>

                    <h2 className="text-6xl font-black tracking-tighter leading-[0.95] mb-8 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        Synthesize <br />
                        <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Intelligence.</span>
                    </h2>
                    <p className="text-neutral-500 text-xl max-w-md mb-16 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        The ultimate comparative playground for the world's most powerful language models. One prompt, infinite perspectives.
                    </p>

                    <div className="grid grid-cols-1 gap-5">
                        {features.map((f, i) => (
                            <div 
                                key={i} 
                                className="flex gap-5 p-6 rounded-[24px] bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group/card animate-in slide-in-from-left-12 duration-700"
                                style={{ animationDelay: `${300 + i * 150}ms`, animationFillMode: 'both' }}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center text-blue-600 shadow-sm border border-black/5 dark:border-white/5 group-hover/card:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm mb-1 tracking-tight">{f.title}</h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] text-neutral-400 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-500" /> AES-256 Encryption
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-violet-500" /> Neural Edge Network
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative z-10 animate-in fade-in duration-1000">
                <div className="max-w-md w-full relative">
                    <div className="lg:hidden flex flex-col items-center mb-12">
                         <div className="w-20 h-20 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-2xl mb-8 animate-bounce-slow">
                            <Zap className="w-12 h-12 text-white fill-white/20" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter">AI<span className="text-blue-600">Fusion</span></h1>
                    </div>

                    <div className="mb-12 text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tighter mb-3">Initiate Link</h2>
                        <p className="text-neutral-500 text-sm font-medium">Sync your neural profile to access the dashboard.</p>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm">
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" /> Google
                        </button>
                        <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm">
                            <img src="https://github.com/favicon.ico" className="w-4 h-4" /> GitHub
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mb-10">
                        <div className="flex-1 h-[1px] bg-black/5 dark:bg-white/10" />
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Quantum Login</span>
                        <div className="flex-1 h-[1px] bg-black/5 dark:bg-white/10" />
                    </div>

                    {error && (
                        <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-wider text-center animate-in zoom-in duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 mb-2 block">Identity</label>
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1 mb-2 block">Security Code</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-1 text-[11px] font-bold">
                            <label className="flex items-center gap-2 cursor-pointer text-neutral-500">
                                <input type="checkbox" className="w-4 h-4 rounded border-neutral-200" />
                                Remember Device
                            </label>
                            <Link href="#" className="text-blue-600 hover:underline">Forgot Password?</Link>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/30 disabled:opacity-50 mt-4 active:scale-95"
                        >
                            {loading ? "Authenticating Gateway..." : "Sign In to Workspace"}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-black/5 dark:border-white/5 text-center">
                        <p className="text-sm text-neutral-500 font-medium">
                            Don't have an account yet? <Link href="/signup" className="text-blue-600 font-black hover:underline ml-1">Create Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
