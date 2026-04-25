"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
// Import the constant directly from your lib
import { supabase } from "@/lib/supabase"; 

export default function CreateJobPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  // 1. Fetch the user first
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Please log in to post a job.");
    setLoading(false);
    return;
  }

  const formData = new FormData(e.currentTarget);
  
  // 2. Add recruiter_id to the insert
  const { error } = await supabase.from("jobs").insert([{
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    salary_range: formData.get("salary"),
    status: "active",
    recruiter_id: user.id // <--- ADDED HERE
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
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/jobs" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
        <ArrowLeft size={18} /> Back to Jobs
      </Link>

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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none"
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none"
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