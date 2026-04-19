"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, MessageCircle, HelpCircle, Cpu, CheckCheck,
  Clock, ArrowLeft, Send, RefreshCw, ChevronDown, ChevronUp, X
} from "lucide-react";

const ADMIN_EMAIL = "goyalvishal7711@gmail.com";

export default function AdminDashboard() {
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const rawUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        
        if (!token || !rawUser) {
            router.push("/login");
            return;
        }
        
        const user = JSON.parse(rawUser);
        // Allow if email matches OR role/plan is admin
        const isAdmin = user.email === ADMIN_EMAIL || user.role === 'admin' || user.plan === 'admin';
        if (!isAdmin) {
            router.push("/");
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, ticketsRes] = await Promise.all([
                fetch("/api/v1/support/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("/api/v1/support/admin/all", { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const statsData = await statsRes.json();
            const ticketsData = await ticketsRes.json();
            if (statsRes.ok) setStats(statsData);
            if (ticketsRes.ok && Array.isArray(ticketsData)) setTickets(ticketsData);
        } catch (e) {
            setMessage("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchFiltered = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterType !== "all") params.set("type", filterType);
            if (filterStatus !== "all") params.set("status", filterStatus);
            const res = await fetch(`/api/v1/support/admin/all?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setTickets(data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchFiltered(); }, [filterType, filterStatus]);

    const sendReply = async (ticketId: string) => {
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            const res = await fetch(`/api/v1/support/admin/reply/${ticketId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ reply: replyText })
            });
            const data = await res.json();
            if (res.ok) {
                setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, adminReply: replyText, status: "replied" } : t));
                setReplyingTo(null);
                setReplyText("");
                setMessage("✅ Reply sent!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } finally { setSendingReply(false); }
    };

    const updateStatus = async (ticketId: string, status: string) => {
        await fetch(`/api/v1/support/admin/status/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status } : t));
    };

    const typeIcon: Record<string, React.ReactNode> = {
        feedback: <MessageCircle className="w-4 h-4 text-blue-500" />,
        help: <HelpCircle className="w-4 h-4 text-emerald-500" />,
        model_request: <Cpu className="w-4 h-4 text-violet-500" />,
    };

    const typeBadge: Record<string, string> = {
        feedback: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        help: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        model_request: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    };

    const statusBadge: Record<string, string> = {
        open: "bg-amber-500/10 text-amber-500",
        replied: "bg-emerald-500/10 text-emerald-500",
        resolved: "bg-neutral-500/10 text-neutral-500",
    };

    return (
        <div className="min-h-screen bg-[#08080a] text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/profile")} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-widest">Admin Dashboard</h1>
                            <p className="text-[10px] text-neutral-500">AIFusion Neural Core</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {message && (
                            <span className={`text-xs font-medium px-3 py-1.5 rounded-xl ${message.startsWith("✅") ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{message}</span>
                        )}
                        <button onClick={fetchData} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                            <RefreshCw className="w-4 h-4 text-neutral-400" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: "Total Tickets", value: stats.total, color: "blue" },
                        { label: "Open", value: stats.open, color: "amber" },
                        { label: "Feedback", value: stats.feedback, color: "blue" },
                        { label: "Help Requests", value: stats.help, color: "emerald" },
                        { label: "Model Requests", value: stats.modelRequests, color: "violet" },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <div className={`text-2xl font-black mb-1 ${s.color === "amber" ? "text-amber-500" : s.color === "emerald" ? "text-emerald-500" : s.color === "violet" ? "text-violet-500" : "text-blue-500"}`}>{s.value ?? "—"}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
                        {["all", "feedback", "help", "model_request"].map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === t ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`}>
                                {t.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
                        {["all", "open", "replied", "resolved"].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-white"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="text-center py-20 text-neutral-500">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-widest text-sm">No tickets found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div key={ticket._id} className={`bg-white/5 border rounded-3xl overflow-hidden transition-all ${ticket.status === "open" ? "border-amber-500/20" : ticket.status === "replied" ? "border-emerald-500/20" : "border-white/10"}`}>
                                {/* Ticket Header */}
                                <div className="p-5 flex items-start gap-4">
                                    <div className="flex-shrink-0 mt-0.5">{typeIcon[ticket.type]}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${typeBadge[ticket.type]}`}>{ticket.type.replace("_", " ")}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusBadge[ticket.status]}`}>{ticket.status}</span>
                                            <span className="text-[10px] text-neutral-500 font-medium">{ticket.userEmail}</span>
                                            <span className="text-[9px] text-neutral-600 ml-auto">{new Date(ticket.createdAt).toLocaleString()}</span>
                                        </div>
                                        {ticket.modelName && <p className="text-xs font-black text-violet-400 mb-1">Model: {ticket.modelName} {ticket.modelUrl && <a href={ticket.modelUrl} target="_blank" className="underline opacity-60 font-normal">{ticket.modelUrl}</a>}</p>}
                                        <p className="text-sm text-neutral-300 font-medium leading-relaxed">{ticket.message}</p>
                                        {ticket.adminReply && (
                                            <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Your Reply — {ticket.repliedAt ? new Date(ticket.repliedAt).toLocaleDateString() : ""}</p>
                                                <p className="text-xs text-neutral-300">{ticket.adminReply}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <select value={ticket.status} onChange={e => updateStatus(ticket._id, e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-[10px] font-black uppercase text-neutral-400 outline-none">
                                            <option value="open">Open</option>
                                            <option value="replied">Replied</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                        {ticket.type === "help" && (
                                            <button onClick={() => { setReplyingTo(ticket._id === replyingTo ? null : ticket._id); setReplyText(ticket.adminReply || ""); }}
                                                className="p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 transition-all">
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Reply Box */}
                                {replyingTo === ticket._id && (
                                    <div className="px-5 pb-5 border-t border-white/5 pt-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-2">Reply to {ticket.userEmail}</label>
                                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                                            placeholder="Type your reply here... The user will see it in their My Tickets tab."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500/40 transition-all resize-none text-neutral-200" />
                                        <div className="flex items-center gap-3 mt-3">
                                            <button onClick={() => sendReply(ticket._id)} disabled={sendingReply || !replyText.trim()}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40">
                                                <Send className="w-3.5 h-3.5" /> {sendingReply ? "Sending..." : "Send Reply"}
                                            </button>
                                            <button onClick={() => setReplyingTo(null)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-neutral-400 transition-all">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
