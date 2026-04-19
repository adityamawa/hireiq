import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { Briefcase, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const supabase = createServerSupabaseClient();

// 1. Fetch Stats
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  
  // Use a fallback empty array if data is null
  const { data: applicationsData } = await supabase.from('applications').select('overall_score');
  const applications = applicationsData || []; 
  
  const totalApps = applications.length;
  
  // Calculate average only if there are applications to avoid division by zero
  const avgScore = totalApps > 0 
    ? Math.round(applications.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalApps) 
    : 0;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Welcome back. Here is what's happening with your recruitment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition-transform">
            <Briefcase size={100} />
          </div>
          <p className="text-slate-400 font-medium">Active Jobs</p>
          <h3 className="text-4xl font-black text-white mt-2">{jobsCount || 0}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <Users size={100} />
          </div>
          <p className="text-slate-400 font-medium">Total Applicants</p>
          <h3 className="text-4xl font-black text-white mt-2">{totalApps}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform">
            <Star size={100} />
          </div>
          <p className="text-slate-400 font-medium">Avg. Match Score</p>
          <h3 className="text-4xl font-black text-white mt-2">{avgScore}%</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Create a New Job</h2>
            <p className="text-slate-400 text-sm mb-6">Ready to hire? Define your requirements and let the AI find the best talent.</p>
          </div>
          <Link
            href="/dashboard/jobs/create"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all w-fit"
          >
            Post a Job <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">View Recent Applicants</h2>
            <p className="text-slate-400 text-sm mb-6">Check out the latest candidates and their AI-generated scores.</p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all w-fit"
          >
            Go to Jobs <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}