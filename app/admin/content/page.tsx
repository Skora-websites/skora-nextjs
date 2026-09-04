"use client";

import React, { useEffect, useState } from "react";
import { Sliders, Save, CheckCircle2, Sparkles, Layers, Stethoscope, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface PackageItem {
  id: string;
  name: string;
  price: string;
  period: string;
  popular: boolean;
  subtitle: string;
  features: string[];
}

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  pricing: string;
  status: "Active" | "Inactive";
}

export default function AdminContentPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          if (data.content.packages) setPackages(data.content.packages);
          if (data.content.services) setServices(data.content.services);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePackageChange = (index: number, field: keyof PackageItem, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const handleFeatureChange = (pkgIndex: number, featIndex: number, value: string) => {
    const updated = [...packages];
    const features = [...updated[pkgIndex].features];
    features[featIndex] = value;
    updated[pkgIndex].features = features;
    setPackages(updated);
  };

  const handleAddFeature = (pkgIndex: number) => {
    const updated = [...packages];
    updated[pkgIndex].features.push("New Feature");
    setPackages(updated);
  };

  const handleRemoveFeature = (pkgIndex: number, featIndex: number) => {
    const updated = [...packages];
    updated[pkgIndex].features.splice(featIndex, 1);
    setPackages(updated);
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages, services }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[11px] font-mono font-bold text-[#2563EB] mb-2">
            <Sparkles size={12} />
            <span>✦ DYNAMIC CONTENT CONFIGURATOR ✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#0B1310] tracking-tight">
            PACKAGES &amp; SERVICES MANAGER
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Edit subscription amounts, package names, features, and active service pricing.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>Package amounts and service settings updated live in database!</span>
        </motion.div>
      )}

      {/* HEALTHCARE CLINIC PACKAGES CONFIGURATOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Stethoscope size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-[#0B1310]">HEALTHCARE CLINIC PACKAGES &amp; AMOUNTS</h2>
            <p className="text-xs text-slate-500 font-medium">Edit pricing amounts (in £ GBP), package titles, and deliverables.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-slate-400">Loading package data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, idx) => (
              <div
                key={pkg.id || idx}
                className="p-6 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Package #{idx + 1}</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-mono cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={pkg.popular}
                      onChange={(e) => handlePackageChange(idx, "popular", e.target.checked)}
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-0"
                    />
                    <span>Highlight Popular</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Package Name</label>
                  <input
                    type="text"
                    value={pkg.name}
                    onChange={(e) => handlePackageChange(idx, "name", e.target.value)}
                    className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-xs text-[#0B1310] font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Amount (£)</label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => handlePackageChange(idx, "price", e.target.value)}
                      className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-xs text-emerald-700 font-black font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Billing Period</label>
                    <input
                      type="text"
                      value={pkg.period}
                      onChange={(e) => handlePackageChange(idx, "period", e.target.value)}
                      className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-xs text-slate-700 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Subtitle</label>
                  <input
                    type="text"
                    value={pkg.subtitle}
                    onChange={(e) => handlePackageChange(idx, "subtitle", e.target.value)}
                    className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E1E6DF]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Deliverables</label>
                    <button
                      type="button"
                      onClick={() => handleAddFeature(idx)}
                      className="text-[10px] font-mono font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Deliverable
                    </button>
                  </div>

                  {pkg.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, fIdx, e.target.value)}
                        className="w-full bg-white border border-[#E1E6DF] rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx, fIdx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SERVICES CONFIGURATOR */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-[#0B1310]">MAIN WEBSITE SERVICES &amp; PRICING</h2>
            <p className="text-xs text-slate-500 font-medium">Edit main site digital service titles, categories, and price ranges.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((srv, idx) => (
            <div
              key={srv.id || idx}
              className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-3"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Service Title</label>
                <input
                  type="text"
                  value={srv.title}
                  onChange={(e) => handleServiceChange(idx, "title", e.target.value)}
                  className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1310]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Category</label>
                  <input
                    type="text"
                    value={srv.category}
                    onChange={(e) => handleServiceChange(idx, "category", e.target.value)}
                    className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-[11px] text-[#2563EB] font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500">Budget Range</label>
                  <input
                    type="text"
                    value={srv.pricing}
                    onChange={(e) => handleServiceChange(idx, "pricing", e.target.value)}
                    className="w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2 text-[11px] text-[#0B1310] font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
