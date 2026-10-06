"use client";

import React, { useEffect, useState } from "react";
import { Save, CheckCircle2, Layers, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { inputClassLg, labelClassLg } from "@/components/admin/styles";
import { DEFAULT_SITE_CORE } from "@/lib/site-defaults";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  pricing: string;
  status: "Active" | "Inactive";
}

/** The contact block fields this screen edits (all optional in the API payload). */
interface ContactCore {
  phone: string;
  email: string;
  address: string;
  responseGuarantee: string;
}

export default function AdminContentPage() {
  // Contact block — seeded from lib/site-defaults so the form never starts blank.
  const [contact, setContact] = useState<ContactCore>({
    phone: DEFAULT_SITE_CORE.phone,
    email: DEFAULT_SITE_CORE.email,
    address: DEFAULT_SITE_CORE.address,
    responseGuarantee: DEFAULT_SITE_CORE.responseGuarantee,
  });
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/content");
        const data = await res.json();
        if (!cancelled) {
          if (data.content) {
            // Field by field, so a stored document still carrying the retired
            // healthcare keys can never reach the form state.
            setContact((prev) => ({
              phone: data.content.phone || prev.phone,
              email: data.content.email || prev.email,
              address: data.content.address || prev.address,
              responseGuarantee: data.content.responseGuarantee || prev.responseGuarantee,
            }));
            if (data.content.services) setServices(data.content.services);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleContactChange = (field: keyof ContactCore, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: ServiceItem[keyof ServiceItem]) => {
    const updated = [...services];
    const item = { ...updated[index] } as Record<string, ServiceItem[keyof ServiceItem]>;
    item[field] = value;
    updated[index] = { ...updated[index], ...item } as ServiceItem;
    setServices(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, services }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
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
          <span className="kicker mb-2">Content</span>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            Contact <span className="display-accent text-accent">&amp; services.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Edit the public contact block and active service pricing.
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
          <span>Contact details and service settings updated live in database!</span>
        </motion.div>
      )}

      {/* PUBLIC CONTACT BLOCK */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
          <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
            <Phone size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase text-[#0B1310]">PUBLIC CONTACT BLOCK</h2>
            <p className="text-xs text-slate-500 font-medium">
              These values feed the footer, contact page and WhatsApp / call links site-wide.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
          <div className="space-y-1.5">
            <label className={labelClassLg} htmlFor="content-phone">
              Phone / WhatsApp Number
            </label>
            <input
              id="content-phone"
              type="text"
              value={contact.phone}
              onChange={(e) => handleContactChange("phone", e.target.value)}
              className={inputClassLg}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassLg} htmlFor="content-email">
              Main Contact Email
            </label>
            <input
              id="content-email"
              type="email"
              value={contact.email}
              onChange={(e) => handleContactChange("email", e.target.value)}
              className={inputClassLg}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className={labelClassLg} htmlFor="content-address">
              Office Location Address
            </label>
            <input
              id="content-address"
              type="text"
              value={contact.address}
              onChange={(e) => handleContactChange("address", e.target.value)}
              className={inputClassLg}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className={labelClassLg} htmlFor="content-response">
              Response Time Guarantee
            </label>
            <input
              id="content-response"
              type="text"
              value={contact.responseGuarantee}
              onChange={(e) => handleContactChange("responseGuarantee", e.target.value)}
              className={inputClassLg}
            />
          </div>
        </div>
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

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-slate-400">Loading service data...</div>
        ) : (
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
        )}
      </div>
    </div>
  );
}