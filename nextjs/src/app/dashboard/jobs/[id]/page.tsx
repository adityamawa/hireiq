import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import { Briefcase, Clock, Tag, ChevronLeft } from 'lucide-react';
import ResumeUpload from '@/components/ResumeUpload';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  // 1. Fetch Job Details
  const { data: job } = await supabase.from('jobs').select('*').eq('id', params.id).single();

  // 2. Fetch Applications for this specific job
  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', params.id)
    .order('created_at', { ascending: false });

  if (!job) notFound();

  const skills = Array.isArray(job.required_skills) ? job.required_skills : [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/dashboard/jobs" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        <span>Back to Jobs</span>
      </Link>

      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Briefcase size={120} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Clock size={16} />
              Posted: {new Date(job.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              Active Posting
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Job Description */}
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </section>

          {/* Target Skills */}
          <section className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Target Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((skill: string) => (
                  <span key={skill} className="flex items-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-sm font-medium">
                    <Tag size={14} />
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 italic">No specific skills listed.</p>
              )}
            </div>
          </section>

          {/* Applicant List Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Applicants</h2>
              <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                {applications?.length || 0} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Match Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {applications && applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/30 transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-lg">{app.candidate_name}</span>
                            <span className="text-xs text-slate-500 mb-2">{new Date(app.created_at).toLocaleDateString()}</span>
                            
                            {/* AI Summary Box - Shows only if screened */}
                            {app.ai_analysis && (
                              <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                  <span className="text-blue-400 font-bold text-xs uppercase mr-2 tracking-wider">AI Insight:</span>
                                  {app.ai_analysis}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            app.status === 'pending' 
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right align-top">
                          <div className="flex flex-col items-end">
                            <span className={`text-3xl font-mono font-black ${
                              app.overall_score >= 80 ? 'text-emerald-400' : 'text-blue-400'
                            }`}>
                              {app.overall_score !== null ? `${app.overall_score}%` : '--'}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">Match Rank</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <ResumeUpload jobId={job.id} />
        </div>
      </div>
    </div>
  );
}