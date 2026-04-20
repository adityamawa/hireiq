"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // The user is actually temporarily "logged in" by the email link
    // So we just update the password for the current active session
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard"); // Send them straight to work
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Lock className="text-blue-500" /> Create New Password
          </h1>
          <p className="text-slate-400 text-sm">Your email has been verified. Choose a strong new password.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save New Password"}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.includes('successfully') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}