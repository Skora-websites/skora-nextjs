"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, Lock, Mail, Phone, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const [phone, setPhone] = useState("+44 07756083473");
  const [email, setEmail] = useState("info@skorainfotech.com");
  const [healthcareEmail, setHealthcareEmail] = useState("info@skorainfotech.com");
  const [address, setAddress] = useState("5 market square, High street, Uxbridge, UB8 1LH London");
  const [responseGuarantee, setResponseGuarantee] = useState("Rapid 4-Hour Response Guarantee");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          if (data.content.phone) setPhone(data.content.phone);
          if (data.content.email) setEmail(data.content.email);
          if (data.content.healthcareEmail) setHealthcareEmail(data.content.healthcareEmail);
          if (data.content.address) setAddress(data.content.address);
          if (data.content.responseGuarantee) setResponseGuarantee(data.content.responseGuarantee);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          healthcareEmail,
          address,
          responseGuarantee,
          newPassword: newPassword || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update settings.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError("Network error.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[11px] font-mono font-bold text-[#2563EB] mb-2">
            <Sparkles size={12} />
            <span>✦ GLOBAL SYSTEM CONFIGURATION ✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#0B1310] tracking-tight">
            SITE &amp; SECURITY SETTINGS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Update business contact numbers, email addresses, and admin security password.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Settings and security credentials saved successfully to database!</span>
          </div>
        )}

        {/* BUSINESS CONTACT DETAILS CONFIGURATION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
              <Phone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-[#0B1310]">PUBLIC BUSINESS DETAILS</h2>
              <p className="text-xs text-slate-500 font-medium">Displayed across site footers, contact page, and header action links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Phone / WhatsApp Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Main Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Healthcare Division Email</label>
              <input
                type="email"
                required
                value={healthcareEmail}
                onChange={(e) => setHealthcareEmail(e.target.value)}
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Response Time Guarantee</label>
              <input
                type="text"
                required
                value={responseGuarantee}
                onChange={(e) => setResponseGuarantee(e.target.value)}
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Office Location Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* SECURITY CREDENTIALS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-[#0B1310]">CHANGE ADMIN PASSWORD</h2>
              <p className="text-xs text-slate-500 font-medium">Leave blank if you do not wish to change the password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">New Admin Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-bold uppercase block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-[#0B1310] font-bold focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>SAVE GLOBAL SETTINGS</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
