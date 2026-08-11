"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Send, Sparkles, PhoneCall, Building2, User, Mail, DollarSign, ArrowLeft } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  defaultService?: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  initialService = "",
  defaultService = "",
}: ContactModalProps) {
  const activeService = defaultService || initialService;
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("$2,500 - $5,000");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeService && !selectedServices.includes(activeService)) {
      setSelectedServices([activeService]);
    }
  }, [activeService]);

  const availableServices = [
    "Digital Marketing & AI SEO",
    "Website Design & Web Apps",
    "Mobile App Development",
    "Cloud Services & DevOps",
    "SaaS Platform Development",
    "Project Management System (PMS)",
    "Customer Relationship (CRM)",
  ];

  useEffect(() => {
    if (initialService && !selectedServices.includes(initialService)) {
      setSelectedServices([initialService]);
    }
  }, [initialService]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (svc: string) => {
    if (selectedServices.includes(svc)) {
      setSelectedServices(selectedServices.filter((s) => s !== svc));
    } else {
      setSelectedServices([...selectedServices, svc]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div
        ref={modalContainerRef}
        className="relative my-auto w-full max-w-2xl rounded-3xl glass-card border border-blue-500/40 bg-[#0B0F19] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Top Actions Bar: Return Back Button + Close Cross X Button */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/15 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Return to Previous Page</span>
          </button>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">
              Consultation Request Received!
            </h3>

            <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-white">{email}</strong> within 4 business hours with your custom proposal.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-primary px-8 py-3 rounded-xl text-sm cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-sky-300 border border-sky-500/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Initialize Your Project</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Schedule Strategy Consultation
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Select your required capabilities and project scope.
              </p>
            </div>

            {/* Service Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8] block">
                Required Capabilities
              </label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((svc) => {
                  const isSelected = selectedServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => toggleService(svc)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                          : "bg-white/5 text-[#94A3B8] border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {svc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#05070E] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-[#05070E] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-[#05070E] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                  Estimated Budget
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#05070E] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="< $2,500">Under $2,500</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                    <option value="$15,000+">$15,000+ Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#94A3B8]">
                Project Brief / Requirements
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your goals, timelines, and technical requirements..."
                className="w-full bg-[#05070E] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Dispatch Consultation Request</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
