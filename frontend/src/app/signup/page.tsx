"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/signup", {
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
                setError(data.error || "Signup failed");
            }
        } catch (err) {
            setError("Connection error. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#020202] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-black/40 backdrop-blur-3xl border border-neutral-200 dark:border-white/10 p-10 rounded-[40px] shadow-2xl">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6 group">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-12 group-hover:rotate-0 transition-all duration-500">
                            <Zap className="w-10 h-10 text-white fill-white/20" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">
                        AI<span className="text-cyan-400">Fusion</span>
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3">Start your journey with 100 free credits.</p>
                </div>

                {error && <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">{error}</div>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    />
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Create Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Free Account"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500">
                    Already have an account? <Link href="/login" className="text-blue-500 font-bold hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
}
