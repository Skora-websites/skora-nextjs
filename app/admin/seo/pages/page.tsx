"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileText,
  Globe,
  RotateCcw,
  Save,
  Search,
} from "lucide-react";
import SerpPreview from "@/components/admin/SerpPreview";
import { inputClass, labelClass } from "@/components/admin/styles";
import { type GlobalSeo } from "@/lib/blog";
import {
  PAGE_SEO_REGISTRY,
  buildPageMetadata,
  emptyPageSeoOverride,
  getPageSeoEntry,
  hasPageSeoOverride,
  renderedTitle,
  type PageSeoOverride,
  type PageSeoPath,
} from "@/lib/page-seo";

interface RegistryItem {
  path: PageSeoPath;
  label: string;
  group: string;
}

interface LoadState {
  global: GlobalSeo;
  overrides: Record<string, PageSeoOverride>;
  registry: RegistryItem[];
}

/** Live counters, matching the limits the parser actually enforces. */
const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;

export default function AdminPageSeoPage() {
  const router = useRouter();

  const [state, setState] = useState<LoadState | null>(null);
  const [activePath, setActivePath] = useState<PageSeoPath>("/");
  const [form, setForm] = useState<PageSeoOverride>(emptyPageSeoOverride);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Load the registry and stored overrides once. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/seo/pages", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load per-page SEO settings.");
          return;
        }
        setState(data.data as LoadState);
      } catch {
        if (!cancelled) setError("Failed to load per-page SEO settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Switching pages always loads that page's stored record, blank if none. */
  const selectPath = useCallback(
    (path: PageSeoPath) => {
      setActivePath(path);
      setForm(state?.overrides[path] ?? emptyPageSeoOverride());
      setError(null);
      setSuccess(false);
    },
    [state]
  );

  const set = useCallback(<K extends keyof PageSeoOverride>(key: K, value: PageSeoOverride[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * The metadata this form would produce, built by the exact function the live
   * page calls. That is the point: the preview cannot drift from what is served,
   * because it is not a re-implementation of it.
   */
  const preview = useMemo(() => {
    if (!state) return null;
    try {
      return buildPageMetadata(activePath, {
        global: state.global,
        // The form is the source of truth here, not the stored map — otherwise
        // the preview would lag a keystroke behind.
        overrides: { ...state.overrides, [activePath]: form },
      });
    } catch {
      return null;
    }
  }, [state, activePath, form]);

  const effectiveTitle = useMemo(
    () => (preview && state ? renderedTitle(preview, state.global) : ""),
    [preview, state]
  );
  const effectiveDescription = typeof preview?.description === "string" ? preview.description : "";
  const isOverridden = hasPageSeoOverride(state?.overrides[activePath]);

  /** Registry entries grouped for the sidebar, preserving declaration order. */
  const grouped = useMemo(() => {
    const map = new Map<string, RegistryItem[]>();
    for (const entry of PAGE_SEO_REGISTRY) {
      const group = entry.group;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push({ path: entry.path, label: entry.label, group });
    }
    return [...map.entries()];
  }, []);

  const save = async (reset = false) => {
    if (!state) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/seo/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { path: activePath, reset: true } : { path: activePath, seo: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save this page's SEO.");
        return;
      }
      setState((prev) => (prev ? { ...prev, overrides: data.data.overrides } : prev));
      if (reset) setForm(emptyPageSeoOverride());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      // Revalidation is marked, not immediate — the page picks the change up on
      // its next visit, so make the admin land on it to see it.
      router.refresh();
    } catch {
      setError("Network error — settings not saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
        <CircleAlert size={18} /> {error || "Per-page SEO settings could not be loaded."}
      </div>
    );
  }

  const entry = getPageSeoEntry(activePath);

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <span className="kicker mb-2">SEO</span>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            Page <span className="display-accent text-accent">SEO.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Per-page metadata for the eight static marketing routes. Leave a field blank to fall back
            to its code default.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => save(true)}
            disabled={saving || !isOverridden}
            title={isOverridden ? "Delete this override" : "Nothing to reset"}
            className="px-4 py-3 rounded-xl border border-[#E1E6DF] bg-white text-slate-600 font-black text-xs uppercase tracking-wider transition-colors hover:border-slate-300 inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} /> Save Page
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
          <CircleAlert size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 size={18} /> Saved — the live page picks this up on its next visit.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
        {/* Page list */}
        <nav className="lg:sticky lg:top-6 p-4 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl space-y-4">
          {grouped.map(([group, items]) => (
            <div key={group}>
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2 mb-2">
                {group}
              </h2>
              <ul className="space-y-1">
                {items.map((item) => {
                  const active = item.path === activePath;
                  const edited = hasPageSeoOverride(state.overrides[item.path]);
                  return (
                    <li key={item.path}>
                      <button
                        type="button"
                        onClick={() => selectPath(item.path)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                          active
                            ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                            : "text-slate-600 hover:bg-[#F4F6F1] hover:text-[#0B1310]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {edited && (
                          <span
                            className={`shrink-0 text-[9px] font-black uppercase tracking-widest ${
                              active ? "text-white/70" : "text-accent"
                            }`}
                          >
                            Edited
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Editor */}
        <div className="space-y-6 min-w-0">
          {/* Live preview */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                <Globe size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black uppercase text-[#0B1310]">
                  {entry?.label}
                </h2>
                <p className="text-xs text-slate-500 font-medium font-mono truncate">{activePath}</p>
              </div>
              <a
                href={activePath}
                target="_blank"
                rel="noreferrer"
                className="ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
              >
                View live <ExternalLink size={13} />
              </a>
            </div>

            <SerpPreview
              url={activePath}
              title={effectiveTitle}
              description={effectiveDescription}
            />

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Rendered <code className="font-mono">&lt;title&gt;</code> includes the site title
              template from <code className="font-mono">SEO Settings</code>, which is why it is
              longer than the field below.
            </p>
          </section>

          {/* Search appearance */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                <Search size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase text-[#0B1310]">Search appearance</h2>
                <p className="text-xs text-slate-500 font-medium">
                  What searchers see. Blank fields fall back to the code default.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Meta title"
                hint={
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      form.metaTitle.length > TITLE_LIMIT ? "text-red-500" : "text-slate-400"
                    }`}
                  >
                    {form.metaTitle.length}/{TITLE_LIMIT}
                  </span>
                }
              >
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => set("metaTitle", e.target.value)}
                  maxLength={120}
                  placeholder={entry?.defaults(state.global).metaTitle || "Uses the code default"}
                  className={inputClass}
                />
              </Field>

              <Field label="Keywords" hint={<span className="font-mono text-[10px] text-slate-400">comma separated</span>}>
                <input
                  type="text"
                  value={form.keywords.join(", ")}
                  onChange={(e) =>
                    set(
                      "keywords",
                      e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Defaults to the code default"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label="Meta description"
              hint={
                <span
                  className={`font-mono text-[10px] font-bold ${
                    form.metaDescription.length > DESC_LIMIT ? "text-red-500" : "text-slate-400"
                  }`}
                >
                  {form.metaDescription.length}/{DESC_LIMIT}
                </span>
              }
            >
              <textarea
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                rows={3}
                maxLength={320}
                placeholder={entry?.defaults(state.global).metaDescription || "Uses the code default"}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Canonical URL" hint={<span className="font-mono text-[10px] text-slate-400">{activePath}</span>}>
              <input
                type="text"
                value={form.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder={activePath}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </section>

          {/* Social sharing */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
              <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase text-[#0B1310]">Social sharing</h2>
                <p className="text-xs text-slate-500 font-medium">
                  The card shown when this page is shared.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Social title" hint={<span className="font-mono text-[10px] text-slate-400">optional</span>}>
                <input
                  type="text"
                  value={form.ogTitle}
                  onChange={(e) => set("ogTitle", e.target.value)}
                  maxLength={120}
                  placeholder={effectiveTitle || "Uses the page title"}
                  className={inputClass}
                />
              </Field>
              <Field label="Social image URL" hint={<span className="font-mono text-[10px] text-slate-400">optional</span>}>
                <input
                  type="url"
                  value={form.ogImage}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="Leave blank for the generated card"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Social description" hint={<span className="font-mono text-[10px] text-slate-400">optional</span>}>
              <textarea
                value={form.ogDescription}
                onChange={(e) => set("ogDescription", e.target.value)}
                rows={2}
                maxLength={320}
                placeholder={effectiveDescription || "Uses the page description"}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Twitter / X card">
                <select
                  value={form.twitterCard}
                  onChange={(e) => set("twitterCard", e.target.value as PageSeoOverride["twitterCard"])}
                  className={inputClass}
                >
                  <option value="summary_large_image">Summary with large image</option>
                  <option value="summary">Summary</option>
                </select>
              </Field>
              <Field label="Page type">
                <select
                  value={form.schemaType}
                  onChange={(e) => set("schemaType", e.target.value as PageSeoOverride["schemaType"])}
                  className={inputClass}
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Indexing */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] cursor-pointer">
              <input
                type="checkbox"
                checked={form.noindex}
                onChange={(e) => set("noindex", e.target.checked)}
                className="mt-0.5 rounded border-slate-400 text-[#2563EB] focus:ring-0"
              />
              <span className="space-y-1">
                <span className="block text-xs font-black uppercase text-[#0B1310]">
                  Ask search engines not to index this page
                </span>
                <span className="block text-[11px] font-medium text-slate-500">
                  Adds <code className="font-mono">noindex</code> and removes this page from the sitemap.
                </span>
              </span>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Label on the left, character counter on the right, control below. */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label className={labelClass}>{label}</label>
        {hint}
      </div>
      {children}
    </div>
  );
}