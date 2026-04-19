"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { UploadCloud, FileText, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ResumeUpload({ jobId }: { jobId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false); // NEW: Drag state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // NEW: Shared function to handle files whether from click or drop
  const processFiles = (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf' || file.name.endsWith('.pdf'));
    
    if (pdfFiles.length !== selectedFiles.length) {
      setErrorMessage('Some files were ignored. Please only upload PDFs.');
    } else {
      setErrorMessage('');
    }

    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      setStatus('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  // NEW: Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setStatus('idle');
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `${jobId}_${Date.now()}_${i}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('applications')
          .insert([
            {
              job_id: jobId,
              candidate_name: file.name.replace('.pdf', '').replace(/[-_]/g, ' '),
              resume_url: publicUrl,
              resume_path: fileName,
              status: 'pending'
            }
          ]);

        if (dbError) throw dbError;

        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      setStatus('success');
      setFiles([]);
      router.refresh(); 
      
    } catch (error: any) {
      console.error('Upload Error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to upload resumes.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <h3 className="text-xl font-bold text-white mb-2">Bulk Resume Upload</h3>
      <p className="text-slate-400 text-sm mb-6">
        Select or drag multiple PDFs here.
      </p>
      
      {/* Updated accept attribute for better Mac support */}
      <input 
        type="file" 
        accept="application/pdf,.pdf" 
        multiple 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      {uploading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
          <p className="text-blue-400 font-medium animate-pulse">
            Uploading {progress.current} of {progress.total}...
          </p>
        </div>
      ) : status === 'success' ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-emerald-400 font-medium">All resumes uploaded successfully!</p>
          <button 
            onClick={() => setStatus('idle')}
            className="text-sm text-slate-400 hover:text-white transition-colors underline"
          >
            Upload more
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* NEW: Dropzone Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed py-8 rounded-xl font-bold flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
              isDragging 
                ? 'bg-blue-600/30 border-blue-400 text-blue-300' 
                : 'bg-blue-600/10 border-blue-500/50 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500'
            }`}
          >
            <UploadCloud size={32} className={isDragging ? 'animate-bounce' : ''} />
            <span>{isDragging ? 'Drop PDFs here' : 'Click or Drag PDFs'}</span>
          </div>

          {files.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2 text-left mb-4 pr-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-blue-500 flex-shrink-0" size={18} />
                    <span className="text-slate-300 text-xs truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errorMessage && (
            <p className="text-amber-400 text-sm font-medium">{errorMessage}</p>
          )}

          {files.length > 0 && (
            <button 
              onClick={handleUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              Upload {files.length} {files.length === 1 ? 'Resume' : 'Resumes'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}