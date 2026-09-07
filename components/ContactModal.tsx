"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Sparkles, Send, Building2, User, Mail, DollarSign } from "lucide-react";

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
  const serviceToPreselect = initialService || defaultService;

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("₹25,000 - ₹50,000");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableServices = [
    "Website Design & Dev",
    "Branding & Visual Identity",
    "SaaS Architecture",
    "Mobile App Development",
    "Cloud Services & DevOps",
    "CRM System Engineering",
    "Digital Marketing & SEO",
    "Property Mgmt System",
    "Video Production & Reels",
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (serviceToPreselect) {
      const match = availableServices.find(
        (s) => s.toLowerCase() === serviceToPreselect.toLowerCase()
      );
      if (match && !selectedServices.includes(match)) {
        setSelectedServices([match]);
      } else if (!selectedServices.includes(serviceToPreselect)) {
        setSelectedServices([serviceToPreselect]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceToPreselect, isOpen]);

  if (!isOpen) return null;

  const toggleService = (serviceName: string) => {
    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter((s) => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: "+91 92173 75835",
          company,
          service: selectedServices.join(", ") || "General Strategy Consultation",
          budget,
          message,
          source: "Contact Consultation Modal",
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const labelCls = "text-xs font-mono font-bold uppercase tracking-wider text-faint block";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      {/* Backdrop Click to Close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal Content Box — dark glass */}
      <div className="relative my-auto w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] sm:max-h-[88vh] overflow-y-auto z-[100000]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-sub flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full glass-pill flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-ink">
              Consultation Dispatched!
            </h3>
            <p className="text-xs sm:text-sm text-sub max-w-md mx-auto font-medium leading-relaxed">
              Thank you, <strong className="text-ink">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-ink">{email}</strong> within 4 business hours with your custom proposal.
            </p>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-primary px-8 py-3 text-sm"
            >
              Return to Website
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Initialize Your Project</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Schedule Strategy Consultation
              </h2>
              <p className="text-xs text-faint font-medium">
                Select your required capabilities and project scope.
              </p>
            </div>

            {/* Service Multi-Select */}
            <div className="space-y-2">
              <label className={labelCls}>
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
                          ? "bg-accent text-white border-accent shadow-md"
                          : "bg-white/5 text-sub border-white/10 hover:border-accent/60 hover:text-ink"
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
                <label className={labelCls}>
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input-dark pl-10 pr-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="input-dark pl-10 pr-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="input-dark pl-10 pr-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>
                  Estimated Budget
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="input-dark pl-10 pr-4 py-2.5 text-xs appearance-none cursor-pointer"
                  >
                    <option value="< ₹25,000" className="bg-surface">Under ₹25,000</option>
                    <option value="₹25,000 - ₹50,000" className="bg-surface">₹25,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,50,000" className="bg-surface">₹50,000 - ₹1,50,000</option>
                    <option value="₹1,50,000+" className="bg-surface">₹1,50,000+ Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelCls}>
                Project Brief / Requirements
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your goals, timelines, and technical requirements..."
                className="input-dark p-3 text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-xs"
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
