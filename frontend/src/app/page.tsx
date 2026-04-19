"use client";

import React, { useState, useRef, useEffect } from "react";
import ResponseCard from "@/components/ResponseCard";
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Sun, Paperclip, X, ArrowUp, Zap, Mic, Volume2, Download, Book, Coins, LogOut, Sparkles, CreditCard, ShieldCheck, User, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleSolo = (id: string) => {
    setSelectedModels([id]);
  };

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
    handleSubmit(undefined, newContent, [model]);
  };

  const handleSubmit = async (e?: React.FormEvent, customInput?: string, forceModels?: string[]) => {
    e?.preventDefault();
    let finalInput = customInput || input;
    if (!finalInput.trim() && files.length === 0) return;

    let finalSelected = forceModels || [...selectedModels];
    
    if (!forceModels && input.includes("@")) {
      const match = input.match(/@(openai|deepseek|meta|gemini)/i);
      if (match) {
        finalSelected = [match[1].toLowerCase()];
        finalInput = input.replace(match[0], "").trim();
      }
    }

    const estimatedCost = finalSelected.length * 4;
    if (tokens < estimatedCost) {
        alert(`Insufficient credits! You need ${estimatedCost} tokens.`);
        return;
    }

    setInput("");
    setHasStartedChat(true);
    setLoading(true);
    
    const updatedHistory = { ...history };
    ["openai", "deepseek", "meta", "gemini"].forEach(model => {
      if (finalSelected.includes(model)) {
        updatedHistory[model as keyof ChatHistory] = [
          ...history[model as keyof ChatHistory],
          { role: "user", content: finalInput }
        ];
      }
    });

    const formData = new FormData();
    formData.append("chatHistory", JSON.stringify(updatedHistory));
    formData.append("bypassModels", JSON.stringify(["openai", "deepseek", "meta", "gemini"].filter(m => !finalSelected.includes(m))));
    formData.append("imageMode", imageMode.toString());
    formData.append("searchMode", searchMode.toString());
    files.forEach(f => formData.append("files", f));
    
    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setHistory(prev => {
        const newHistory = { ...prev };
        const models = ["openai", "deepseek", "meta", "gemini"] as const;
        
        models.forEach(model => {
          if (data[model] && data[model].text) {
            newHistory[model] = [
              ...prev[model],
              { role: "user", content: finalInput },
              { role: "assistant", content: data[model].text }
            ];
          }
        });
        
        return newHistory;
      });

      if (data.analysis) setAnalysis(data.analysis);
      setMetrics({ openai: data.openai, deepseek: data.deepseek, meta: data.meta, gemini: data.gemini });
      if (data.remainingCredits !== undefined) setTokens(data.remainingCredits);
      setInput("");

    } catch (err: any) {
      if (err.message === 'INSUFFICIENT_CREDITS') {
        setShowCreditModal(true);
      } else {
        alert(err.message);
      }
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  const logout = async () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      await signOut({ redirect: false });
      router.push("/login");
  };

  if (!mounted) return null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#fafafa] dark:bg-[#080809] text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      {/* Header */}
      <header className="flex-none z-50 backdrop-blur-xl bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/5">
        <div className="max-w-[98%] mx-auto px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex flex-col items-start sm:items-end">
                <div className="flex items-center bg-white dark:bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-neutral-200 dark:border-white/5">
                    <div className="flex flex-col items-start mr-3 sm:mr-4">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-neutral-400">Credits</span>
                        <div className="flex items-center">
                            <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 mr-1 sm:mr-1.5" />
                            <span className="font-bold text-xs sm:text-sm">{tokens + dailyCredits}</span>
                        </div>
                    </div>
                    <div className="mx-2 w-[1px] h-5 sm:h-6 bg-neutral-200 dark:bg-white/10" />
                    <div className="flex flex-col items-start">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase text-neutral-400">Reset</span>
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 mr-1 sm:mr-1.5" />
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold">{timeLeft}</span>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:hidden">
                <button onClick={() => router.push("/profile")} className="p-2 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-500">
                    <User className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10">
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <button onClick={logout} className="p-2 rounded-lg border border-black/10 dark:border-white/10 text-red-500">
                    <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
          </div>

          <div className="flex items-center gap-4 group cursor-pointer sm:absolute sm:left-1/2 sm:-translate-x-1/2">
             <h1 className="text-lg sm:text-xl font-black tracking-tighter flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                AI<span className="text-blue-500">Fusion</span>
             </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            {hasStartedChat && (
                <button onClick={handleDownloadChat} className="items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex">
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            )}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:scale-105 transition-transform">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => router.push("/profile")} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:scale-105 transition-transform group">
                <User className="w-4 h-4 text-neutral-500 group-hover:text-blue-500 transition-colors" />
            </button>
            <button onClick={logout} className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-red-500/10 hover:text-red-500 transition-all">
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
          {!hasStartedChat ? (
              <div className="h-full flex flex-col items-center justify-center px-6 animate-in fade-in duration-1000">
                  <div className="max-w-3xl w-full text-center">
                      <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tightest mb-4 bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-white/40 bg-clip-text text-transparent px-4">
                          Universal AI Intelligence.
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-lg mb-8 sm:mb-12 font-medium px-6">Compare the world's most powerful models in one single interface.</p>
                      
                      {/* Model Selector Chips */}
                      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                          {["openai", "deepseek", "meta", "gemini"].map((m) => (
                              <button
                                key={m}
                                onClick={() => toggleModel(m)}
                                className={`px-5 py-2.5 rounded-[20px] text-xs font-black transition-all border ${
                                    selectedModels.includes(m) 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105" 
                                    : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20"
                                }`}
                              >
                                  {m.toUpperCase()}
                              </button>
                          ))}
                      </div>

                      {/* Expert Prompt Library */}
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

                      {/* Main Search with Multi-File Attachment */}
                      <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
                          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                          <div className="relative flex flex-col bg-white dark:bg-[#121214] border border-neutral-200 dark:border-white/10 rounded-[28px] p-2 shadow-2xl">
                               
                               {/* Multi-File Preview inside Search */}
                               {files.length > 0 && (
                                   <div className="px-4 py-3 flex flex-wrap gap-2 animate-in slide-in-from-top-2 border-b border-neutral-100 dark:border-white/5 mb-1">
                                       {files.map((f, i) => (
                                           <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                              <Paperclip className="w-3 h-3 text-blue-500" />
                                              <span className="text-[10px] font-bold text-blue-600 truncate max-w-[100px]">{f.name}</span>
                                              <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded">
                                                  <X className="w-3 h-3 text-blue-500" />
                                              </button>
                                           </div>
                                       ))}
                                   </div>
                               )}

                                <div className="flex items-center">
                                     <div className="flex items-center gap-0.5 sm:gap-1 pl-1 sm:pl-2">
                                         <label className="p-2 sm:p-3 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors">
                                             <input 
                                                 type="file" 
                                                 multiple
                                                 className="hidden" 
                                                 onChange={(e) => {
                                                     const newFiles = Array.from(e.target.files || []);
                                                     setFiles(prev => [...prev, ...newFiles].slice(0, 10));
                                                 }}
                                             />
                                             <Paperclip className={`w-4 h-4 sm:w-5 sm:h-5 ${files.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
                                         </label>
                                         <button 
                                             type="button"
                                             onClick={handleVoiceInput}
                                             className="p-2 sm:p-3 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-2xl text-neutral-400 hover:text-blue-500 transition-colors"
                                         >
                                             <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                         </button>
                                     </div>
                                     <div className="flex-1 flex items-center bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full px-4 py-1.5 shadow-sm focus-within:ring-2 ring-blue-500/20 transition-all">
                
                {/* Mode Toggles */}
                <div className="flex items-center gap-1 mr-3 pr-3 border-r border-black/5 dark:border-white/10">
                    <button 
                        onClick={() => { setSearchMode(!searchMode); setImageMode(false); }}
                        className={`p-2 rounded-full transition-all ${searchMode ? 'bg-blue-500 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
                        title="Neural Deep Search"
                    >
                        <Clock className={`w-4 h-4 ${searchMode ? 'animate-spin-slow' : ''}`} />
                    </button>
                    <button 
                        onClick={() => { setImageMode(!imageMode); setSearchMode(false); }}
                        className={`p-2 rounded-full transition-all ${imageMode ? 'bg-amber-500 text-white shadow-lg' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5'}`}
                        title="Autonomous Imaging"
                    >
                        <Zap className={`w-4 h-4 ${imageMode ? 'animate-pulse' : ''}`} />
                    </button>
                </div>

                <input
                  type="text"
                  placeholder={imageMode ? "Describe the image you want to create..." : searchMode ? "What do you want to find on the live web?" : "Command the Neural Core... (use @model to solo)"}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2 placeholder:text-neutral-400"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                />
                                     </div>
                                     <button type="submit" className="p-3 sm:p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition-all group-hover:scale-105 active:scale-95">
                                         <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
                                     </button>
                                </div>
                          </div>
                      </form>

                      <div className="mt-12 flex items-center justify-center gap-10 hover:scale-105 transition-transform duration-700">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" className="h-8 drop-shadow-md" alt="openai" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" className="h-8 drop-shadow-md" alt="gemini" />
                          <img src="https://www.deepseek.com/favicon.ico" className="h-8 drop-shadow-md" alt="deepseek" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" className="h-6 drop-shadow-md" alt="meta" />
                      </div>
                  </div>
              </div>
          ) : (
              <div className="h-full overflow-y-auto custom-scrollbar px-6 py-8 pb-40">
                  <div className="max-w-[1600px] mx-auto">
                    {/* --- 🧠 CONSENSUS ANALYSIS (Real-time Summary) --- */}
                    {analysis && (
                      <div className="max-w-[98%] mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-blue-500/20 rounded-[32px] p-5 sm:p-8 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 border border-blue-600/20">
                                        <Sparkles className="w-4 h-4 animate-pulse" />
                                    </div>
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-blue-600/80">Neural Consensus Analysis</h3>
                                </div>
                                
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                                        {analysis.consensus || analysis}
                                    </p>
                                </div>

                                {analysis.bestModel && (
                                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                                         <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Synthesis Winner:</span>
                                         <span className="px-2 py-1 rounded-md bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-tighter border border-blue-600/20">
                                            {analysis.bestModel}
                                         </span>
                                    </div>
                                )}
                            </div>
                        </div>
                      </div>
                    )}

                    {/* Global Multi-File Preview (Optional, can keep it only inside input) */}

                    <div className={`grid gap-8 transition-all duration-700 ${
                        selectedModels.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
                        selectedModels.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto' :
                        selectedModels.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`}>
                        {["openai", "deepseek", "meta", "gemini"].map((key) => (
                             selectedModels.includes(key) && (
                                <ResponseCard
                                    key={key}
                                    modelName={key.toUpperCase()}
                                    provider={key as any}
                                    messages={history[key as keyof ChatHistory]}
                                    loading={loading}
                                    onFocus={() => {}}
                                    onEditMessage={(index, content) => handleEditMessage(key, index, content)}
                                    isBest={analysis?.bestModel === key}
                                    metrics={metrics[key]}
                                    onSolo={() => handleSolo(key)}
                                />
                             )
                        ))}
                    </div>

                    {/* --- 👑 THE ULTIMATE SYNTHESIS (Master Response) --- */}
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
      </main>

      {/* Floating Chat Bar (Only after start) */}
      {hasStartedChat && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-50 via-neutral-50 dark:from-[#09090b] dark:via-[#09090b] z-40">
             <div className="max-w-4xl mx-auto relative flex flex-col gap-4">
                 
                 {/* Model Selector in Chat View */}
                 <div className="flex justify-center gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {["all", "openai", "deepseek", "meta", "gemini"].map((m) => (
                          <button
                            key={m}
                            onClick={() => toggleModel(m)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                                (m === 'all' && selectedModels.length === 4) || selectedModels.includes(m)
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-500 hover:border-neutral-300 dark:hover:border-white/20"
                            }`}
                          >
                              {m.toUpperCase()}
                          </button>
                      ))}
                 </div>

                 <form onSubmit={handleSubmit} className="relative flex flex-col bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-white/10 rounded-[32px] shadow-2xl p-2 animate-in slide-in-from-bottom-4">
                     
                     {/* Multi-File Preview inside Chat Input */}
                     {files.length > 0 && (
                         <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-neutral-100 dark:border-white/5 mb-1">
                             {files.map((f, i) => (
                                 <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                                    <Paperclip className="w-3 h-3 text-blue-500" />
                                    <span className="text-[10px] font-bold text-blue-600 truncate max-w-[100px]">{f.name}</span>
                                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded">
                                        <X className="w-3 h-3 text-blue-500" />
                                    </button>
                                 </div>
                             ))}
                         </div>
                     )}

                     <div className="flex items-center">
                        <div className="flex items-center gap-1 pl-1">
                            <label className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full cursor-pointer transition-colors relative">
                                <input 
                                    type="file" 
                                    multiple
                                    className="hidden" 
                                    onChange={(e) => {
                                        const newFiles = Array.from(e.target.files || []);
                                        setFiles(prev => [...prev, ...newFiles].slice(0, 10));
                                    }}
                                />
                                <Paperclip className={`w-5 h-5 ${files.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
                            </label>
                            <button 
                                type="button"
                                onClick={handleVoiceInput}
                                className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full text-neutral-400 hover:text-blue-500 transition-colors"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>

                        <input 
                            type="text"
                            placeholder={files.length > 0 ? `${files.length} files attached...` : "Continue the conversation..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
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
      {/* --- ⚡ CREDIT TOP-UP MODAL --- */}
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
                            <h2 className="text-2xl font-black tracking-tight">Refuel Your AI ⚡</h2>
                            <p className="text-neutral-500 text-sm">Choose a plan to continue your synthesis.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Starter Pack</h3>
                                <div className="text-3xl font-black mb-4">₹99</div>
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
                                <div className="text-3xl font-black mb-4">₹199</div>
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

      {/* --- ⚡ CREDIT TOP-UP MODAL --- */}
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
                            <h2 className="text-2xl font-black tracking-tight">Refuel Your AI ⚡</h2>
                            <p className="text-neutral-500 text-sm">Choose a plan to continue your synthesis.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group">
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest text-neutral-400 mb-2">Starter Pack</h3>
                                <div className="text-3xl font-black mb-4">₹99</div>
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
                                <div className="text-3xl font-black mb-4">₹199</div>
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
    </div>
  );
}
