"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, Plus, X, Loader2, Wand2 } from 'lucide-react';

export default function NewJobPage() {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New AI States
  const [rawJD, setRawJD] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  const router = useRouter();

  // Prevents hydration errors by waiting for the component to mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 text-slate-500">Loading editor...</div>;

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // --- AI AUTOFILL LOGIC ---
  const handleAIAutofill = async () => {
    if (!rawJD.trim()) {
      alert("Please paste a job description first!");
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch("http://localhost:8000/api/extract-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawJD }),
      });

      if (!response.ok) throw new Error("Backend is offline");

      const data = await response.json();

      setTitle(data.title || '');
      setDescription(data.description || '');
      // Ensure skills is set as an array and filter out any empties
      if (data.skills && Array.isArray(data.skills)) {
        setSkills(data.skills.filter((s: string) => s.trim() !== ''));
      }

    } catch (error) {
      console.error("Extraction error:", error);
      alert("AI extraction failed. Make sure your Python server is running on localhost:8000");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Session expired. Please log in again.");
        router.push('/auth/login');
        return;
      }

      const { error } = await supabase.from('jobs').insert([
        { 
          title, 
          description, 
          required_skills: skills,
          recruiter_id: user.id,
          min_experience_years: 0
        }
      ]);

      if (error) throw error;
      
      // 1. Clear Next.js router cache so the list knows about the new job
      router.refresh();
      
      // 2. Attempt smooth Next.js soft navigation
      router.push('/dashboard/jobs');

      // 3. Bulletproof fallback: Force browser redirect if soft navigation hangs
      setTimeout(() => {
        window.location.href = '/dashboard/jobs';
      }, 300);

    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Job</h1>
        <p className="text-slate-400 mt-2">Specify the requirements for your HireIQ screening.</p>
      </div>

      {/* --- AI AUTOFILL SECTION --- */}
      <div className="mb-6 p-6 bg-slate-800/40 border border-blue-500/30 rounded-2xl shadow-inner">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-blue-300">AI Job Architect</h2>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Paste a messy JD from LinkedIn or a document. AI will instantly structure it for you.
        </p>
        <textarea
          className="w-full p-3 bg-slate-950/50 border border-slate-700 rounded-lg text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-24 placeholder:text-slate-600"
          placeholder="Paste raw job description here..."
          value={rawJD}
          onChange={(e) => setRawJD(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAIAutofill}
          disabled={isExtracting}
          className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 py-2.5 rounded-lg font-medium text-blue-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isExtracting ? 'AI is processing...' : 'Magic Autofill Form'}
        </button>
      </div>
      {/* --- END AI SECTION --- */}

      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Job Title</label>
          <input 
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Senior Software Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
          <textarea 
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 h-32"
            placeholder="Paste the job requirements here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Skills Tagging */}
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300">Target Skills (Press Enter to add)</label>
          <div className="flex gap-2 mb-4">
            <input 
              className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. React, Java, AWS"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" onClick={addSkill} className="bg-slate-800 hover:bg-slate-700 px-4 rounded-lg transition-colors">
              <Plus size={20} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {skills.map(skill => (
              <span key={skill} className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-500/30">
                {skill}
                <X size={14} className="cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />
              </span>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Creating Posting...' : 'Create Job Posting'}
        </button>
      </form>
    </div>
  );
}