import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { FileText, ExternalLink, User, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link'; // New Import

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  const supabase = createServerSupabaseClient();

  // 1. Fetch REAL data from Supabase
  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs(title)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400">View and manage candidate rankings based on AI analysis.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950/50 text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Candidate</th>
              <th className="px-6 py-4 font-medium tracking-wider">Applied Position</th>
              <th className="px-6 py-4 font-medium tracking-wider text-center">AI Score</th>
              <th className="px-6 py-4 font-medium tracking-wider">Status</th>
              <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {applications && applications.length > 0 ? (
              applications.map((app) => (
                <tr key={app.id} className="group hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-800 rounded-full text-slate-400 flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                        <User size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{app.candidate_name}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 italic text-sm">
                    {app.jobs?.title || 'Unknown Position'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-mono font-bold text-lg ${
                      (app.overall_score || 0) >= 80 ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {app.overall_score ? `${app.overall_score}%` : '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      app.status === 'screened' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* View Resume Link */}
                      <a 
                        href={app.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                        title="View PDF"
                      >
                        <ExternalLink size={18} />
                      </a>
                      
                      {/* NEW: Link to Detail Page */}
                      <Link 
                        href={`/dashboard/applications/${app.id}`}
                        className="flex items-center gap-2 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all"
                      >
                        Full Report <ChevronRight size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                  No applications found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}