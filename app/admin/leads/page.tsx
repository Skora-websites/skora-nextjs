"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Lead["status"]) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead entry?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead(null);
        }
      }
    } catch (err) {
      alert("Failed to delete lead.");
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Full Name", "Email", "Phone", "Company", "Service", "Budget", "Message", "Status", "Date"];
    const rows = leads.map((l) => [
      l.id,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.email.replace(/"/g, '""')}"`,
      `"${l.phone.replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      `"${(l.budget || "").replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      l.status,
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `skora_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 text-[11px] font-mono font-bold text-[#2563EB] mb-2">
            <Sparkles size={12} />
            <span>✦ SKORA INFO CRM SUITE ✦</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#0B1310] tracking-tight">
            CLIENT ENQUIRIES ({leads.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Search, filter, update status, and export client consultation requests.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, phone, or service..."
            className="w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors shadow-sm"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <Filter size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors cursor-pointer appearance-none font-mono shadow-sm"
          >
            <option value="ALL">ALL STATUSES ({leads.length})</option>
            <option value="New">NEW ({leads.filter((l) => l.status === "New").length})</option>
            <option value="Contacted">CONTACTED ({leads.filter((l) => l.status === "Contacted").length})</option>
            <option value="In Progress">IN PROGRESS ({leads.filter((l) => l.status === "In Progress").length})</option>
            <option value="Closed">CLOSED ({leads.filter((l) => l.status === "Closed").length})</option>
          </select>
        </div>
      </div>

      {/* LEADS TABLE / LIST */}
      <div className="rounded-3xl bg-white border border-[#E1E6DF] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-xs">Loading lead records...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs">
            No matching leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F4F6F1] border-b border-[#E1E6DF] text-slate-600 uppercase font-mono tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5 font-bold">Client / Company</th>
                  <th className="p-4 sm:p-5 font-bold">Contact Details</th>
                  <th className="p-4 sm:p-5 font-bold">Service &amp; Budget</th>
                  <th className="p-4 sm:p-5 font-bold">Status</th>
                  <th className="p-4 sm:p-5 font-bold">Date</th>
                  <th className="p-4 sm:p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E6DF] font-medium">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F4F6F1]/60 transition-colors">
                    <td className="p-4 sm:p-5">
                      <div className="font-bold text-[#0B1310] text-sm">{lead.fullName}</div>
                      <div className="text-[11px] text-slate-500">{lead.company || "Individual Inquiry"}</div>
                    </td>

                    <td className="p-4 sm:p-5 space-y-1">
                      <a href={`mailto:${lead.email}`} className="block hover:text-[#2563EB] transition-colors font-semibold">
                        {lead.email}
                      </a>
                      <a href={`tel:${lead.phone}`} className="block hover:text-emerald-600 transition-colors font-mono font-bold">
                        {lead.phone}
                      </a>
                    </td>

                    <td className="p-4 sm:p-5">
                      <div className="text-[#0B1310] font-bold">{lead.service}</div>
                      <div className="text-[11px] font-mono text-[#2563EB] font-bold">£ {lead.budget || "N/A"}</div>
                    </td>

                    <td className="p-4 sm:p-5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value as Lead["status"])}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border cursor-pointer outline-none ${
                          lead.status === "New"
                            ? "bg-amber-50 text-amber-700 border-amber-300"
                            : lead.status === "Contacted" || lead.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-300"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="p-4 sm:p-5 font-mono text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 sm:p-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 rounded-lg bg-[#EFF6FF] hover:bg-[#2563EB] text-[#2563EB] hover:text-white transition-colors cursor-pointer border border-[#2563EB]/20"
                        title="View Lead Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer border border-red-200"
                        title="Delete Lead"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LEAD DETAIL MODAL */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white border border-[#E1E6DF] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#0B1310]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E1E6DF]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase">{selectedLead.fullName}</h2>
                    <p className="text-xs font-mono text-slate-500">{selectedLead.company || "Individual Inquiry"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl bg-[#F4F6F1] hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Email Address</span>
                  <a href={`mailto:${selectedLead.email}`} className="block text-[#2563EB] font-bold truncate">
                    {selectedLead.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Phone / WhatsApp</span>
                  <a href={`tel:${selectedLead.phone}`} className="block text-emerald-600 font-bold">
                    {selectedLead.phone}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Target Service</span>
                  <p className="text-[#0B1310] font-bold">{selectedLead.service}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-1">
                  <span className="text-slate-500 uppercase text-[10px] font-bold">Estimated Budget</span>
                  <p className="text-[#2563EB] font-bold">£ {selectedLead.budget || "N/A"}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-500">Client Requirement Message</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
                  {selectedLead.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] font-mono text-slate-500">
                  Submitted: {new Date(selectedLead.createdAt).toLocaleString()}
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    Contact WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
