"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Building2, Plus, CheckCircle2, Shield } from "lucide-react";

interface TenantItem {
  _id: string;
  name: string;
  domain?: string;
  subscriptionTier: string;
  isActive: boolean;
  modulesEnabled: {
    pms: boolean;
    ats: boolean;
    payroll: boolean;
  };
  createdAt: string;
}

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [tier, setTier] = useState<"basic" | "pro" | "enterprise">("pro");
  const [pmsEnabled, setPmsEnabled] = useState(true);
  const [payrollEnabled, setPayrollEnabled] = useState(true);
  const [atsEnabled, setAtsEnabled] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/v2/tenants");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/hrm/v2/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          domain,
          subscriptionTier: tier,
          isActive: true,
          modulesEnabled: {
            pms: pmsEnabled,
            ats: atsEnabled,
            payroll: payrollEnabled,
          },
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName("");
        setDomain("");
        fetchTenants();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Tenant Companies Management">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">SaaS Tenant Companies</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage institutional accounts, subscription tiers, and module feature flags</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary text-white hover:bg-primary/90 gap-2 font-bold shadow-md">
          <Plus className="h-4 w-4" /> Add New Tenant Company
        </Button>
      </div>

      {/* Tenant List Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">Loading tenants...</div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400">
            No tenant companies created yet. Click "Add New Tenant Company" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Tenant Name</th>
                  <th className="pb-3 font-semibold">Domain</th>
                  <th className="pb-3 font-semibold">Subscription Plan</th>
                  <th className="pb-3 font-semibold">Active Modules</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                {tenants.map((t) => (
                  <tr key={t._id}>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {t.name}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{t.domain || "—"}</td>
                    <td className="py-3 uppercase text-primary font-mono font-bold">{t.subscriptionTier}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {t.modulesEnabled?.pms && (
                          <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                            PMS
                          </span>
                        )}
                        {t.modulesEnabled?.payroll && (
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            Payroll
                          </span>
                        )}
                        {t.modulesEnabled?.ats && (
                          <span className="rounded bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                            ATS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      {t.isActive ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-bold">Suspended</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for creating new tenant */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Register New Tenant Company
            </h3>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Domain Name (Optional)</label>
                <input
                  type="text"
                  placeholder="acme.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Subscription Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as "basic" | "pro" | "enterprise")}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  <option value="basic" className="bg-white dark:bg-slate-900">Basic (Starter)</option>
                  <option value="pro" className="bg-white dark:bg-slate-900">Pro (Standard HRMS + PMS)</option>
                  <option value="enterprise" className="bg-white dark:bg-slate-900">Enterprise (All Modules Enabled)</option>
                </select>
              </div>

              {/* Module Toggles */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/10">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold">Enable Modules for Tenant</label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pmsEnabled}
                    onChange={(e) => setPmsEnabled(e.target.checked)}
                    className="rounded border-gray-300 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-primary"
                  />
                  <span>Project Management System (PMS)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payrollEnabled}
                    onChange={(e) => setPayrollEnabled(e.target.checked)}
                    className="rounded border-gray-300 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-primary"
                  />
                  <span>Payroll & Payslips Engine</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={atsEnabled}
                    onChange={(e) => setAtsEnabled(e.target.checked)}
                    className="rounded border-gray-300 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-primary"
                  />
                  <span>Applicant Tracking System (ATS)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-white font-bold">
                  {submitting ? "Creating..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
