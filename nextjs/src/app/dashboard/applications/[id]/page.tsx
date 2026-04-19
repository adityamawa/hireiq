import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { CheckCircle2, XCircle, FileText, User, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CandidateDetail({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  // Fetch application details and the related job description
  const { data: app } = await supabase
    .from('applications')
    .select('*, jobs(title, description)')
    .eq('id', params.id)
    .single();

  if (!app) notFound();

  // If the AI hasn't processed it yet, show a pending state
  const isPending = app.status === 'pending';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <Link href="/dashboard/applications" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
        <ArrowLeft size={18} /> Back to Applications
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">{app.candidate_name}</h1>
            <p className="text-slate-400">Applied for <span className="text-blue-400 font-bold">{app.jobs?.title}</span></p>
          </div>
        </div>

        <div className="text-center px-8 py-4 bg-slate-950 rounded-2xl border border-slate-800">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">AI Match Score</p>
          <div className={`text-5xl font-black ${app.overall_score >= 80 ? 'text-emerald-500' : 'text-blue-500'}`}>
            {app.overall_score || '--'}<span className="text-2xl">%</span>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="bg-amber-500/10 border border-amber-500/20 p-12 rounded-3xl text-center">
          <p className="text-amber-500 font-bold text-lg">AI Screening in Progress...</p>
          <p className="text-slate-400 mt-2">Check back in a few seconds to see the full analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: AI Reasoning */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-white mb-4">AI Executive Summary</h2>
              <p className="text-slate-300 leading-relaxed italic">
                "{app.ai_analysis}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-2 text-emerald-500 mb-4">
                  <CheckCircle2 size={20} />
                  <h3 className="font-bold uppercase tracking-tight">Matched Skills</h3>
                </div>
                <ul className="space-y-3">
                  {app.matched_skills?.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {skill}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
                <div className="flex items-center gap-2 text-red-400 mb-4">
                  <XCircle size={20} />
                  <h3 className="font-bold uppercase tracking-tight">Missing / Weak Skills</h3>
                </div>
                <ul className="space-y-3">
                  {app.missing_skills?.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {skill}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Right Column: Actions & Files */}
          <div className="space-y-6">
            <section className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-white font-bold mb-4">Documents</h3>
              <a 
                href={app.resume_url} 
                target="_blank" 
                className="flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-300">Resume.pdf</span>
                </div>
                <ExternalLink size={16} className="text-slate-600 group-hover:text-white" />
              </a>
            </section>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/10">
              Schedule Interview
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all">
              Reject Candidate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}