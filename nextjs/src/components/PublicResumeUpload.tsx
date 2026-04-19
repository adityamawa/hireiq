"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, CheckCircle, Loader2, FileText } from 'lucide-react';

export default function PublicResumeUpload({ jobId }: { jobId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !candidateName) return;

    setStatus('loading');

    try {
      const fileName = `${jobId}_${Date.now()}.pdf`;

      // 1. Upload PDF to Storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);

      // 2. Create the Application record
      const { error: dbError } = await supabase.from('applications').insert([{
        job_id: jobId,
        candidate_name: candidateName,
        resume_url: publicUrl,
        resume_path: fileName,
        status: 'pending'
      }]);

      if (dbError) throw dbError;

      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 rounded-3xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-white font-bold text-2xl">Application Received!</h3>
        <p className="text-slate-400 mt-3 leading-relaxed">
          Thanks, {candidateName.split(' ')[0]}! Our AI is now analyzing your resume. 
          We'll be in touch if there's a match.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpload} className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 backdrop-blur-sm">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
        <input 
          required
          type="text" 
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g. Aditya Mawa"
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Resume (PDF)</label>
        <div className="relative group">
          <input 
            required
            type="file" 
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="border-2 border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 transition-all">
            <div className="p-4 bg-slate-800 rounded-2xl text-slate-500 group-hover:text-blue-500 transition-colors">
              <UploadCloud size={28} />
            </div>
            <span className="text-sm font-medium text-slate-400">
              {file ? (
                <span className="flex items-center gap-2 text-blue-400">
                  <FileText size={16} /> {file.name}
                </span>
              ) : "Drop your PDF here or click to browse"}
            </span>
          </div>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">
          Something went wrong. Please try again.
        </p>
      )}

      <button 
        disabled={status === 'loading'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Submitting...</span>
          </>
        ) : (
          "Submit Application"
        )}
      </button>
      <p className="text-[10px] text-slate-600 text-center uppercase font-bold tracking-tighter">
        By submitting, you agree to AI screening of your professional data.
      </p>
    </form>
  );
}