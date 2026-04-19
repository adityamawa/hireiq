import { createClient } from '@supabase/supabase-js';
import PublicResumeUpload from '@/components/PublicResumeUpload';
import { Briefcase, MapPin, Globe } from 'lucide-react';
import { notFound } from 'next/navigation';

// We use the standard client here since it's a public page
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PublicApplyPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Use .select().eq() without .single() to avoid the coercion error
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id);

  if (error) {
    return <div className="p-20 text-white bg-red-900">Database Error: {error.message}</div>;
  }

  // Check if we actually got a job back
  const job = jobs && jobs.length > 0 ? jobs[0] : null;

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Job Not Found</h1>
        <p className="text-slate-400">The link you followed might be broken or the job has been removed.</p>
        <p className="text-xs text-slate-600 mt-4 font-mono">ID: {params.id}</p>
      </div>
    );
  }

  // ... rest of your return statement

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Branding / Logo Area */}
        <div className="flex items-center gap-3 text-blue-500 font-bold text-2xl tracking-tighter">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            IQ
          </div>
          HireIQ
        </div>

        {/* Job Header */}
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-slate-400">
            <span className="flex items-center gap-2"><MapPin size={18} /> Remote / India</span>
            <span className="flex items-center gap-2"><Briefcase size={18} /> Full-time</span>
            <span className="flex items-center gap-2"><Globe size={18} /> Tech Team</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-800 pt-12">
          {/* Left: Job Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">About the role</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Right: The Intake Form */}
          <div className="relative">
             <div className="sticky top-8">
                <h2 className="text-xl font-bold text-white mb-6">Submit Application</h2>
                <PublicResumeUpload jobId={job.id} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}