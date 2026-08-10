"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Send, Sparkles, PhoneCall, Building2, User, Mail, DollarSign } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  initialService = "",
}: ContactModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("$2,500 - $5,000");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl glass-card border border-blue-500/30 bg-[#0B0F19] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

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
              className="btn-primary px-8 py-3 rounded-xl text-sm"
            >
              Back to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Enterprise Strategy Session</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Book Your Digital & Tech Consultation
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Tell us about your project goals and required service modules.
              </p>
            </div>

            {/* Service Module Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Select Required Services
              </label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((svc) => {
                  const isChecked = selectedServices.includes(svc);
                  return (
                    <button
                      type="button"
                      key={svc}
                      onClick={() => toggleService(svc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isChecked
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                          : "bg-white/[0.03] border-white/10 text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      {isChecked ? `✓ ${svc}` : `+ ${svc}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Apex Innovations Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                  Target Budget
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0B0F19] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="< $2,500">&lt; $2,500 (Starter)</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000 (Growth)</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000 (Scale)</option>
                    <option value="$15,000+">$15,000+ (Enterprise)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] block mb-1.5">
                Project Details & Timeline
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe your objectives, key features, or expected launch date..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3.5 rounded-xl text-sm font-semibold shadow-xl shadow-blue-600/30"
            >
              {loading ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>Submit Consultation Request</span>
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
