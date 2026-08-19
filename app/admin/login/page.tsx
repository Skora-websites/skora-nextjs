"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F1] text-[#0B1310] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#2563EB] selection:text-white">
      {/* Ambient Blue Radial Meshes */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563EB]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl bg-white border border-[#E1E6DF] p-8 sm:p-10 shadow-2xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck size={32} />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[11px] font-mono font-bold text-[#2563EB]">
              <Sparkles size={12} />
              <span>✦ SKORA INFO ADMIN PORTAL ✦</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#0B1310] tracking-tight">
              ADMINISTRATOR LOGIN
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Enter credentials to access lead analytics, database controls, and site configurations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
                Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 block">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN TO DASHBOARD</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-[11px] font-mono text-slate-500">
              Skora Security Portal — Authorized Personnel Only
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
