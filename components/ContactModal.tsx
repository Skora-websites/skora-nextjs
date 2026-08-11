"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Send, Sparkles, User, Mail, Building2, DollarSign, ArrowLeft } from "lucide-react";

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
    "Digital Marketing & Local SEO",
    "Website Design & Web Apps",
    "Branding & Visual Identity",
    "Video Production & Reels",
    "Mobile App Development",
    "Cloud Services & DevOps",
    "SaaS Platform Development",
    "Project Management System (PMS)",
    "Custom CRM & Automations",
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
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        ref={modalContainerRef}
        className="relative my-auto w-full max-w-2xl rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto text-[#0B1310]"
      >
        {/* Top Actions Bar: Return Back Button + Close Cross X Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F8F9F6] hover:bg-[#E8F7ED] text-xs font-bold text-slate-700 border border-[#E2E8F0] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#16A34A]" />
            <span>Return to Previous Page</span>
          </button>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-[#F8F9F6] hover:bg-slate-200 text-slate-500 hover:text-[#0B1310] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#E8F7ED] border border-[#22C55E] text-[#16A34A] flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#0B1310]">
              Consultation Request Received!
            </h3>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
              Thank you, <strong className="text-[#0B1310]">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-[#0B1310]">{email}</strong> within 4 business hours with your custom proposal.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-8 py-3 rounded-xl bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-sm transition-all cursor-pointer shadow-lg"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7ED] text-[11px] font-bold text-[#16A34A] border border-[#22C55E]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Initialize Your Project</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B1310] tracking-tight uppercase">
                Schedule Strategy Consultation
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Select your required capabilities and project scope.
              </p>
            </div>

            {/* Service Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">
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
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#22C55E] text-white border-[#16A34A] shadow-md"
                          : "bg-[#F8F9F6] text-slate-600 border-[#E2E8F0] hover:border-[#22C55E] hover:text-[#0B1310]"
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
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#F8F9F6] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-[#F8F9F6] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-[#F8F9F6] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Estimated Budget
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#F8F9F6] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#0B1310] appearance-none focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors cursor-pointer font-medium"
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
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Project Brief / Requirements
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your goals, timelines, and technical requirements..."
                className="w-full bg-[#F8F9F6] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-xs rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
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
