"use client";

import React, { useState, useRef, useEffect } from "react";
import ResponseCard from "@/components/ResponseCard";
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Sun, Paperclip, X, ArrowUp, Zap, Mic, Volume2, Download, Book, Coins, LogOut, Sparkles, CreditCard, ShieldCheck, User, Clock, Plus, Image, PanelLeft, MessageSquare, HelpCircle, MessageCircle, Cpu, Layers, BarChart3, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import KnowledgeSection from '@/components/sections/KnowledgeSection';
import AnalyticsSection from '@/components/sections/AnalyticsSection';
import SettingsSection from '@/components/sections/SettingsSection';

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

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [dailyCredits, setDailyCredits] = useState<number>(0);
  const [plan, setPlan] = useState<string>("free");
  const [timeLeft, setTimeLeft] = useState("");
  const [showCreditModal, setShowCreditModal] = useState(false);

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
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showModelRequestModal, setShowModelRequestModal] = useState(false);
  const [modelReqName, setModelReqName] = useState('');
  const [modelReqMsg, setModelReqMsg] = useState('');
  const [modelReqLoading, setModelReqLoading] = useState(false);
  const [modelReqStatus, setModelReqStatus] = useState<'success' | 'error' | ''>('');
  const [currentTool, setCurrentTool] = useState<'chat' | 'knowledge' | 'workflows' | 'analytics' | 'settings'>('chat');
  const [useKnowledge, setUseKnowledge] = useState(false);
  const [resolvingDebate, setResolvingDebate] = useState(false);
  const [resolvedDebate, setResolvedDebate] = useState<string | null>(null);

  const fetchChatHistory = async () => {
    try {
        const res = await fetch("/api/v1/user/chats", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setChatHistory(data);
    } catch (err) {
        console.error("Chat History Error:", err);
    }
  };

  const startNewChat = () => {
    setHasStartedChat(false);
    setHistory({ openai: [], deepseek: [], meta: [], gemini: [] });
    setAnalysis(null);
    setInput("");
    setFiles([]);
    setResolvedDebate(null);
  };

  const loadPreviousChat = (chat: any) => {
    setHistory(chat.history);
    setAnalysis(chat.analysis);
    setHasStartedChat(true);
    setCurrentTool('chat');
    setSidebarOpen(false);
  };

  const toggleModel = (model: string) => {
    if (model === 'all') {
      setSelectedModels(selectedModels.length === 4 ? [] : ["openai", "deepseek", "meta", "gemini"]);
      return;
    }
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter(m => m !== model));
    } else {
      setSelectedModels([...selectedModels, model]);
    }
  };

  const handleDownloadChat = () => {
      const chatContent = JSON.stringify({ history, analysis }, null, 2);
      const blob = new Blob([chatContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aifusion-chat-${new Date().getTime()}.json`;
      a.click();
  };

  const handleBuyCredits = async (amount: number, planName: string) => {
      // Implement Razorpay here
      alert(`Initiating ${planName} payment for Rs.${amount}...`);
  };

  const handleVoiceInput = () => {
      alert("Voice input activated. Please speak...");
  };

  const handleOptimizePrompt = async () => {
      if (!input.trim()) return;
      try {
          const res = await fetch('/api/v1/prompt/optimize', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ prompt: input })
          });
          const data = await res.json();
          if (data.optimized) setInput(data.optimized);
      } catch (err) {
          console.error("Optimization failed", err);
      }
  };

  const handleResolveDebate = async () => {
      if (!analysis || !analysis.disagreement) return;
      setResolvingDebate(true);
      try {
          const res = await fetch('/api/v1/debate/resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: JSON.stringify({ analysis, prompt: input })
          });
          const data = await res.json();
          if (data.resolution) setResolvedDebate(data.resolution);
      } catch (err) {
          console.error("Debate resolution failed", err);
      } finally {
          setResolvingDebate(false);
      }
  };

  const submitModelRequest = async () => {
    setModelReqLoading(true);
    try {
      const res = await fetch('/api/v1/support/request-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ modelName: modelReqName, reason: modelReqMsg })
      });
      if (res.ok) {
        setModelReqStatus('success');
        setModelReqName('');
        setModelReqMsg('');
      } else {
        setModelReqStatus('error');
      }
    } catch (err) {
      setModelReqStatus('error');
    } finally {
      setModelReqLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    if (tokens + dailyCredits < selectedModels.length * 5) {
        setShowCreditModal(true);
        return;
    }

    const finalInput = input;
    setInput("");
    setHasStartedChat(true);
    setAnalysis(null);
    setResolvedDebate(null);
    setSidebarOpen(false);

    // Update history immediately for user message
    const newHistory = { ...history };
    selectedModels.forEach(m => {
        newHistory[m as keyof ChatHistory] = [...newHistory[m as keyof ChatHistory], { role: "user", content: finalInput }];
    });
    setHistory(newHistory);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/chat/multi", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({
          prompt: finalInput,
          models: selectedModels,
          imageMode,
          searchMode,
          useKnowledge
        }),
      });

      const data = await response.json();
      if (data.history) setHistory(data.history);
      if (data.analysis) setAnalysis(data.analysis);
      if (data.credits) setTokens(data.credits);
      if (data.dailyFreeCredits !== undefined) setDailyCredits(data.dailyFreeCredits);
      
      fetchChatHistory(); // Refresh history
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (model: string, index: number, newContent: string) => {
    const updatedHistory = { ...history };
    updatedHistory[model as keyof ChatHistory][index].content = newContent;
    setHistory(updatedHistory);
  };

  if (!mounted) return null;

  return (
    <div className="h-[100dvh] w-full flex bg-[#fafafa] dark:bg-[#080809] text-neutral-900 dark:text-neutral-100 transition-colors duration-500 relative overflow-hidden">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`fixed lg:relative left-0 top-0 h-full z-[70] transition-all duration-500 ease-in-out flex ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'}`}>
        <div className={`${sidebarOpen ? 'w-[85vw] sm:w-72' : 'w-0'} overflow-hidden bg-white dark:bg-[#0c0c0e] border-r border-black/5 dark:border-white/10 shadow-2xl flex flex-col transition-all duration-500`}>
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 flex-none">
            <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-widest">Neural Command</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 lg:hidden"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="px-4 pt-4 space-y-1 flex-none">
            {[
              { id: 'chat', label: 'Neural Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'knowledge', label: 'Knowledge Base', icon: <Book className="w-4 h-4" /> },
              { id: 'workflows', label: 'AI Workflows', icon: <Layers className="w-4 h-4" /> },
              { id: 'analytics', label: 'Usage Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'settings', label: 'Power Settings', icon: <Settings className="w-4 h-4" /> }
            ].map(tool => (
              <button 
                key={tool.id} 
                onClick={() => { setCurrentTool(tool.id as any); if (tool.id === 'chat') setHasStartedChat(false); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${currentTool === tool.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
              >
                {tool.icon}
                {tool.label}
              </button>
            ))}
          </div>

          <div className="mx-4 my-4 h-[1px] bg-black/5 dark:bg-white/5 flex-none" />

          {currentTool === 'chat' && (
            <button onClick={startNewChat} className="mx-4 flex items-center gap-2 px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex-none">
              <Plus className="w-4 h-4" /> New Intelligence Session
            </button>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 mt-3">
            {chatHistory.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-3 mb-2">Recent Intelligence</p>
                <button onClick={() => loadPreviousChat(chatHistory[0])} className="w-full text-left p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all mb-4">
                   <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Continue Last Session</span>
                   </div>
                   <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate">{chatHistory[0].title || chatHistory[0].prompt}</p>
                </button>
              </div>
            )}

            {chatHistory.map((chat: any, i: number) => (
              <button key={i} onClick={() => loadPreviousChat(chat)} className="w-full text-left p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all group">
                <div className="flex items-center gap-2 mb-1">
                  {chat.imageMode ? <Image className="w-3 h-3 text-amber-500 flex-shrink-0" /> : <MessageSquare className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{chat.imageMode ? 'Autonomous Image' : 'Neural Chat'}</span>
                </div>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">{chat.title || chat.prompt}</p>
                <p className="text-[9px] text-neutral-400 mt-1 uppercase font-bold tracking-tighter">{new Date(chat.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* SECONDARY TOOLS VIEW */}
        {currentTool !== 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex-none z-40 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/5 p-4 flex items-center gap-4">
               <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-600/20 lg:hidden">
                  <PanelLeft className="w-5 h-5" />
               </button>
               <h2 className="text-sm font-black uppercase tracking-widest">{currentTool} Node</h2>
            </header>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {currentTool === 'knowledge' && <KnowledgeSection />}
                {currentTool === 'analytics' && <AnalyticsSection />}
                {currentTool === 'settings' && <SettingsSection />}
                {currentTool === 'workflows' && (
                  <div className="flex-1 flex items-center justify-center p-10 sm:p-20 text-center">
                    <div className="max-w-md">
                      <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-500 mx-auto mb-6">
                        <Layers className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-black uppercase tracking-tightest mb-2">Workflow Builder</h2>
                      <p className="text-sm text-neutral-500 font-medium mb-8">Chain multiple AI agents together to automate complex research and writing tasks.</p>
                      <button className="px-8 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20">
                        Create First Workflow
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* CHAT VIEW */}
        {currentTool === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <header className="flex-none z-50 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/5">
              <div className="max-w-[98%] mx-auto px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
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

                <div className="flex items-center gap-4 group cursor-pointer sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2.5">
                    <Zap className="w-6 h-6 text-blue-600 fill-blue-600/20" />
                    AI<span className="text-blue-600">Fusion</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(true)} className={`p-2.5 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-600/20 hover:bg-blue-600/20 transition-all ${sidebarOpen ? 'hidden lg:flex' : 'flex'}`}>
                    <PanelLeft className="w-4 h-4" />
                    <span className="ml-2 text-[9px] font-black uppercase tracking-widest hidden sm:inline">Command Center</span>
                  </button>
                  <div className={`mx-1 w-[1px] h-4 bg-black/5 dark:bg-white/10 ${sidebarOpen ? 'hidden lg:block' : 'block'}`} />
                  <button onClick={() => setShowModelRequestModal(true)} className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-violet-500/10 text-violet-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all border border-violet-500/20">
                    <Cpu className="w-3.5 h-3.5" /> Request Model
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
              {!hasStartedChat ? (
                <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 animate-in fade-in duration-1000">
                  <div className="max-w-3xl w-full text-center">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tightest mb-4 bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent px-4">
                      Universal AI Intelligence.
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-lg mb-6 sm:mb-8 font-medium px-6">Compare the world's most powerful models in one single interface.</p>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {["openai", "deepseek", "meta", "gemini"].map((m) => (
                        <button key={m} onClick={() => toggleModel(m)}
                          className={`px-6 py-3 rounded-2xl text-xs font-black transition-all border uppercase tracking-widest ${selectedModels.includes(m) ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20" : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20"}`}>
                          {m}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-4">Select Intelligence Mode</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-2xl mx-auto">
                        {[
                            { id: 'general', label: 'General', icon: <Sparkles className="w-3 h-3" />, color: 'blue' },
                            { id: 'code', label: 'Code Editor', icon: <Cpu className="w-3 h-3" />, color: 'violet' },
                            { id: 'creative', label: 'Creative Writer', icon: <Zap className="w-3 h-3" />, color: 'amber' },
                            { id: 'research', label: 'Researcher', icon: <Book className="w-3 h-3" />, color: 'emerald' },
                            { id: 'legal', label: 'Legal Reviewer', icon: <ShieldCheck className="w-3 h-3" />, color: 'red' }
                        ].map((mode) => (
                            <button key={mode.id} onClick={() => setSmartMode(mode.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${smartMode === mode.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-400 hover:border-neutral-300'}`}>
                                {mode.icon} {mode.label}
                            </button>
                        ))}
                    </div>

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
                      {["openai", "deepseek", "meta", "gemini"].map((model) => (
                        selectedModels.includes(model) && (
                          <ResponseCard
                            key={model}
                            modelName={model.charAt(0).toUpperCase() + model.slice(1)}
                            provider={model as any}
                            messages={history[model as keyof typeof history]}
                            loading={loadingModels.includes(model)}
                            onFocus={() => {}}
                            onEditMessage={(index, content) => handleEditMessage(model, index, content)}
                          />
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </main>

            {hasStartedChat && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 via-neutral-50/90 dark:from-[#09090b] dark:via-[#09090b]/90 z-40">
                <div className="max-w-4xl mx-auto relative flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { setSearchMode(!searchMode); setImageMode(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${searchMode ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-blue-500/30'}`}>
                        <Clock className="w-3 h-3" /> {searchMode ? 'Search ON' : 'Search'}
                      </button>
                      <button type="button" onClick={() => { setImageMode(!imageMode); setSearchMode(false); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${imageMode ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-amber-500/30'}`}>
                        <Zap className="w-3 h-3" /> {imageMode ? 'Image ON' : 'Image'}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {["all","openai","deepseek","meta","gemini"].map((m) => (
                        <button key={m} onClick={() => toggleModel(m)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${(m === 'all' && selectedModels.length === 4) || selectedModels.includes(m) ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20"}`}>
                          {m.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="relative flex flex-col bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-white/10 rounded-[32px] shadow-2xl p-2">
                    <div className="flex items-center">
                      <div className="flex items-center gap-1 pl-1">
                        <label className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full cursor-pointer transition-colors">
                          <input type="file" multiple className="hidden" onChange={(e) => { const f = Array.from(e.target.files || []); setFiles(prev => [...prev, ...f].slice(0,10)); }} />
                          <Paperclip className={`w-5 h-5 ${files.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
                        </label>
                        <button type="button" onClick={handleVoiceInput} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full text-neutral-400 hover:text-blue-500 transition-colors">
                          <Mic className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={handleOptimizePrompt} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full text-neutral-400 hover:text-blue-500 transition-colors">
                          <Sparkles className="w-5 h-5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder={imageMode ? 'Describe image to generate...' : searchMode ? 'Search mode active...' : "Continue the conversation..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                        className="flex-1 bg-transparent border-none outline-none px-4 text-base font-medium"
                      />
                      <button type="submit" disabled={loading} className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:opacity-30 transition-all active:scale-90">
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showCreditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-[40px] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden p-10 relative">
            <button onClick={() => setShowCreditModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Zap className="w-8 h-8 text-white" /></div>
              <div><h2 className="text-2xl font-black tracking-tight">Refuel Your AI ⚡</h2><p className="text-neutral-500 text-sm">Choose a plan to continue.</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                <div><h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Starter Pack</h3><div className="text-3xl font-black mb-4">Rs.99</div></div>
                <button onClick={() => handleBuyCredits(99, 'starter')} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">Get Credits</button>
              </div>
              <div className="p-6 rounded-3xl bg-blue-600/5 dark:bg-blue-600/10 border-2 border-blue-600/30 flex flex-col justify-between group">
                <div><h3 className="font-black text-xs uppercase tracking-widest text-blue-500 mb-2">Pro Mastery</h3><div className="text-3xl font-black mb-4">Rs.199</div></div>
                <button onClick={() => handleBuyCredits(199, 'pro')} className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">Go Pro Now</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModelRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0c0c0e] w-full max-w-md rounded-[32px] border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden p-8">
            <button onClick={() => { setShowModelRequestModal(false); setModelReqStatus(''); }} className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
            <h2 className="text-lg font-black tracking-tight mb-6">Request a Model</h2>
            <div className="space-y-4">
              <input value={modelReqName} onChange={e => setModelReqName(e.target.value)} placeholder="Model Name" className="w-full bg-neutral-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none" />
              <textarea value={modelReqMsg} onChange={e => setModelReqMsg(e.target.value)} rows={3} placeholder="Why?" className="w-full bg-neutral-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none" />
              <button onClick={submitModelRequest} className="w-full py-3 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Submit</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
