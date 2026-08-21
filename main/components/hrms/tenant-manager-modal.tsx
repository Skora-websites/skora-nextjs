'use client';

import { useState } from 'react';
import { Plus, Building2, User, Mail, Lock, DollarSign, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { createTenantWithHRAdmin } from '@/lib/actions/hrms-actions';

export function TenantManagerModal({ onCreated }: { onCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    latitude: '28.6007594',
    longitude: '77.4319307',
    radiusMeters: '100',
    hrAdminName: '',
    hrAdminEmail: '',
    hrAdminPassword: 'password123',
    hrAdminSalary: '95000'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await createTenantWithHRAdmin({
        name: formData.name,
        domain: formData.domain,
        latitude: parseFloat(formData.latitude) || 28.6007594,
        longitude: parseFloat(formData.longitude) || 77.4319307,
        radiusMeters: parseInt(formData.radiusMeters) || 100,
        hrAdminName: formData.hrAdminName,
        hrAdminEmail: formData.hrAdminEmail,
        hrAdminPassword: formData.hrAdminPassword,
        hrAdminSalary: parseFloat(formData.hrAdminSalary) || 95000
      });

      if (res.success) {
        setSuccess(`Organization "${formData.name}" & HR Admin "${formData.hrAdminName}" created successfully!`);
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant & HR admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Create Organization & HR Admin</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-section-in my-8 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Setup Organization & Assign HR Admin</h2>
                  <p className="text-xs text-slate-400">Configure client tenant, 100m geofence coords, and create lead HR Administrator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Organization Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corporation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Office Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Office Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">Geofence Radius</label>
                    <input
                      type="number"
                      value={formData.radiusMeters}
                      onChange={(e) => setFormData({ ...formData, radiusMeters: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">2. Assigned HR Administrator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">HR Admin Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor"
                      value={formData.hrAdminName}
                      onChange={(e) => setFormData({ ...formData, hrAdminName: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">HR Admin Email</label>
                    <input
                      type="email"
                      placeholder="e.g. hr@acme.com"
                      value={formData.hrAdminEmail}
                      onChange={(e) => setFormData({ ...formData, hrAdminEmail: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">HR Initial Password</label>
                    <input
                      type="text"
                      value={formData.hrAdminPassword}
                      onChange={(e) => setFormData({ ...formData, hrAdminPassword: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Base Monthly Salary (₹ / $)</label>
                    <input
                      type="number"
                      value={formData.hrAdminSalary}
                      onChange={(e) => setFormData({ ...formData, hrAdminSalary: e.target.value })}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition-all"
                >
                  {loading ? 'Creating Organization & HR Admin...' : 'Save & Provision Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
