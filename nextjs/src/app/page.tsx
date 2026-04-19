import Link from 'next/link';
import { ArrowRight, Cpu, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <div className="text-2xl font-bold tracking-tighter text-blue-500">HireIQ</div>
        <div className="space-x-6">
          <Link href="/auth/login" className="text-sm font-medium hover:text-blue-400 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-medium text-blue-400 mb-6">
          <Zap size={14} />
          <span>Next-Gen Candidate Screening</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
          Hire Smarter, <br />Not Harder.
        </h1>
        
        <p className="max-w-2xl text-slate-400 text-lg md:text-xl mb-10">
          HireIQ uses AI to parse resumes and rank candidates based on your specific job requirements. 
          Stop digging through PDFs and start interviewing the best talent.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/auth/register" className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all">
            <span>Start Screening Now</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
            <Cpu className="text-blue-500 mb-4" size={32} />
            <h3 className="font-bold text-xl mb-2">AI Scoring</h3>
            <p className="text-slate-400">Gemini-powered analysis of skills and experience match.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
            <Zap className="text-blue-500 mb-4" size={32} />
            <h3 className="font-bold text-xl mb-2">Instant Ranking</h3>
            <p className="text-slate-400">Upload resumes and get a ranked list of candidates in seconds.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
            <Shield className="text-blue-500 mb-4" size={32} />
            <h3 className="font-bold text-xl mb-2">Secure Data</h3>
            <p className="text-slate-400">Enterprise-grade security using Supabase Row Level Security.</p>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-900 text-center text-slate-500 text-sm">
        © 2026 HireIQ AI. Built for modern recruitment.
      </footer>
    </div>
  );
}