"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Zap, Eye, EyeOff, Sparkles, Mic, Layout, Download, 
  Cpu, Shield, Globe, Loader2, ArrowRight, Mail, 
  Command, Box, Activity, Layers, Terminal
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- 🕸️ NEURAL NETWORK ANIMATION ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 60;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number; y: number; vx: number; vy: number; size: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.size = Math.random() * 1.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
            }
            draw() {
                ctx!.fillStyle = 'rgba(59, 130, 246, 0.4)';
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
            }
        }

        const init = () => {
            resize();
            particles = [];
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = p.x - particles[j].x;
                    const dy = p.y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 - dist / 300})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // --- 🔗 BRIDGE: SYNC NEXTAUTH TO BACKEND JWT ---
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const provider = localStorage.getItem("pending_provider") || 'google';
            syncWithBackend(provider);
        }
    }, [status, session]);

    const syncWithBackend = async (provider: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/auth/social-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: session?.user?.email,
                    name: session?.user?.name,
                    authProvider: provider,
                    isSimulation: false
                })
            });

            const data = await response.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/");
            } else {
                setError(data.error || `Bridge failure: ${response.status}`);
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
                setError(data.error || "Access denied.");
            }
        } catch (err) {
            setError("Connection to neural core failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setError("");
        try {
            localStorage.setItem("pending_provider", provider);
            await signIn(provider);
        } catch (err) {
            setError("Failed to initiate secure link.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#030303] text-white flex relative overflow-hidden font-sans">
            {/* Background Layer */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse z-0" />

            {/* Left Side: Context & Showcase (Desktop Only) */}
            <div className="hidden lg:flex flex-1 flex-col justify-center p-20 relative z-10 border-r border-white/5 bg-gradient-to-br from-black/50 to-transparent backdrop-blur-sm">
                <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white fill-white/20" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter">AI<span className="text-blue-500">Fusion</span></h2>
                    </div>

                    <h3 className="text-6xl font-black tracking-tightest leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        The World's AI, <br />
                        <span className="text-blue-500 italic">One Unified Flow.</span>
                    </h3>

                    <p className="text-neutral-400 text-lg font-medium mb-12 leading-relaxed">
                        Step into the neural synthesis engine. Compare models, analyze outputs, and command the collective intelligence of OpenAI, Gemini, and Meta from a single command center.
                    </p>

                    {/* Dynamic Feature Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { icon: <Activity className="w-5 h-5" />, title: "Comparative Sync", desc: "Real-time model benchmarking." },
                            { icon: <Layers className="w-5 h-5" />, title: "Multi-Modal", desc: "Images, text, and code synthesis." },
                            { icon: <Shield className="text-emerald-500 w-5 h-5" />, title: "Neural Privacy", desc: "Encrypted workspace tunnels." },
                            { icon: <Terminal className="text-blue-500 w-5 h-5" />, title: "Edge Compute", desc: "Zero-latency neural routing." }
                        ].map((f, i) => (
                            <div key={i} className="group p-6 bg-white/5 border border-white/10 rounded-[28px] hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-default">
                                <div className="mb-4 text-blue-500 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">{f.title}</h4>
                                <p className="text-[10px] text-neutral-500 font-medium">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-8">
                         <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase text-neutral-500">Active Nodes</span>
                             <span className="text-sm font-bold text-emerald-500 animate-pulse">4 READY</span>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase text-neutral-500">Neural Traffic</span>
                             <span className="text-sm font-bold text-blue-500 font-mono">2.4 GB/s</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM (Visible on all screens) --- */}
            <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 relative z-10 bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-3xl lg:backdrop-blur-none lg:bg-transparent">
            
            {/* Mobile-Only Header Context */}
            <div className="lg:hidden absolute top-12 left-0 w-full px-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter">AI Fusion</h1>
                </div>
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Neural Synthesis Core</p>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] rounded-[40px] p-8 sm:p-12 border border-black/5 dark:border-white/10 shadow-2xl relative">
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Initialize Core</h2>
                    <p className="text-neutral-500 font-medium">Access your individual memory bank.</p>
                </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button 
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                        >
                            <Globe className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('github')}
                            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all group">
                        <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">GitHub</span>
                    </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500"><span className="bg-[#030303] px-4">Direct Neural Access</span></div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Identity</label>
                            <div className="relative group">
                                <input 
                                    type="email" 
                                    placeholder="name@neural.link"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all"
                                    required
                                />
                                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between mx-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Security Code</label>
                            </div>
                            <div className="relative group">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-5 rounded-[24px] mt-6 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Enter Workspace</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-neutral-500 text-xs">
                        By entering, you agree to the <Link href="#" className="text-blue-500 font-bold hover:underline">Neural Protocols</Link>.
                    </p>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full z-0" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full z-0" />
        </div>
    );
}
