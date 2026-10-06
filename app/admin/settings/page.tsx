"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import { inputClassLg, labelClassLg } from "@/components/admin/styles";
import { DEFAULT_SITE_CORE } from "@/lib/site-defaults";

export default function AdminSettingsPage() {
  const [phone, setPhone] = useState(DEFAULT_SITE_CORE.phone);
  const [email, setEmail] = useState(DEFAULT_SITE_CORE.email);
  const [address, setAddress] = useState(DEFAULT_SITE_CORE.address);
  const [responseGuarantee, setResponseGuarantee] = useState(DEFAULT_SITE_CORE.responseGuarantee);

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

    setLoading(true);

    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          address,
          responseGuarantee,
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
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <span className="kicker mb-2">Configuration</span>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            Site <span className="display-accent text-accent">&amp; contact details.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Update the business contact details shown in the footer, contact page and header actions.
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
            <span>Settings saved to database!</span>
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
              <label className={labelClassLg}>Phone / WhatsApp Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassLg}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClassLg}>Main Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassLg}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClassLg}>Response Time Guarantee</label>
              <input
                type="text"
                required
                value={responseGuarantee}
                onChange={(e) => setResponseGuarantee(e.target.value)}
                className={inputClassLg}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className={labelClassLg}>Office Location Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClassLg}
              />
            </div>
          </div>
        </div>

        {/* ADMIN PASSWORD — handled outside the app, on purpose */}
        <div className="p-6 rounded-3xl bg-[#F4F6F1] border border-[#E1E6DF] text-xs font-medium text-slate-600 space-y-1.5">
          <h2 className="text-sm font-black uppercase text-[#0B1310]">Admin password</h2>
          <p>
            Credentials are rotated with <span className="font-mono font-bold">npm run db:seed-admin</span> (see the
            README) rather than from this screen, so no password is ever stored in site content or echoed back by the
            API.
          </p>
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
