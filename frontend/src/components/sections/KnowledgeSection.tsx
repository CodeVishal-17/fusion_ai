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
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this document from your knowledge base?")) return;
        
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
                    <h2 className="text-3xl font-black tracking-tightest">Personal Knowledge Base</h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Upload documents to give AI your personal context and memory.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" /> End-to-End Encrypted
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all cursor-pointer relative">
                        <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                            {uploading ? <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-8 h-8" />}
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest mb-2">Drop Knowledge</h4>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">PDF, DOCX, TXT up to 20MB</p>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Database className="w-5 h-5" />
                            <h4 className="text-xs font-black uppercase tracking-widest">Neural Indexing</h4>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed opacity-80">All documents are chunked and converted into vector embeddings using text-embedding-3-small for sub-millisecond retrieval during chat.</p>
                    </div>
                </div>

                {/* Library Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3 gap-3">
                        <Search className="w-4 h-4 text-neutral-400" />
                        <input 
                            type="text" 
                            placeholder="Search your library..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold w-full" 
                        />
                    </div>

                    <div className="space-y-3">
                        {files.length === 0 ? (
                            <div className="text-center py-20 bg-neutral-50 dark:bg-white/5 rounded-[32px] border border-dashed border-neutral-300 dark:border-white/10">
                                <FileText className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Library is empty</p>
                            </div>
                        ) : (
                            files.filter(f => f.fileName.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
                                <div key={file._id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl group hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest">{file.fileName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">{file.fileType?.split('/')[1] || 'DOC'}</span>
                                                <span className="w-1 h-1 bg-neutral-300 dark:bg-white/10 rounded-full" />
                                                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-tighter">Indexed {new Date(file.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3 h-3" /> Ready
                                        </div>
                                        <button onClick={() => handleDelete(file._id)} className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
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
