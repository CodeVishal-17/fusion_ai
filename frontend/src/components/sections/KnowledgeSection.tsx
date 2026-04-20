"use client";
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Database, Search, CheckCircle2, Shield, X } from 'lucide-react';

export default function KnowledgeSection() {
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/v1/knowledge/list', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFiles(data);
            }
        } catch (err) {
            console.error("Failed to fetch files", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/v1/knowledge/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            const data = await res.json();
            if (data.doc) {
                setFiles(prev => [data.doc, ...prev]);
                alert("Knowledge indexed successfully!");
            } else if (data.error) {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Network error during upload. Please check your connection.");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this document?")) return;
        
        try {
            const res = await fetch(`/api/v1/knowledge/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setFiles(prev => prev.filter(f => f._id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-tightest">Neural Knowledge Base</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Deep-index your documents to create a personalized intelligence brain.</p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-xl border border-blue-600/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> {files.length} Documents
                    </div>
                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" /> Encrypted Vault
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 border-2 border-dashed border-neutral-200 dark:border-white/10 rounded-[32px] p-12 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden">
                        <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform relative z-10">
                            {uploading ? <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-10 h-10" />}
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2 relative z-10">Upload Intelligence</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest relative z-10">PDF, DOCX, TXT (Max 50MB)</p>
                        
                        {uploading && (
                             <div className="mt-6 w-full max-w-[150px] h-1.5 bg-neutral-100 dark:bg-white/5 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-blue-600 animate-pulse w-full" />
                             </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-6 h-6" />
                            <h4 className="text-xs font-black uppercase tracking-widest">Instant RAG Active</h4>
                        </div>
                        <p className="text-xs font-medium leading-relaxed opacity-90">Your files are automatically chunked and vectorized. The AI will use this knowledge to provide contextually accurate responses across all sessions.</p>
                    </div>
                </div>

                {/* Library Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-4 gap-4 shadow-sm focus-within:border-blue-500/50 transition-all">
                        <Search className="w-5 h-5 text-neutral-400" />
                        <input 
                            type="text" 
                            placeholder="Search through your neural library..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold w-full" 
                        />
                    </div>

                    <div className="space-y-4">
                        {files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-neutral-50 dark:bg-white/5 rounded-[40px] border border-dashed border-neutral-300 dark:border-white/10">
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
                                    <FileText className="w-8 h-8 text-neutral-300" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Your brain is currently empty</p>
                                <p className="text-xs text-neutral-500 mt-2">Upload a file to begin indexing.</p>
                            </div>
                        ) : (
                            files.filter(f => f.fileName.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
                                <div key={file._id} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                            <FileText className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200">{file.fileName}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="px-2 py-0.5 bg-neutral-100 dark:bg-white/10 rounded-md text-[8px] font-black uppercase text-neutral-500">{file.fileType?.split('/')[1] || 'DATA'}</span>
                                                <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">Indexed {new Date(file.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                                <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">{file.chunks?.length || 0} Chunks</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="hidden md:flex px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 gap-2 items-center">
                                            <CheckCircle2 className="w-3 h-3" /> Synthesis Ready
                                        </div>
                                        <button onClick={() => handleDelete(file._id)} className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
