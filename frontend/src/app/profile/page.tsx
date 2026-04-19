"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  User, Mail, Shield, Coins, ArrowLeft, LogOut, 
  Zap, ChevronRight, CreditCard, Sparkles, Clock, Settings,
  Edit2, Check, X, Loader2, MessageSquare, HelpCircle, MessageCircle,
  Image, Cpu, ClipboardList, ArrowRight
} from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ProfilePage() {
    const [userData, setUserData] = useState<any>(null);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchProfile();
        fetchHistory();

        // Timer for credit reset
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = tomorrow.getTime() - now.getTime();
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);

        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            clearInterval(timer);
            document.body.removeChild(script);
        };
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/v1/user/me", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            setUserData(data);
            setNewName(data.name || "");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/v1/user/history", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setChatHistory(data);
        } catch (err) {
            console.error("History Error:", err);
        }
    };

    const handleUpdateProfile = async () => {
        if (!newName.trim() || newName === userData.name) {
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/v1/user/update", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ name: newName })
            });

            const data = await res.json();
            if (res.ok) {
                setUserData({ ...userData, name: newName });
                setMessage({ type: "success", text: "Neural profile updated." });
                setIsEditing(false);
            } else {
                setMessage({ type: "error", text: data.error || "Update failed." });
            }
        } catch (err) {
            setMessage({ type: "error", text: "Connection to core failed." });
        } finally {
            setUpdating(false);
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        }
    };

    const handleBuyCredits = async (amount: number, type: string) => {
        try {
            const res = await fetch("/api/v1/payment/create-order", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ amount, planType: type })
            });
            const order = await res.json();
    
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "AIFusion",
                description: `Refuel ${type === 'pro' ? '1500' : '500'} Energy Tokens`,
                order_id: order.id,
                handler: async function (response: any) {
                    const verifyRes = await fetch("/api/v1/payment/verify-payment", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        },
                        body: JSON.stringify(response)
                    });
                    const result = await verifyRes.json();
                    if (result.success) {
                        setMessage({ type: "success", text: "Energy core refueled successfully!" });
                        setShowCreditModal(false);
                        fetchProfile(); // Refresh tokens
                    }
                },
                theme: { color: "#2563eb" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert("Payment gateway connection failed.");
        }
    };

    const handleLogout = async () => {
        localStorage.clear();
        await signOut({ redirect: false });
        router.push("/login");
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080809] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#080809] text-neutral-900 dark:text-white p-4 md:p-12 transition-colors duration-500">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <Link href="/" className="group flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-blue-600 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center group-hover:border-blue-600/30 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Back to Workspace
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl text-xs font-bold text-center animate-in slide-in-from-top-2 ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
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

                                {isEditing ? (
                                    <div className="w-full flex flex-col items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-4 py-2 text-center text-lg font-black outline-none focus:border-blue-500 transition-all"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleUpdateProfile}
                                                disabled={updating}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                            >
                                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => { setIsEditing(false); setNewName(userData.name); }}
                                                className="p-2 bg-neutral-200 dark:bg-white/10 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center group/name w-full">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-black tracking-tight text-center">{userData?.name || "AI Architect"}</h2>
                                            <button 
                                                onClick={() => setIsEditing(true)}
                                                className="p-1.5 opacity-0 group-hover/name:opacity-100 bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="text-neutral-500 text-sm font-medium mt-1 truncate max-w-full">{userData?.email}</p>
                                    </div>
                                )}
                                
                                <div className="mt-8 flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" /> {userData?.plan?.toUpperCase() || "FREE"} USER
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-neutral-500/10 text-neutral-500 text-[10px] font-black uppercase tracking-widest border border-neutral-500/20 flex items-center gap-1.5">
                                        <Shield className="w-3 h-3" /> VERIFIED
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
                                    <h3 className="font-black text-sm uppercase tracking-widest text-neutral-400">Total Energy</h3>
                                </div>
                                <span className="text-2xl font-black">{((userData?.credits || 0) + (userData?.dailyFreeCredits || 0)).toLocaleString()}</span>
                            </div>
                            
                            <div className="w-full h-2 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden mb-6">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000" 
                                    style={{ width: `${Math.min(((userData?.credits + userData?.dailyFreeCredits) / 10000) * 100, 100)}%` }}
                                />
                            </div>
                            
                            <button 
                                onClick={() => setShowCreditModal(true)}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 group"
                            >
                                <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" /> Top Up Energy
                            </button>
                        </div>
                    </div>

                    {/* Right: Settings & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Features Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: <Shield className="text-emerald-500" />, title: "Privacy Mode", status: "Always Active", desc: "Your prompts are never used for training." },
                                { icon: <Zap className="text-blue-500" />, title: "Turbo Output", status: "Pro Feature", desc: "Priority access to high-demand clusters." },
                                { icon: <Clock className="text-purple-500" />, title: "Session History", status: "Cloud Sync", desc: "Access sessions from any device." },
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
                                {chatHistory.length > 0 ? chatHistory.map((chat, i) => (
                                    <div key={chat._id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate max-w-[200px] md:max-w-md">{chat.prompt}</p>
                                                <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">
                                                    {new Date(chat.createdAt).toLocaleDateString()} â€¢ {chat.bestModel || "AIFusion Core"}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )) : (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 bg-neutral-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Zap className="w-6 h-6 text-neutral-300" />
                                        </div>
                                        <p className="text-neutral-500 text-sm font-medium">No synthesis sessions found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- âš¡ CREDIT TOP-UP MODAL --- */}
                {showCreditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-[40px] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden relative">
                            <button onClick={() => setShowCreditModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="p-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight">Refuel Your AI âš¡</h2>
                                        <p className="text-neutral-500 text-sm">Choose a plan to continue your synthesis.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                                        <div>
                                            <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Starter Pack</h3>
                                            <div className="text-3xl font-black mb-4">â‚¹99</div>
                                            <ul className="space-y-2 mb-6">
                                                <li className="text-xs flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                                                    <Sparkles className="w-3 h-3 text-blue-500" /> 500 Credits
                                                </li>
                                                <li className="text-xs flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                                                    <Sparkles className="w-3 h-3 text-blue-500" /> One-time Topup
                                                </li>
                                            </ul>
                                        </div>
                                        <button onClick={() => handleBuyCredits(99, 'starter')} className="w-full py-3 bg-white dark:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest border border-black/5 dark:border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            Get Credits
                                        </button>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-blue-600/5 dark:bg-blue-600/10 border-2 border-blue-600/30 flex flex-col justify-between relative group">
                                        <div className="absolute top-4 right-4 bg-blue-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Best Value</div>
                                        <div>
                                            <h3 className="font-black text-xs uppercase tracking-widest text-blue-500 mb-2">Pro Mastery</h3>
                                            <div className="text-3xl font-black mb-4">â‚¹199</div>
                                            <ul className="space-y-2 mb-6">
                                                <li className="text-xs flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                                                    <Sparkles className="w-3 h-3 text-blue-500" /> 1500 Credits
                                                </li>
                                                <li className="text-xs flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium">
                                                    <Sparkles className="w-3 h-3 text-blue-500" /> Priority Support
                                                </li>
                                            </ul>
                                        </div>
                                        <button onClick={() => handleBuyCredits(199, 'pro')} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                                            Go Pro Now
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-[10px] text-neutral-400 font-medium">
                                        Daily free credits reset in <span className="text-blue-500 font-bold">{timeLeft}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Support & Feedback Section */}
                <SupportSection userData={userData} />
            </div>
        </div>
    );
}

