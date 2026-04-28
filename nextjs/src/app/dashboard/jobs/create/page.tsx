"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, DollarSign, ArrowLeft, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; 

export default function CreateJobPage() {
  // --- FORM STATES ---
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  // --- AI STATES ---
  const [rawJD, setRawJD] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- AI LOGIC ---
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

      // Populate form fields with AI data
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      
      // Note: If you want the AI to extract location/salary, 
      // you can add those fields to your Python Pydantic schema later!

    } catch (error) {
      console.error("Extraction error:", error);
      alert("AI extraction failed. Make sure your Python server is running on localhost:8000");
    } finally {
      setIsExtracting(false);
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in to post a job.");
      setLoading(false);
      return;
    }
    
    const { error } = await supabase.from("jobs").insert([{
      title: title,
      description: description,
      location: location,
      salary_range: salary,
      status: "active",
      recruiter_id: user.id 
    }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/dashboard/jobs");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link href="/dashboard/jobs" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
        <ArrowLeft size={18} /> Back to Jobs
      </Link>

      {/* --- AI AUTOFILL SECTION --- */}
      <div className="bg-slate-900 border border-blue-900/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="text-blue-400" size={20} />
          <h2 className="text-lg font-bold text-white">AI Job Architect</h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Paste a messy JD from LinkedIn or a document. AI will instantly extract the title and description for you.
        </p>
        <textarea
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-24 placeholder:text-slate-600"
          placeholder="Paste raw job description here..."
          value={rawJD}
          onChange={(e) => setRawJD(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAIAutofill}
          disabled={isExtracting}
          className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isExtracting ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isExtracting ? "Analyzing text..." : "Magic Autofill Form"}
        </button>
      </div>
      {/* --- END AI SECTION --- */}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Briefcase className="text-blue-500" /> Post a New Position
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Job Title</label>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Java Developer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Remote / Mumbai"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Salary Range</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  name="salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 12LPA - 18LPA"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Job Description</label>
            <textarea
              name="description"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the role, responsibilities, and requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Posting..." : "Launch Job Posting"}
          </button>
        </form>
      </div>
    </div>
  );
}