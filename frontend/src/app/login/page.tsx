"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, Sparkles, Mic, Layout, Download, Cpu, Shield, Globe, Loader2, ArrowRight, Github } from "lucide-react";
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
        const particleCount = 80;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number; y: number; vx: number; vy: number; size: number;
            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
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
                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist / 150})`;
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
        <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Dynamic Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Content Container */}
            <div className="w-full max-w-md z-10 animate-in fade-in zoom-in duration-1000">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 group hover:rotate-12 transition-transform duration-500">
                        <Zap className="w-10 h-10 text-white fill-white/20" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Initiate Link
                    </h1>
                    <p className="text-neutral-500 font-medium text-sm">Sync your neural profile to access the dashboard.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button 
                        onClick={() => handleSocialLogin('google')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('github')}
                        className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-violet-500/30 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/5 transition-colors" />
                        <Github className="w-5 h-5 text-violet-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">GitHub</span>
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500"><span className="bg-[#050505] px-4">Quantum Login</span></div>
                </div>

                {/* Local Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-4">Identity</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                placeholder="name@neural.link"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all group-hover:border-white/20"
                                required
                            />
                            <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between mx-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Security Code</label>
                            <Link href="#" className="text-[9px] font-bold text-blue-500 hover:text-blue-400">Forgot Code?</Link>
                        </div>
                        <div className="relative group">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-600/50 focus:bg-white/10 transition-all group-hover:border-white/20"
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
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Workspace</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-neutral-500 text-xs">
                    Don't have access yet? <Link href="#" className="text-blue-500 font-bold hover:underline">Request Entry</Link>
                </p>
            </div>

            {/* Bottom Footer Info */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-[9px] font-black uppercase tracking-widest text-neutral-700 opacity-50">
                <div className="flex items-center gap-2"><Shield className="w-3 h-3" /> Encrypted</div>
                <div className="flex items-center gap-2"><Cpu className="w-3 h-3" /> Edge Compute</div>
                <div className="flex items-center gap-2"><Layout className="w-3 h-3" /> Multi-Core</div>
            </div>
        </div>
    );
}
