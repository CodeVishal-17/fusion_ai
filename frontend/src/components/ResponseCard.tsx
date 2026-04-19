import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/app/page";
import { Bot, Sparkles, Cpu, Edit3, Check, X as CloseX, User, ChevronDown, Volume2, Zap, Download } from "lucide-react";

interface ResponseCardProps {
  modelName: string;
  provider: "openai" | "deepseek" | "meta" | "gemini";
  messages: Message[];
  loading: boolean;
  onFocus: () => void;
  onEditMessage?: (index: number, newContent: string) => void;
  isBest?: boolean;
  metrics?: { time: number; tokens: number; status: string };
  onSolo?: () => void;
}

export default function ResponseCard({ modelName, provider, messages, loading, onFocus, onEditMessage, isBest, metrics, onSolo }: ResponseCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a more natural sounding voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => 
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Enhanced")) && 
      v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.05; // Slightly faster for natural flow
    utterance.pitch = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only inside this card
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const getProviderIcon = () => {
    switch (provider) {
      case "openai": return <Bot className="w-5 h-5 text-emerald-500" />;
      case "meta": return <Sparkles className="w-5 h-5 text-blue-500" />;
      case "deepseek": return <Cpu className="w-5 h-5 text-purple-500" />;
      case "gemini": return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const getProviderTheme = () => {
    switch (provider) {
      case "openai": return "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-500/20";
      case "meta": return "bg-blue-50/30 dark:bg-blue-500/5 border-blue-500/20";
      case "deepseek": return "bg-purple-50/30 dark:bg-purple-500/5 border-purple-500/20";
      case "gemini": return "bg-amber-50/30 dark:bg-amber-500/5 border-amber-500/20";
    }
  };

  const handleStartEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditBuffer(content);
  };

  const handleSaveEdit = (index: number) => {
    if (onEditMessage && editBuffer.trim() !== "") {
      onEditMessage(index, editBuffer);
    }
    setEditingIndex(null);
  };

  return (
    <div 
      onClick={onFocus}
      className={`
        relative flex flex-col h-full w-full bg-white dark:bg-[#0c0c0c] 
        rounded-[32px] border border-neutral-200 dark:border-white/10 
        overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
        dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
        cursor-pointer group ring-1 ring-black/5 dark:ring-white/5
        ${isBest ? 'ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : ''}
      `}
    >
      {/* Premium Header */}
      <div className="relative z-10 px-6 py-5 flex items-center justify-between border-b border-neutral-100 dark:border-white/5 bg-white/80 dark:bg-black/50 backdrop-blur-md">
        {isBest && (
          <div className="absolute top-2 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl z-20 flex items-center gap-1.5 border border-white/20 animate-in zoom-in-50 duration-500">
            <Sparkles className="w-3 h-3" />
            Best Answer
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border ${getProviderTheme()}`}>
            {getProviderIcon()}
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-neutral-800 dark:text-neutral-100 tracking-tight leading-none mb-1">{modelName}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 opacity-60">Comparative Engine</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onSolo?.(); }}
                className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-[9px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Solo Mode
              </button>
              {metrics && (
                <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-neutral-400">
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>{metrics.time}ms</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>{metrics.tokens} tokens</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-1">
             <div className="flex gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-white/5 rounded-full border border-neutral-200/50 dark:border-white/5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
      </div>

      {/* Internal Scrollable Content */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-neutral-50/30 dark:bg-transparent"
      >
        {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-neutral-400 flex items-center justify-center mb-4">
                   {getProviderIcon()}
                </div>
                <p className="text-sm font-medium">Waiting for prompt...</p>
            </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            
            {/* User Prompt - Apple Silk Style */}
            {msg.role === "user" && (
              <div className="self-end max-w-[92%] relative group/edit antialiased">
                {editingIndex === idx ? (
                  <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-3xl border-2 border-blue-500 shadow-2xl flex flex-col gap-3 min-w-[300px] animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                       <Edit3 className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Editing Prompt</span>
                    </div>
                    <textarea 
                      className="w-full bg-neutral-50 dark:bg-black/50 rounded-2xl p-4 text-[14px] focus:outline-none min-h-[100px] resize-none border border-neutral-100 dark:border-white/5"
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingIndex(null); }} className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-xl text-neutral-500 text-xs font-bold transition-colors">Cancel</button>
                      <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(idx); }} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 tracking-wide">
                        <Check className="w-4 h-4"/> Confirm & Branch
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-neutral-100/80 dark:bg-[#1c1c1e] text-neutral-800 dark:text-neutral-100 px-5 py-4 rounded-[24px] rounded-br-[4px] shadow-sm border border-neutral-200/50 dark:border-white/5 hover:border-blue-500/30 transition-colors">
                     <div className="flex items-center gap-2 mb-2 opacity-40">
                        <User className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Contextually Sent</span>
                     </div>
                     <p className="text-[14px] leading-relaxed font-semibold">
                       {msg.content as string}
                     </p>
                     
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleStartEdit(idx, msg.content as string); }}
                       className="absolute -left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-100 transition-all duration-300 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl text-neutral-400 hover:text-blue-500 hover:scale-110 active:scale-90"
                       title="Edit and Branch"
                     >
                       <Edit3 className="w-4 h-4" />
                     </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Answer - Minimalistic Workspace Style with Internal Scroll */}
            {msg.role === "assistant" && (
              <div className={`self-start max-w-full w-full bg-white dark:bg-[#121212] p-6 rounded-[28px] rounded-tl-[4px] shadow-sm border border-neutral-100 dark:border-white/5 relative overflow-hidden flex flex-col max-h-[500px]`}>
                <div className="flex items-center justify-between mb-5 flex-none">
                    <div className="flex items-center gap-2 opacity-40 text-neutral-500">
                        {getProviderIcon()}
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{modelName} Intelligence</span>
                    </div>
                    <button 
                        onClick={() => handleSpeak(msg.content)}
                        className={`p-2 rounded-full transition-all ${isSpeaking ? 'bg-blue-500 text-white animate-pulse' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-blue-500'}`}
                    >
                        <Volume2 className="w-4 h-4" />
                    </button>
                </div>

                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-[14.5px] leading-[1.8] relative z-10 antialiased font-medium text-neutral-700 dark:text-neutral-300 overflow-y-auto custom-scrollbar pr-2">
                  <ReactMarkdown
                    components={{
                      img: ({node, ...props}) => (
                        <div className="my-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl group/img relative">
                            <img {...props} className="w-full h-auto object-cover max-h-[600px] hover:scale-[1.02] transition-transform duration-700" alt="Generated AI" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                                <a href={props.src as string} target="_blank" download className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/20 transition-all">
                                    <Download className="w-3 h-3" /> Save to Neural Core
                                </a>
                            </div>
                        </div>
                      ),
                      h1: ({node, ...props}) => <h1 className="text-xl font-extrabold mt-6 mb-4 text-neutral-900 dark:text-white tracking-tight border-b border-neutral-100 dark:border-white/5 pb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-3 text-neutral-800 dark:text-white" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold mt-4 mb-2 text-neutral-700 dark:text-neutral-200" {...props} />,
                      code: ({node, inline, className, children, ...props}: any) => {
                        return inline ? 
                          <code className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-white/10 text-blue-500 dark:text-blue-400 text-sm font-mono" {...props}>{children}</code> :
                          <div className="relative group/code my-6">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                               <button className="p-1.5 bg-white/10 backdrop-blur rounded-lg border border-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all">
                                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                               </button>
                            </div>
                            <pre className="p-5 rounded-2xl bg-neutral-900 border border-white/5 overflow-x-auto text-[13px] font-mono text-neutral-300 shadow-2xl" {...props}>
                               <code>{children}</code>
                            </pre>
                          </div>
                      },
                      p: ({node, ...props}) => <div className="mb-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-5 space-y-2 marker:text-blue-500" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-5 space-y-2 marker:text-purple-500" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500/40 pl-5 py-1 italic my-6 text-neutral-500 bg-blue-50/20 dark:bg-blue-500/5 rounded-r-2xl" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-500 hover:text-blue-600 font-bold decoration-blue-500/30 underline decoration-2 underline-offset-4" {...props} />
                    }}
                  >
                    {msg.content as string}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
      
    </div>
  );
}