// â”€â”€â”€ SUPPORT SECTION COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SupportSection({ userData }: { userData: any }) {
    const [activeTab, setActiveTab] = React.useState<'feedback'|'help'|'model_request'|'my_tickets'>('feedback');
    const [message, setMessage] = React.useState('');
    const [modelName, setModelName] = React.useState('');
    const [modelUrl, setModelUrl] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const [submitMsg, setSubmitMsg] = React.useState('');
    const [tickets, setTickets] = React.useState<any[]>([]);
    const [loadingTickets, setLoadingTickets] = React.useState(false);

    const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
            const res = await fetch('/api/v1/support/my-tickets', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTickets(data);
        } catch {} finally { setLoadingTickets(false); }
    };

    React.useEffect(() => { if (activeTab === 'my_tickets') fetchTickets(); }, [activeTab]);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setSubmitting(true);
        setSubmitMsg('');
        try {
            const res = await fetch('/api/v1/support/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ type: activeTab, message, modelName, modelUrl })
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitMsg('Submitted! We will get back to you soon.');
                setMessage(''); setModelName(''); setModelUrl('');
            } else {
                setSubmitMsg(`Error: ${data.error}`);
            }
        } catch { setSubmitMsg('Failed to submit. Try again.'); } 
        finally { setSubmitting(false); }
    };

    const TABS = [
        { key: 'feedback' as const, label: 'Feedback', Icon: MessageCircle, color: 'blue' },
        { key: 'help' as const, label: 'Get Help', Icon: HelpCircle, color: 'emerald' },
        { key: 'model_request' as const, label: 'Request Model', Icon: Cpu, color: 'violet' },
        { key: 'my_tickets' as const, label: 'My Tickets', Icon: ClipboardList, color: 'neutral' },
    ];

    const tabColor: Record<string, string> = {
        blue: 'bg-blue-600 text-white', emerald: 'bg-emerald-600 text-white',
        violet: 'bg-violet-600 text-white', neutral: 'bg-neutral-700 text-white'
    };
    const tabBorder: Record<string, string> = {
        blue: 'border-blue-500/30', emerald: 'border-emerald-500/30',
        violet: 'border-violet-500/30', neutral: 'border-neutral-500/30'
    };

    const activeColor = TABS.find(t => t.key === activeTab)?.color || 'blue';

    return (
        <div className="mt-8 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Support & Feedback</h3>
                    {userData?.plan === 'admin' && (
                        <a href="/admin" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">Admin Dashboard <ArrowRight className="w-3 h-3" /></a>
                    )}
                </div>
                <p className="text-xs text-neutral-500 font-medium">Have a question, feedback, or want a new AI model? Let us know.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/5 dark:border-white/5 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 flex-none px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.key ? `${tabColor[tab.color]} border-transparent` : 'text-neutral-500 border-transparent hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                        <tab.Icon className="w-3 h-3" />{tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                {activeTab === 'my_tickets' ? (
                    <div className="space-y-4">
                        {loadingTickets ? (
                            <div className="text-center py-8 text-neutral-400 text-xs">Loading...</div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-8 text-neutral-400 text-xs">No tickets yet. Submit a request above!</div>
                        ) : tickets.map((t, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${t.status === 'replied' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.type === 'feedback' ? 'bg-blue-500/10 text-blue-500' : t.type === 'help' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>{t.type.replace('_', ' ')}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${t.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-500'}`}>{t.status}</span>
                                    <span className="text-[9px] text-neutral-400 ml-auto">{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">{t.message}</p>
                                {t.adminReply && (
                                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Admin Reply</p>
                                        <p className="text-xs text-neutral-700 dark:text-neutral-300">{t.adminReply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'model_request' && (
                            <>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 block mb-1.5">Model Name *</label>
                                    <input value={modelName} onChange={e => setModelName(e.target.value)} placeholder="e.g. Claude 3.5 Sonnet, Grok 2..."
                                        className="w-full bg-neutral-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 block mb-1.5">Model URL (optional)</label>
                                    <input value={modelUrl} onChange={e => setModelUrl(e.target.value)} placeholder="https://..."
                                        className="w-full bg-neutral-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all" />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1 block mb-1.5">
                                {activeTab === 'feedback' ? 'Your Feedback *' : activeTab === 'help' ? 'Describe Your Issue *' : 'Why do you want this model? *'}
                            </label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                                placeholder={activeTab === 'feedback' ? 'Tell us what you love or what could be better...' : activeTab === 'help' ? 'Describe the problem you\'re facing in detail...' : 'How would this model benefit you?'}
                                className="w-full bg-neutral-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-all resize-none" />
                        </div>
                        {submitMsg && (
                            <div className={`p-3 rounded-xl text-xs font-medium ${submitMsg.startsWith('âœ…') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>{submitMsg}</div>
                        )}
                        <button onClick={handleSubmit} disabled={submitting || !message.trim()}
                            className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40 ${tabColor[activeColor]}`}>
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
