import Link from 'next/link';
import { Plus, Briefcase, Calendar, ChevronRight } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

// NEXT.JS FIX: Force this page to NEVER cache. Always fetch fresh data.
export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const supabase = createServerSupabaseClient();
  
  // 1. Verify the server actually knows who is logged in
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
        <h2 className="font-bold">Session Error</h2>
        <p className="text-sm">The server cannot find your login cookie. Please sign out and sign back in.</p>
      </div>
    );
  }

  // 2. Fetch jobs explicitly for this user
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('created_by', session.user.id) // Double-checking ownership
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
        <h2 className="font-bold">Error loading jobs</h2>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Job Postings</h1>
          <p className="text-slate-400">Manage your positions and view applicant rankings.</p>
        </div>
        <Link 
          href="/dashboard/jobs/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          <span className="font-semibold">Create Job</span>
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Link 
              href={`/dashboard/jobs/${job.id}`} 
              key={job.id} 
              className="group p-6 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center hover:border-blue-500/50 hover:bg-slate-800/50 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-950 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{job.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {Array.isArray(job.required_skills) ? job.required_skills.length : 0} Skills defined
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</p>
                  <p className="text-emerald-500 text-sm font-medium">Active</p>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
            <Briefcase className="mx-auto text-slate-700 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-300">No jobs yet</h3>
            <p className="text-slate-500 mt-2">Create your first job posting to start ranking candidates.</p>
          </div>
        )}
      </div>
    </div>
  );
}