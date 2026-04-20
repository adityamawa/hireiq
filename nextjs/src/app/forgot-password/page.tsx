"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // This tells Supabase to send the email, and where to send the user after they click the link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Success! Check your email for the reset link.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        
        <Link href="/login" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit text-sm">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <KeyRound className="text-blue-500" /> Reset Password
          </h1>
          <p className="text-slate-400 text-sm">Enter your email and we'll send you a secure reset link.</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.includes('Success') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}