"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import ResponseCard from "@/components/ResponseCard";
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Sun, Paperclip, X, ArrowUp, Zap, Mic, Volume2, Download, Book, Coins, LogOut, Sparkles, CreditCard, ShieldCheck, User, Clock, Plus, Image, PanelLeft, MessageSquare, HelpCircle, MessageCircle, Cpu, Layers, BarChart3, Settings } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import KnowledgeSection from '@/components/sections/KnowledgeSection';
import AnalyticsSection from '@/components/sections/AnalyticsSection';
import SettingsSection from '@/components/sections/SettingsSection';
import WorkflowSection from '@/components/sections/WorkflowSection';
import ChatForm from '@/components/ChatForm';
import MobileSidebar from '@/components/mobile/MobileSidebar';
import MobileKnowledge from '@/components/mobile/MobileKnowledge';
import MobileWorkflow from '@/components/mobile/MobileWorkflow';

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatHistory = {
  openai: Message[];
  deepseek: Message[];
  meta: Message[];
  gemini: Message[];
};

function NeuralCore() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- 🧊 CORE STATE ---
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [dailyCredits, setDailyCredits] = useState<number>(0);
  const [plan, setPlan] = useState<string>("free");
  const [timeLeft, setTimeLeft] = useState("");
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentTool, setCurrentTool] = useState<'chat' | 'knowledge' | 'workflows' | 'analytics' | 'settings'>('chat');
  
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [history, setHistory] = useState<ChatHistory>({
    openai: [], deepseek: [], meta: [], gemini: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(["openai", "deepseek", "meta", "gemini"]);
  const [imageMode, setImageMode] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [smartMode, setSmartMode] = useState<string>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sources, setSources] = useState<{ title: string; url: string; snippet: string }[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const [showModelRequestModal, setShowModelRequestModal] = useState(false);
  const [modelReqName, setModelReqName] = useState('');
  const [modelReqMsg, setModelReqMsg] = useState('');
  const [modelReqStatus, setModelReqStatus] = useState('');
  const [modelReqLoading, setModelReqLoading] = useState(false);
  
  const [debateResults, setDebateResults] = useState<Record<string,any>>({});
  const [debateLoading, setDebateLoading] = useState(false);
  const [showDebate, setShowDebate] = useState(false);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [resolvedDebate, setResolvedDebate] = useState<string | null>(null);
  const [resolvingDebate, setResolvingDebate] = useState(false);
  const [useKnowledge, setUseKnowledge] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);

  const [liveData, setLiveData] = useState({
    bestModel: 'OpenAI',
    bestScore: '94%',
    fastestModel: 'DeepSeek',
    fastestTime: '0.8s',
    avgAgreement: '88%'
  });

  // --- 🔄 INITIALIZATION & EFFECTS ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        router.push("/login");
        return;
    }
    fetchUserData();
    fetchChatHistory();
    setMounted(true);
  }, []);

  useEffect(() => {
    const chatId = searchParams.get('chatId');
    if (chatId && chatHistory.length > 0) {
        const targetChat = chatHistory.find((c: any) => c._id === chatId);
        if (targetChat) {
            loadPreviousChat(targetChat);
            router.replace('/');
        }
    }
  }, [searchParams, chatHistory]);

  useEffect(() => {
    const timer = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diff = tomorrow.getTime() - now.getTime();
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        const models = ['OpenAI', 'DeepSeek', 'Gemini', 'Meta'];
        setLiveData({
            bestModel: models[Math.floor(Math.random() * models.length)],
            bestScore: (90 + Math.random() * 8).toFixed(1) + '%',
            fastestModel: models[Math.floor(Math.random() * models.length)],
            fastestTime: (0.5 + Math.random() * 1).toFixed(1) + 's',
            avgAgreement: (75 + Math.random() * 20).toFixed(0) + '%'
        });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 🛠️ FUNCTIONS ---
  const fetchUserData = async () => {
    try {
        const res = await fetch("/api/v1/user/me", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (data.email) {
            setUser(data);
            setTokens(data.credits || 0);
            setDailyCredits(data.dailyFreeCredits || 0);
            setPlan(data.plan || "free");
        } else {
            router.push("/login");
        }
    } catch (err) {
        console.error("Auth Error:", err);
    }
  };

  const fetchChatHistory = async () => {
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

  const loadPreviousChat = (chat: any) => {
    const h: ChatHistory = { openai: [], deepseek: [], meta: [], gemini: [] };
    if (chat.prompt) {
      ["openai","deepseek","meta","gemini"].forEach(m => {
        h[m as keyof ChatHistory] = [
          { role: "user", content: chat.prompt },
          { role: "assistant", content: chat.responses?.[m]?.text || "" }
        ];
      });
    }
    setHistory(h);
    setAnalysis(chat.analysis || { consensus: chat.consensus, bestModel: chat.bestModel, ultimateSynthesis: chat.ultimateSynthesis });
    setChatId(chat._id || chat.id);
    setHasStartedChat(true);
    setCurrentTool('chat');
    setSidebarOpen(false);
  };

  const startNewChat = () => {
    setHistory({ openai: [], deepseek: [], meta: [], gemini: [] });
    setChatId(null);
    setAnalysis(null);
    setHasStartedChat(false);
    setCurrentTool('chat');
  };

  const submitModelRequest = async () => {
    if (!modelReqName.trim() || !modelReqMsg.trim()) return;
    setModelReqLoading(true);
    try {
      const res = await fetch('/api/v1/support/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ type: 'model_request', message: modelReqMsg, modelName: modelReqName })
      });
      if (res.ok) {
        setModelReqStatus('success');
        setModelReqName(''); setModelReqMsg('');
        setTimeout(() => { setShowModelRequestModal(false); setModelReqStatus(''); }, 2000);
      } else { setModelReqStatus('error'); }
    } catch { setModelReqStatus('error'); }
    finally { setModelReqLoading(false); }
  };

  const handleOptimizePrompt = async () => {
    if (!input.trim()) return;
    try {
        const res = await fetch("/api/v1/optimize", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ prompt: input })
        });
        const data = await res.json();
        if (data.optimized) setInput(data.optimized);
    } catch (e) { console.error(e); }
  };

  const startNewChat = () => {
    setHistory({ openai: [], deepseek: [], meta: [], gemini: [] });
    setAnalysis(null);
    setMetrics({});
    setHasStartedChat(false);
    setInput("");
    setFiles([]);
    setImageMode(false);
    setSearchMode(false);
    setDebateResults({});
    setShowDebate(false);
  };

  const handleDebate = async () => {
    setDebateLoading(true);
    setShowDebate(true);
    try {
      const responses: Record<string,string> = {};
      const lastPrompt = history.openai?.findLast((m: any) => m.role === 'user')?.content || '';
      (['openai','deepseek','meta','gemini'] as const).forEach(m => {
        const last = history[m]?.findLast((msg: any) => msg.role === 'assistant');
        if (last) responses[m] = last.content as string;
      });
      const res = await fetch('/api/v1/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ responses, originalPrompt: lastPrompt })
      });
      const data = await res.json();
      if (data.debate) setDebateResults(data.debate);
    } catch (e) {
      console.error('Debate failed', e);
    } finally {
      setDebateLoading(false);
    }
  };

  const handleResolveDebate = async () => {
    if (!analysis) return;
    setResolvingDebate(true);
    try {
      const lastPrompt = history.openai?.findLast((m: any) => m.role === 'user')?.content || '';
      const res = await fetch('/api/resolve-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ prompt: lastPrompt, results: metrics })
      });
      const data = await res.json();
      if (data.resolution) setResolvedDebate(data.resolution);
    } catch (e) {
      console.error('Resolution failed', e);
    } finally {
      setResolvingDebate(false);
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
            key: "rzp_test_placeholder",
            amount: order.amount,
            currency: order.currency,
            name: "AIFusion Pro",
            description: `${type.toUpperCase()} Credit Refuel`,
            order_id: order.id,
            handler: async (response: any) => {
                const verifyRes = await fetch("/api/v1/payment/verify", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ ...response, planType: type })
                });
                const verifyData = await verifyRes.json();
                if (verifyData.status === 'ok') {
                    alert("Credits added successfully!");
                    setTokens(verifyData.credits);
                    setPlan(verifyData.plan);
                    setShowCreditModal(false);
                }
            },
            prefill: { email: user?.email },
            theme: { color: "#3b82f6" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (err) {
        console.error("Payment Error:", err);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    recognition.start();
  };

  const handleDownloadChat = () => {
    let content = "# AIFusion Conversation Export\n\n";
    ["openai", "deepseek", "meta", "gemini"].forEach(model => {
      if (history[model as keyof ChatHistory].length > 0) {
        content += `## ${model.toUpperCase()} History\n\n`;
        history[model as keyof ChatHistory].forEach(msg => {
          content += `**${msg.role.toUpperCase()}**: ${msg.content}\n\n`;
        });
        content += "---\n\n";
      }
    });
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aifusion-chat-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
  };

  const templates = [
    { title: "Code Auditor", prompt: "Please audit this code for security vulnerabilities and performance bottlenecks: " },
    { title: "Creative Writer", prompt: "Write a compelling story about: " },
    { title: "Legal Reviewer", prompt: "Analyze this document for potential legal risks: " },
    { title: "Strategic Planner", prompt: "Create a 5-year business strategy for: " }
  ];

  const handleSolo = (id: string) => { setSelectedModels([id]); };

  const toggleModel = (id: string) => {
    if (id === "all") {
      setSelectedModels(["openai", "deepseek", "meta", "gemini"]);
      return;
    }
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleEditMessage = async (model: string, index: number, newContent: string) => {
    const truncated = history[model as keyof ChatHistory].slice(0, index);
    setHistory(prev => ({ ...prev, [model]: truncated }));
    handleChatSend(newContent, [model]);
  };

  const handleChatSend = async (chatInput: string, forceModels?: string[], forceImageMode?: boolean, forceSearchMode?: boolean) => {
    let finalInput = chatInput;
    if (!finalInput.trim() && files.length === 0) return;
    let finalSelected = forceModels || [...selectedModels];
    if (!forceModels && chatInput.includes("@")) {
      const match = chatInput.match(/@(openai|deepseek|meta|gemini)/i);
      if (match) {
        finalSelected = [match[1].toLowerCase()];
        finalInput = chatInput.replace(match[0], "").trim();
      }
    }
    const currentImageMode = forceImageMode !== undefined ? forceImageMode : imageMode;
    const currentSearchMode = forceSearchMode !== undefined ? forceSearchMode : searchMode;
    const estimatedCost = finalSelected.length * 4;
    const totalPossibleCredits = tokens + dailyCredits;
    if (totalPossibleCredits < estimatedCost) {
        alert(`Insufficient credits! You need ${estimatedCost} tokens. You have ${totalPossibleCredits}.`);
        return;
    }
    setInput(""); setHasStartedChat(true); setLoading(true); setLoadingModels(finalSelected); setAnalysis(null);
    const resultsAccumulator: Record<string, any> = {};
    const modelPromises = finalSelected.map(async (model) => {
      try {
        const updatedHistory = { ...history };
        updatedHistory[model as keyof ChatHistory] = [...history[model as keyof ChatHistory], { role: "user", content: finalInput }];
        const formData = new FormData();
        formData.append("chatHistory", JSON.stringify(updatedHistory));
        formData.append("bypassModels", JSON.stringify(["openai", "deepseek", "meta", "gemini"].filter(m => m !== model)));
        formData.append("imageMode", currentImageMode.toString());
        formData.append("searchMode", currentSearchMode.toString());
        formData.append("smartMode", smartMode);
        files.forEach(f => formData.append("files", f));
        const res = await fetch("/api/v1/chat", {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        });
        const data = await res.json();
        setLoading(false); setSources(data.sources || []); setUserVote(null);
        if (data.error) throw new Error(data.error);
        resultsAccumulator[model] = data[model];
        setHistory(prev => ({ ...prev, [model]: [...prev[model as keyof ChatHistory], { role: "user", content: finalInput }, { role: "assistant", content: data[model].text }] }));
        setMetrics(prev => ({ ...prev, [model]: data[model] }));
        if (data.remainingCredits !== undefined) setTokens(data.remainingCredits);
        if (data.chatId) setChatId(data.chatId);
        
        // --- 🧠 AUTO-TITLE GENERATION ---
        if (!chatId && data.chatId && history[model as keyof ChatHistory].length === 0) {
            try {
                fetch("/api/v1/chat/title", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ prompt: finalInput, chatId: data.chatId })
                }).then(() => fetchChatHistory());
            } catch (err) { console.error("Auto-title failed", err); }
        }
        
        return { model, data: data[model] };
      } catch (err: any) {
        console.error(`Error loading ${model}:`, err);
        return { model, error: err.message };
      } finally { setLoadingModels(prev => prev.filter(m => m !== model)); }
    });
    Promise.all(modelPromises).then(async (results) => {
      setLoading(false); setFiles([]);
      const validResults = results.filter(r => r.data && r.data.status === 'success');
      if (validResults.length > 0) {
        try {
          const analysisRes = await fetch("/api/v1/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify({ prompt: finalInput, results: resultsAccumulator }),
          });
          const analysisData = await analysisRes.json();
          if (analysisData.analysis) setAnalysis(analysisData.analysis);
        } catch (anaErr) { console.error("Analysis failed:", anaErr); }
      }
    });
  };

  const logout = async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await signOut({ redirect: false });
      router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className="h-screen w-full flex bg-[#fafafa] dark:bg-[#080809] text-neutral-900 dark:text-neutral-100 transition-colors duration-500 relative overflow-hidden">

      {/* --- 📟 MOBILE NAVIGATION --- */}
      {isMobile && (
          <MobileSidebar 
              activeSection={currentTool} 
              setActiveSection={(s: any) => setCurrentTool(s)} 
              credits={tokens + dailyCredits} 
          />
      )}

      {/* --- 🛠️ DYNAMIC DESKTOP SIDEBAR --- */}
      {!isMobile && (
        <div 
          className={`fixed left-0 top-0 bottom-0 z-[60] flex transition-all duration-500 ease-in-out group/sidebar ${
            (sidebarPinned || sidebarHovered) ? 'w-72' : 'w-20'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-white dark:bg-[#0c0c0e] border-r border-black/5 dark:border-white/10 shadow-2xl flex flex-col`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
        <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 flex-none">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
               <Zap className="w-5 h-5 text-white" />
            </div>
            {(sidebarPinned || sidebarHovered) && (
              <h2 className="text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-300">Neural Core</h2>
            )}
          </div>
          <button 
            onClick={() => setSidebarPinned(!sidebarPinned)} 
            className={`p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-all ${(sidebarPinned || sidebarHovered) ? 'opacity-100' : 'opacity-0'}`}
          >
            <PanelLeft className={`w-4 h-4 ${sidebarPinned ? 'text-blue-600' : 'text-neutral-400'}`} />
          </button>
        </div>
        
        <div className="px-4 pt-6 space-y-2 flex-none">
          {[
            { id: 'chat', label: 'Neural Chat', icon: <MessageSquare className="w-5 h-5" /> },
            { id: 'knowledge', label: 'Knowledge Base', icon: <Book className="w-5 h-5" /> },
            { id: 'workflows', label: 'AI Workflows', icon: <Layers className="w-5 h-5" /> },
            { id: 'analytics', label: 'Usage Analytics', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'settings', label: 'Power Settings', icon: <Settings className="w-5 h-5" /> }
          ].map(tool => (
            <button 
              key={tool.id} 
              onClick={() => { setCurrentTool(tool.id as any); if (tool.id === 'chat') setHasStartedChat(false); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                currentTool === tool.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex-shrink-0">{tool.icon}</div>
              {(sidebarPinned || sidebarHovered) && (
                <span className="text-xs font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{tool.label}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mx-4 my-6 h-[1px] bg-black/5 dark:bg-white/5 flex-none" />

        <div className="px-4 flex-none">
          <button 
            onClick={() => { startNewChat(); setCurrentTool('chat'); }} 
            className={`flex items-center justify-center gap-3 w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl transition-all duration-300 hover:opacity-90 active:scale-95`}
          >
            <Plus className="w-5 h-5" />
            {(sidebarPinned || sidebarHovered) && (
              <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300">New Session</span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
          {(sidebarPinned || sidebarHovered) && chatHistory.length > 0 && (
            <div className="animate-in fade-in duration-500">
               <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-3 mb-4">Recent History</p>
               <div className="space-y-2">
                 {chatHistory.map((chat: any, i: number) => (
                   <button 
                     key={i} 
                     onClick={() => loadPreviousChat(chat)} 
                     className="w-full text-left p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all group"
                   >
                     <div className="flex items-center gap-3 mb-2">
                       {chat.imageMode ? <Image className="w-3.5 h-3.5 text-amber-500" /> : <MessageSquare className="w-3.5 h-3.5 text-blue-500" />}
                       <span className="text-[9px] font-black uppercase text-neutral-400">{new Date(chat.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 truncate">{chat.title || chat.prompt}</p>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
        
        <div className="mt-auto p-4 border-t border-black/5 dark:border-white/5 space-y-2 flex-none">
          <div className={`flex items-center ${ (sidebarPinned || sidebarHovered) ? 'justify-between px-3' : 'justify-center' } py-2`}>
             {(sidebarPinned || sidebarHovered) && (
               <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase text-neutral-400 tracking-widest">System Credit</span>
                  <span className="text-xs font-black text-blue-600">{tokens + dailyCredits}</span>
               </div>
             )}
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:scale-110 transition-all shadow-sm">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
          </div>
          {(sidebarPinned || sidebarHovered) && (
            <>
              <button onClick={() => { router.push("/profile"); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-neutral-200">
                  <User className="w-4 h-4" /> Account Pro
              </button>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500/20">
                  <LogOut className="w-4 h-4" /> Exit
              </button>
            </>
          )}
        </div>
      </div>
    )}

      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ease-in-out ${ !isMobile ? ((sidebarPinned || sidebarHovered) ? 'pl-72' : 'pl-20') : '' }`}>
        <header className="flex-none z-50 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/5">
          <div className="max-w-[98%] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
               <div className="hidden sm:flex items-center bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                       <div className="flex items-center gap-5">
                           <div className="flex flex-col items-start">
                               <span className="text-[7px] font-black uppercase text-neutral-400 tracking-wider mb-0.5">Streak</span>
                               <div className="flex items-center gap-1.5">
                                   <Zap className="w-3.5 h-3.5 text-blue-500" />
                                   <span className="text-xs font-black">{user?.streak || 0}</span>
                               </div>
                           </div>
                           <div className="flex flex-col items-start pr-5 border-r border-black/5 dark:border-white/10">
                               <span className="text-[7px] font-black uppercase text-neutral-400 tracking-wider mb-0.5">Credits</span>
                               <div className="flex items-center gap-2">
                                   <Coins className="w-3.5 h-3.5 text-amber-500" />
                                   <span className="text-xs font-black">{tokens + dailyCredits}</span>
                                   <span className="text-[9px] font-bold text-neutral-400 opacity-60">({Math.floor((tokens + dailyCredits) / 5)} prompts)</span>
                               </div>
                           </div>
                           <div className="flex flex-col items-start">
                               <span className="text-[7px] font-black uppercase text-neutral-400 tracking-wider mb-0.5">Reset</span>
                               <div className="flex items-center gap-1.5">
                                   <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                   <span className="text-[10px] font-bold font-mono opacity-60">{timeLeft}</span>
                               </div>
                           </div>
                       </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 group cursor-pointer sm:absolute sm:left-1/2 sm:-translate-x-1/2" onClick={() => { setCurrentTool('chat'); setHasStartedChat(false); }}>
               <h1 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2.5">
                  <Zap className="w-6 h-6 text-blue-600 fill-blue-600/20" />
                  AI<span className="text-blue-600">Fusion</span>
               </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className={`p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/10 transition-all ${sidebarOpen ? 'hidden' : 'flex'}`}>
                <PanelLeft className="w-4 h-4" />
              </button>
              <div className="mx-1 w-[1px] h-4 bg-black/5 dark:bg-white/10" />
              
              {currentTool !== 'chat' && (
                <button onClick={() => setCurrentTool('chat')} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                  <MessageSquare className="w-3.5 h-3.5" /> Back to Chat
                </button>
              )}

              <button onClick={() => setShowModelRequestModal(true)} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-violet-500/10 text-violet-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all border border-violet-500/20">
                <Cpu className="w-3.5 h-3.5" /> Request Model
              </button>
            {hasStartedChat && (
              <button onClick={startNewChat} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-white/10 transition-all">
                <Plus className="w-3.5 h-3.5" /> New Chat
              </button>
            )}
            {hasStartedChat && (
              <button onClick={handleDownloadChat} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hidden sm:flex p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:scale-105 transition-transform">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => router.push("/profile")} className="hidden sm:flex p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:scale-105 transition-transform group">
              <User className="w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
            </button>
            <button onClick={logout} className="hidden sm:flex p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {currentTool === 'knowledge' && (isMobile ? <MobileKnowledge /> : <KnowledgeSection />)}
          {currentTool === 'analytics' && <AnalyticsSection />}
          {currentTool === 'settings' && <SettingsSection />}
          {currentTool === 'workflows' && (isMobile ? <MobileWorkflow /> : <WorkflowSection />)}
          
          {currentTool === 'chat' && (
            <>
              {!hasStartedChat ? (
              <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 animate-in fade-in duration-1000">
                  <div className="max-w-3xl w-full text-center">
                      <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tightest mb-4 bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent px-4">
                          Universal AI Intelligence.
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-lg mb-6 sm:mb-8 font-medium px-6">Compare the world&apos;s most powerful models in one single interface.</p>


                      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                          {["openai", "deepseek", "meta", "gemini"].map((m) => (
                              <button
                                key={m}
                                onClick={() => toggleModel(m)}
                                className={`px-5 py-2.5 rounded-[20px] text-xs font-black transition-all border ${
                                    selectedModels.includes(m) 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105" 
                                    : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20"
                                } ${smartMode !== 'general' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={smartMode !== 'general'}
                              >
                                  {m.toUpperCase()}
                              </button>
                          ))}
                      </div>

                      <div className="mb-8 flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Select Intelligence Mode</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            { id: 'general', label: 'General', icon: <Zap className="w-3 h-3" /> },
                            { id: 'coding', label: 'Code Editor', icon: <Cpu className="w-3 h-3" /> },
                            { id: 'writing', label: 'Creative Writer', icon: <Sparkles className="w-3 h-3" /> },
                            { id: 'research', label: 'Researcher', icon: <Book className="w-3 h-3" /> },
                            { id: 'legal', label: 'Legal Reviewer', icon: <ShieldCheck className="w-3 h-3" /> },
                          ].map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSmartMode(m.id);
                                if (m.id === 'coding') setSelectedModels(['openai', 'deepseek']);
                                else if (m.id === 'writing') setSelectedModels(['openai', 'gemini']);
                                else if (m.id === 'research') setSelectedModels(['gemini', 'meta']);
                                else if (m.id === 'legal') setSelectedModels(['openai', 'gemini']);
                                else setSelectedModels(['openai', 'deepseek', 'meta', 'gemini']);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                smartMode === m.id 
                                ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20" 
                                : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300"
                              }`}
                            >
                              {m.icon}
                              {m.label}
                            </button>
                          ))}
                        </div>
                        {smartMode !== 'general' && (
                          <p className="text-[9px] text-violet-500 font-bold mt-3 uppercase tracking-tighter animate-pulse">
                            ✨ Smart Mode Active: Optimized for {smartMode}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-center gap-2 mb-6 animate-in slide-in-from-top-4 duration-700 delay-200">
                          {templates.map((t, i) => (
                              <button 
                                key={i}
                                onClick={() => setInput(t.prompt)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl text-[10px] font-bold hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm group"
                              >
                                 <Book className="w-3 h-3 text-blue-500 group-hover:text-white" />
                                 {t.title}
                              </button>
                          ))}
                      </div>

                      <ChatForm 
                        onSend={(input, imageMode, searchMode, models) => {
                            setImageMode(imageMode);
                            setSearchMode(searchMode);
                            setSelectedModels(models);
                            handleChatSend(input, models, imageMode, searchMode);
                        }}
                        loading={loading}
                        dailyCredits={dailyCredits}
                        tokens={tokens}
                      />

                      <div className="mt-16 pb-12 flex flex-col items-center gap-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Powered by Neural Core Engines</p>
                        <div className="flex items-center justify-center gap-12 opacity-80 hover:opacity-100 transition-all duration-700 hover:scale-105">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" className="h-10 hover:scale-110 transition-all drop-shadow-md" alt="openai" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" className="h-10 hover:scale-110 transition-all drop-shadow-md" alt="gemini" />
                            <img src="https://www.deepseek.com/favicon.ico" className="h-10 hover:scale-110 transition-all drop-shadow-md" alt="deepseek" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" className="h-8 hover:scale-110 transition-all drop-shadow-md" alt="meta" />
                        </div>
                      </div>
                  </div>
                  </div>
              ) : (
              <div className="h-full overflow-y-auto custom-scrollbar px-6 py-8 pb-40">
                  <div className="max-w-[1600px] mx-auto">
                    {analysis && (
                      <div className="max-w-[98%] mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-white/80 dark:bg-[#0c0c0e] backdrop-blur-2xl border border-blue-500/30 rounded-[32px] p-5 sm:p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">🧠 AI Fusion Answer</h3>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Unified Multi-Agent Consensus</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${analysis.disagreement ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                            {analysis.disagreement ? <X className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {analysis.agreementPercentage}% models agree {analysis.disagreement ? '⚠️' : '✅'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="prose prose-sm dark:prose-invert max-w-none bg-neutral-50 dark:bg-white/5 p-6 rounded-[24px] border border-black/5 dark:border-white/5">
                                    <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed">
                                        {analysis.consensus || "Analyzing consensus..."}
                                    </p>
                                </div>
                                
                                {analysis.bestModel && (
                                    <div className="mt-6 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Winning Logic:</span>
                                             <span className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-tighter border border-blue-600/20">
                                                {analysis.bestModel}
                                             </span>
                                         </div>
                                         <p className="text-[10px] text-neutral-400 font-medium italic">"{analysis.bestReason || analysis.reason}"</p>
                                    </div>
                                )}

                                {analysis.disagreement && !resolvedDebate && (
                                     <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
                                         <button 
                                            onClick={handleResolveDebate}
                                            disabled={resolvingDebate}
                                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                                         >
                                            {resolvingDebate ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-3 h-3" />}
                                            Resolve Factual Conflict
                                         </button>
                                     </div>
                                 )}
                             </div>
                         </div>
                      </div>
                    )}

                    {resolvedDebate && (
                        <div className="max-w-[98%] mx-auto mb-12 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="bg-gradient-to-r from-red-600 to-orange-600 p-0.5 rounded-[32px]">
                                <div className="bg-white dark:bg-[#0c0c0e] rounded-[30px] p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-widest text-red-600">Final Resolution</h3>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">Supreme AI Arbiter Source of Truth</p>
                                        </div>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-neutral-700 dark:prose-p:text-neutral-300">
                                        <ReactMarkdown>{resolvedDebate}</ReactMarkdown>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    <div className={`grid gap-8 transition-all duration-700 ${
                        selectedModels.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
                        selectedModels.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto' :
                        selectedModels.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`}>
                        {["openai", "deepseek", "meta", "gemini"]
                            .map((model) => (
                             selectedModels.includes(model) && (
                                <ResponseCard
                                    key={model}
                                    modelName={model.charAt(0).toUpperCase() + model.slice(1)}
                                    provider={model as any}
                                    messages={history[model as keyof typeof history]}
                                    loading={loadingModels.includes(model)}
                                    onFocus={() => {}}
                                    onEditMessage={(index, content) => handleEditMessage(model, index, content)}
                                    isBest={analysis?.bestModel?.toLowerCase() === model}
                                    sources={model === 'openai' ? sources : []}
                                    onVote={(m) => setUserVote(m.toLowerCase())}
                                    userVote={userVote}
                                    onSolo={() => handleSolo(model)}
                                    cost={model === 'openai' ? 5 : model === 'gemini' ? 4 : 3}
                                 />
                             )
                        ))}
                    </div>

                    {hasStartedChat && !loading && !imageMode && (
                      <div className="mt-8 mb-4 flex justify-center">
                        {!showDebate ? (
                          <button onClick={handleDebate}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-105 active:scale-95 transition-all">
                            <MessageCircle className="w-4 h-4" />
                            Start AI Debate — Let Models Discuss Each Other
                          </button>
                        ) : (
                          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center"><MessageCircle className="w-4 h-4 text-white" /></div>
                              <div>
                                <h3 className="text-sm font-black uppercase tracking-widest">AI Debate Round</h3>
                                <p className="text-[10px] text-neutral-500">Each model reads the others and responds critically</p>
                              </div>
                              <button onClick={() => setShowDebate(false)} className="ml-auto p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5"><X className="w-3.5 h-3.5" /></button>
                            </div>
                            {debateLoading ? (
                              <div className="flex items-center justify-center gap-3 py-10 text-neutral-500">
                                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-black uppercase tracking-widest">Models are debating...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(['openai','deepseek','meta','gemini'] as const).map(model => debateResults[model]?.text && (
                                  <div key={model} className="bg-white dark:bg-white/5 border border-violet-500/20 rounded-3xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{model.toUpperCase()} says</span>
                                    </div>
                                     <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                       <ReactMarkdown>{debateResults[model].text}</ReactMarkdown>
                                     </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {hasStartedChat && !loading && (
                      <div className="mt-12 flex flex-col items-center gap-4 animate-in fade-in duration-1000">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Intelligent Next Steps</p>
                        <div className="flex flex-wrap justify-center gap-3">
                           {[
                             { label: 'Simplify This', icon: <Cpu className="w-3.5 h-3.5" />, prompt: 'Can you simplify this answer for a beginner?' },
                             { label: 'Explain Deeper', icon: <Sparkles className="w-3.5 h-3.5" />, prompt: 'Go deeper into the technical details and provide more examples.' },
                             { label: 'Convert to Notes', icon: <Book className="w-3.5 h-3.5" />, prompt: 'Convert this information into a structured set of study notes.' }
                           ].map((hook, i) => (
                             <button 
                                key={i}
                                onClick={() => handleChatSend(hook.prompt)}
                                className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm group"
                             >
                               {hook.icon}
                               {hook.label}
                             </button>
                           ))}
                        </div>
                      </div>
                    )}

                    {analysis?.ultimateSynthesis && (
                        <div className="mt-12 mb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                             <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-1 rounded-[40px] shadow-2xl shadow-blue-500/20">
                                <div className="bg-white dark:bg-[#0c0c0e] rounded-[38px] p-8 md:p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -mr-60 -mt-60" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                                                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">Ultimate Synthesis</h2>
                                                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mt-1">Unified Multi-Agent Intelligence</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        const blob = new Blob([analysis.ultimateSynthesis], { type: "text/markdown" });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement("a");
                                                        a.href = url;
                                                        a.download = `ultimate-synthesis-${new Date().toISOString().split('T')[0]}.md`;
                                                        a.click();
                                                    }}
                                                    className="px-6 py-3 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" /> Export Master
                                                </button>
                                            </div>
                                        </div>

                                        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-p:text-neutral-600 dark:prose-p:text-neutral-300 prose-p:leading-relaxed prose-strong:text-blue-500">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({node, ...props}) => <h1 className="text-3xl font-black mb-8 pb-4 border-b border-black/5 dark:border-white/5" {...props} />,
                                                    h2: ({node, ...props}) => <h2 className="text-2xl font-black mt-10 mb-6 text-blue-600 dark:text-blue-500" {...props} />,
                                                    blockquote: ({node, ...props}) => <blockquote className="border-l-8 border-blue-500/20 bg-blue-500/5 p-6 rounded-r-3xl italic" {...props} />
                                                }}
                                            >
                                                {analysis.ultimateSynthesis}
                                            </ReactMarkdown>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-4">
                                            <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                                Generated by GPT-4o Master
                                            </div>
                                            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                Verified Consensus
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                  </div>
              </div>
          )}
            </>
          )}
          
          {hasStartedChat && currentTool === 'chat' && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50/90 dark:from-[#09090b] dark:via-[#09090b]/90 z-40">
                  <div className="max-w-4xl mx-auto">
                      <ChatForm 
                        onSend={(input, imageMode, searchMode, models) => {
                            setImageMode(imageMode);
                            setSearchMode(searchMode);
                            setSelectedModels(models);
                            handleChatSend(input, models, imageMode, searchMode);
                        }}
                        loading={loading}
                        dailyCredits={dailyCredits}
                        tokens={tokens}
                      />
                  </div>
              </div>
          )}
      </main>
      </div>

      {/* --- 📟 MOBILE DRAWER --- */}
      {isMobile && sidebarOpen && (
          <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
              <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                  onClick={() => setSidebarOpen(false)} 
              />
              <div className="relative w-[80%] max-w-sm bg-white dark:bg-[#0c0c0e] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500">
                  <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6 text-blue-600" />
                          <span className="text-sm font-black uppercase tracking-widest">Memory Bank</span>
                      </div>
                      <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {chatHistory.length > 0 ? (
                          chatHistory.map((chat: any, i: number) => (
                              <button 
                                  key={i} 
                                  onClick={() => { loadPreviousChat(chat); setSidebarOpen(false); }} 
                                  className="w-full text-left p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 border border-black/5 dark:border-white/10 transition-all"
                              >
                                  <div className="flex items-center gap-2 mb-2">
                                      {chat.imageMode ? <Image className="w-3.5 h-3.5 text-amber-500" /> : <MessageSquare className="w-3.5 h-3.5 text-blue-500" />}
                                      <span className="text-[9px] font-black uppercase text-neutral-400">{new Date(chat.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs font-bold truncate">{chat.title || chat.prompt}</p>
                              </button>
                          ))
                      ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-40">
                              <MessageSquare className="w-10 h-10 mb-4" />
                              <p className="text-xs font-bold uppercase tracking-widest">No history yet</p>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-6 border-t border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-white/5 space-y-3">
                      <button 
                          onClick={() => { startNewChat(); setSidebarOpen(false); }} 
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                          + New Session
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                          <button 
                              onClick={() => { router.push("/profile"); setSidebarOpen(false); }}
                              className="flex items-center justify-center gap-2 py-3 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-white/10 transition-all"
                          >
                              <User className="w-3.5 h-3.5" /> Profile
                          </button>
                          <button 
                              onClick={() => { logout(); setSidebarOpen(false); }}
                              className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                          >
                              <LogOut className="w-3.5 h-3.5" /> Logout
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- 📟 MODALS --- */}
      {showCreditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-[40px] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden relative">
                  <button onClick={() => setShowCreditModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors">
                      <X className="w-5 h-5" />
                  </button>
                  <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                          <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-black tracking-tight mb-2">Refuel Neural Core</h2>
                      <p className="text-neutral-500 text-sm mb-8">Purchase energy tokens to continue your synthesis.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button onClick={() => handleBuyCredits(99, 'starter')} className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/50 transition-all group">
                              <span className="text-[10px] font-black uppercase text-neutral-400 block mb-1">Starter</span>
                              <span className="text-2xl font-black">₹99</span>
                              <span className="text-[10px] block text-blue-500 font-bold mt-2">500 Credits</span>
                          </button>
                          <button onClick={() => handleBuyCredits(199, 'pro')} className="p-6 rounded-3xl bg-blue-600/10 border-2 border-blue-600/30 hover:border-blue-600 transition-all">
                              <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">Pro Master</span>
                              <span className="text-2xl font-black">₹199</span>
                              <span className="text-[10px] block text-blue-600 font-bold mt-2">1500 Credits</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showModelRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-md rounded-[32px] border border-black/10 dark:border-white/10 shadow-2xl p-8 relative">
            <button onClick={() => setShowModelRequestModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-black uppercase tracking-widest mb-2">Request Model</h3>
            <p className="text-xs text-neutral-500 mb-6">Tell us which AI model you want to see in AIFusion.</p>
            <div className="space-y-4">
              <input value={modelReqName} onChange={e => setModelReqName(e.target.value)} placeholder="Model Name (e.g. Grok 2, Claude 3.5)" className="w-full bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500" />
              <textarea value={modelReqMsg} onChange={e => setModelReqMsg(e.target.value)} rows={4} placeholder="Why do you need this model?" className="w-full bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500 resize-none" />
              {modelReqStatus && <p className={`text-[10px] font-black uppercase text-center ${modelReqStatus === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{modelReqStatus === 'success' ? 'Request submitted!' : 'Submission failed.'}</p>}
              <button onClick={submitModelRequest} disabled={modelReqLoading || !modelReqName.trim()} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {modelReqLoading ? 'Submitting...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#fafafa] dark:bg-[#080809]"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <NeuralCore />
    </Suspense>
  );
}
