"use client";
import React, { useState, useEffect } from 'react';
import { Search, FileText, Upload, Trash2, CheckCircle2, Shield, Database, Plus } from 'lucide-react';

export default function MobileKnowledge() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch('/api/v1/knowledge/list', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setFiles(data);
        } catch (err) {
            console.error(err);
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
                alert("Neural Index Updated");
            }
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight">Knowledge</h2>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Neural Indexing Vault</p>
                </div>
                <div className="relative">
                    <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 z-10" />
                    <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                        {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input 
                    type="text" 
                    placeholder="Search neural brain..." 
                    className="bg-transparent border-none outline-none text-xs font-bold w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                {files.filter(f => f.fileName.toLowerCase().includes(searchQuery.toLowerCase())).map((file) => (
                    <div key={file._id} className="p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neutral-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-neutral-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest truncate max-w-[150px]">{file.fileName}</p>
                                <p className="text-[9px] text-neutral-400 font-bold uppercase">{file.chunks?.length || 0} Neural Chunks</p>
                            </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                ))}
                {files.length === 0 && (
                    <div className="py-20 text-center text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">Neural Brain is Empty</div>
                )}
            </div>
        </div>
    );
}
