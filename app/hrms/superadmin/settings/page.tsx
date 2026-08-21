"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Key,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe,
  Database,
} from "lucide-react";

export default function SuperAdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  // Platform security
  const [sessionTimeout, setSessionTimeout] = useState(480); // minutes
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);

  // API keys
  const [geolocationKey, setGeolocationKey] = useState("");
  const [paymentGatewayKey, setPaymentGatewayKey] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("razorpay");

  // Firebase Auth sync
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState("2026-08-20 10:30 AM");
  const [syncing, setSyncing] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    // Simulate sync
    await new Promise((r) => setTimeout(r, 2000));
    setLastSync(new Date().toLocaleString());
    setSyncing(false);
  };

  return (
    <AppShell title="Super Admin Settings">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Global platform security, API key management &amp; Firebase Auth sync
          controls
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        {saved && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Settings saved successfully!
          </div>
        )}

        {/* ═══ Global Platform Security ═══ */}
        <SettingsSection
          title="Global Platform Security"
          icon={<Shield className="h-5 w-5 text-primary" />}
          description="Session management, 2FA enforcement, and password policies"
        >
          <div className="space-y-4">
            <SettingsRow
              label="Session Timeout"
              description="Auto-logout after inactivity (minutes)"
            >
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-24 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary text-right"
              />
            </SettingsRow>

            <SettingsRow
              label="Enforce 2FA"
              description="Require two-factor authentication for all users"
            >
              <Toggle
                checked={enforce2FA}
                onChange={setEnforce2FA}
              />
            </SettingsRow>

            <SettingsRow
              label="Minimum Password Length"
              description="Minimum characters required for new passwords"
            >
              <input
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                className="w-24 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary text-right"
              />
            </SettingsRow>

            <SettingsRow
              label="Password Expiry"
              description="Force password reset after N days (0 = never)"
            >
              <input
                type="number"
                value={passwordExpiryDays}
                onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                className="w-24 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary text-right"
              />
            </SettingsRow>
          </div>
        </SettingsSection>

        {/* ═══ API Key Management ═══ */}
        <SettingsSection
          title="API Key Management"
          icon={<Key className="h-5 w-5 text-yellow-500" />}
          description="Geolocation, Payment Gateway and other external API keys"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Globe className="h-3.5 w-3.5 inline mr-1" />
                Geolocation API Key (for Haversine geofencing)
              </label>
              <input
                type="password"
                value={geolocationKey}
                onChange={(e) => setGeolocationKey(e.target.value)}
                placeholder="Enter geolocation service API key"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Key className="h-3.5 w-3.5 inline mr-1" />
                Payment Gateway Key
              </label>
              <div className="flex gap-2">
                <select
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value)}
                  className="w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="stripe">Stripe</option>
                </select>
                <input
                  type="password"
                  value={paymentGatewayKey}
                  onChange={(e) => setPaymentGatewayKey(e.target.value)}
                  placeholder="Enter payment gateway secret key"
                  className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ═══ Firebase Auth Sync ═══ */}
        <SettingsSection
          title="Firebase Auth Sync Controls"
          icon={<Database className="h-5 w-5 text-orange-500" />}
          description="Manage synchronization between Firebase Auth and Firestore user records"
        >
          <div className="space-y-4">
            <SettingsRow
              label="Auto-Sync"
              description="Automatically sync Firebase Auth claims with Firestore on login"
            >
              <Toggle checked={autoSync} onChange={setAutoSync} />
            </SettingsRow>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Last Sync
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lastSync}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSyncNow}
                disabled={syncing}
                className="gap-2 text-xs font-bold border-gray-200 dark:border-white/10"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
                />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>
        </SettingsSection>

        <Button
          type="submit"
          className="bg-primary text-white font-bold px-6 py-2.5 shadow-md"
        >
          Save All Settings
        </Button>
      </form>
    </AppShell>
  );
}

// ── Helpers ─────────────────────────────────────────────

function SettingsSection({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
      <h3 className="font-bold text-base flex items-center gap-2 mb-1">
        {icon} {title}
      </h3>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
        {description}
      </p>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
      <div>
        <span className="text-xs font-semibold text-slate-900 dark:text-white block">
          {label}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
