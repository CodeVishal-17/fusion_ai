"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Zap, Eye, EyeOff, Shield, Loader2, ArrowRight, Mail, 
  Activity, Layers, Terminal, Layout, Sparkles, ShieldCheck, MessageCircle, Cpu, Coins, Clock
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

    // --- NEURAL NETWORK ANIMATION ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        const particleCount = 70;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number; y: number; vx: number; vy: number; size: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
            }
            draw() {
                ctx!.fillStyle = 'rgba(59, 130, 246, 0.5)';
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
                    if (dist < 130) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 - dist / 325})`;
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

    // --- BRIDGE: SYNC NEXTAUTH TO BACKEND JWT ---
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
            {/* Neural Network Animation Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse z-0" />
            <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-violet-600/10 blur-[150px] rounded-full z-0" />

            {/* LEFT SIDE: Brand Context (Desktop Only) */}
            <div className="hidden lg:flex flex-1 flex-col justify-center p-20 relative z-10 border-r border-white/5">
                <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-7 h-7 text-white" />
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

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <Sparkles className="w-5 h-5 text-amber-500" />, title: "4 AIs at Once", desc: "Compare GPT-4, Gemini 1.5, Claude, and Llama 3 in one unified interface." },
                            { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, title: "Verify Truth", desc: "Automatic consensus analysis to filter out AI hallucinations instantly." },
                            { icon: <Zap className="w-5 h-5 text-blue-500" />, title: "Winner Crown", desc: "Our neural evaluator picks the best answer based on logic and accuracy." },
                            { icon: <MessageCircle className="w-5 h-5 text-violet-500" />, title: "Battle Mode", desc: "Let models debate each other to reach the most refined conclusion." },
                            { icon: <Cpu className="w-5 h-5 text-pink-500" />, title: "Peak Speed", desc: "Parallel processing ensures the fastest response from every model." },
                            { icon: <Coins className="w-5 h-5 text-orange-500" />, title: "Cost Savings", desc: "Access premium model intelligence at a fraction of individual subscriptions." }
                        ].map((f, i) => (
                            <div key={i} className="group p-5 bg-white/5 border border-white/10 rounded-[24px] hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-default">
                                <div className="mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h4 className="text-xs font-black uppercase tracking-widest mb-1">{f.title}</h4>
                                <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8">
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

            {/* RIGHT SIDE: Login Form */}
            <div className="w-full lg:w-1/2 min-h-screen flex flex-col items-center justify-center p-6 relative z-10">

                {/* Mobile-Only Brand Header */}
                <div className="lg:hidden flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter">AI<span className="text-blue-500">Fusion</span></h1>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Neural Synthesis Core</p>
                    
                    <div className="flex items-center gap-6 mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Nodes</div>
                            <div className="text-xs font-mono font-bold text-emerald-400">4 READY</div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Traffic</div>
                            <div className="text-xs font-mono font-bold text-blue-400">2.4 GB/s</div>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Models</div>
                            <div className="text-xs font-mono font-bold text-amber-400">4 LIVE</div>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
                    
                    <div className="mb-8">
                        <h2 className="text-2xl font-black tracking-tight mb-1">Initialize Core</h2>
                        <p className="text-neutral-500 text-sm font-medium">Access your individual memory bank.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button 
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/40 transition-all group"
                        >
                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-xs font-black uppercase tracking-widest">Google</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('github')}
                            className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-violet-500/40 transition-all group"
                        >
                            <Layout className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <span className="text-xs font-black uppercase tracking-widest">GitHub</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">
                            <span className="bg-[#0a0a0a] px-4">Direct Neural Access</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Identity</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    placeholder="name@neural.link"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm text-white placeholder:text-neutral-600"
                                    required
                                />
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Security Code</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm text-white placeholder:text-neutral-600"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl mt-2 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {loading 
                                ? <Loader2 className="w-5 h-5 animate-spin" /> 
                                : <><span>Enter Workspace</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            }
                        </button>
                    </form>

                    <p className="mt-6 text-center text-neutral-600 text-xs">
                        By entering, you agree to the <Link href="#" className="text-blue-500 font-bold hover:underline">Neural Protocols</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
