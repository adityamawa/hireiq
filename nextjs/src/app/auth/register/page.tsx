"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This tells Supabase where to send the user after they click the email link
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Registration successful! Please check your email for the confirmation link.');
      router.push('/auth/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm">Join HireIQ and start screening smarter.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Email Address</label>
            <input 
              type="email" 
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Password</label>
            <input 
              type="password" 
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 uppercase">Or</span>
          <div className="w-full border-t border-slate-800"></div>
        </div>

        <p className="text-center text-slate-400 text-sm">
          Already have an account? <Link href="/auth/login" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}