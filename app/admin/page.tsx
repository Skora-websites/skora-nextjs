"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  service: string;
  budget?: string;
  message: string;
  status: "New" | "Contacted" | "In Progress" | "Closed";
  source: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.leads) {
          setLeads(data.leads);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const inProgressLeads = leads.filter((l) => l.status === "In Progress" || l.status === "Contacted").length;
  const closedLeads = leads.filter((l) => l.status === "Closed").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[11px] font-mono font-bold text-[#2563EB] mb-2">
            <Sparkles size={12} />
            <span>✦ SKORA INFO SYSTEM OVERVIEW ✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#0B1310] tracking-tight">
            EXECUTIVE DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Manage inquiries, update site configurations, and monitor client acquisition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Users size={16} />
            <span>View All Leads</span>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-2xl bg-white border border-[#E1E6DF] space-y-3 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-500">Total Enquiries</span>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#2563EB]/20">
              <Users size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0B1310]">{loading ? "..." : totalLeads}</div>
          <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp size={14} className="text-[#2563EB]" />
            <span>Active database entries</span>
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-2xl bg-white border border-[#E1E6DF] space-y-3 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-amber-600">New Leads</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{loading ? "..." : newLeads}</div>
          <p className="text-[11px] text-amber-600 font-medium">Requires follow-up</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-2xl bg-white border border-[#E1E6DF] space-y-3 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-blue-600">In Pipeline</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">{loading ? "..." : inProgressLeads}</div>
          <p className="text-[11px] text-blue-600 font-medium">Contacted or in negotiation</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-6 rounded-2xl bg-white border border-[#E1E6DF] space-y-3 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-emerald-600">Closed Deals</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{loading ? "..." : closedLeads}</div>
          <p className="text-[11px] text-emerald-600 font-medium">Successfully onboarded</p>
        </motion.div>
      </div>

      {/* RECENT INQUIRIES FEED */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#E1E6DF]">
          <div>
            <h2 className="text-xl font-extrabold uppercase text-[#0B1310] tracking-wide">
              RECENT CLIENT INQUIRIES
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live dispatches from Contact Modal &amp; Healthcare Portal forms.
            </p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-mono font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading inquiries...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">No inquiries recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] hover:border-[#2563EB]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-[#0B1310]">{lead.fullName}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        lead.status === "New"
                          ? "bg-amber-50 text-amber-700 border-amber-300"
                          : lead.status === "In Progress" || lead.status === "Contacted"
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300"
                      }`}
                    >
                      {lead.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-[#E1E6DF]">
                      {lead.service}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-1">{lead.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-[#2563EB]" />
                      {lead.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-600" />
                      {lead.phone}
                    </span>
                    <span>Budget: £ {lead.budget || "N/A"}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href="/admin/leads"
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Manage Entry
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
