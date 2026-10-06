"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Globe, ListTree, Plus, Search, Share2, ShieldCheck, X } from "lucide-react";
import SerpPreview from "@/components/admin/SerpPreview";
import { applyTitleTemplate, defaultGlobalSeo, type GlobalSeo, type SocialProfile } from "@/lib/blog";
import { SOCIAL_PLATFORMS } from "@/lib/socials";
import { inputClass, labelClass } from "@/components/admin/styles";

export default function AdminSeoPage() {
  const [seo, setSeo] = useState<GlobalSeo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/seo", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load SEO settings.");
        } else {
          setSeo(data.data.seo);
        }
      } catch {
        if (!cancelled) setError("Failed to load SEO settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof GlobalSeo>(key: K, value: GlobalSeo[K]) => {
    setSeo((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    // Drop half-filled rows and surface bad URLs here rather than letting the
    // server reject (or silently skip) the whole save.
    const socials: SocialProfile[] = (seo.socials ?? [])
      .map((s) => ({
        platform: String(s.platform || "").trim().toLowerCase(),
        url: String(s.url || "").trim(),
        ...(s.label ? { label: String(s.label).trim() } : {}),
      }))
      .filter((s) => s.platform && s.url);

    const invalidSocial = socials.find((s) => !/^https?:\/\//i.test(s.url));
    if (invalidSocial) {
      setError("Social profile links must start with https:// or http://.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: { ...seo, socials } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save SEO settings.");
        return;
      }
      setSeo(data.data.seo);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
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

  if (!seo) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
        <CircleAlert size={18} /> {error || "SEO settings could not be loaded."}
      </div>
    );
  }

  const socials = seo.socials ?? [];
  const updateSocials = (next: SocialProfile[]) => set("socials", next);
  const updateSocial = (index: number, next: SocialProfile) =>
    updateSocials(socials.map((profile, i) => (i === index ? next : profile)));

  // Mirrors app/robots.ts exactly, so what admins see is what is served.
  const robotsText = !seo.robotsEnabled
    ? ["User-Agent: *", "Disallow: /"].join("\n")
    : [
        "User-Agent: *",
        "Allow: /",
        ...(seo.robotsDisallow.length ? seo.robotsDisallow : ["/admin", "/api"]).map((p) => `Disallow: ${p}`),
        seo.sitemapEnabled
          ? `\nSitemap: ${seo.canonicalBase.replace(/\/+$/, "") || defaultGlobalSeo.canonicalBase}/sitemap.xml`
          : "",
      ]
        .filter((line) => line !== "")
        .join("\n");

  const previewTitle = applyTitleTemplate(seo.titleTemplate, seo.defaultTitle, seo.siteName);

  return (
    <form onSubmit={handleSave} className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <span className="kicker mb-2">SEO</span>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            Site-wide <span className="display-accent text-accent">SEO.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Defaults used by every page that does not define its own meta tags, plus robots.txt and the XML sitemap.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={16} /> Save SEO settings
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2">
          <CircleAlert size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 size={18} /> SEO settings saved — applied across the site, sitemap and robots.txt.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* IDENTITY & DEFAULTS */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-5 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-[#0B1310]">Default meta tags</h2>
              <p className="text-xs text-slate-500 font-medium">Homepage &amp; fallback titles and descriptions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Site name</label>
              <input
                type="text"
                value={seo.siteName}
                onChange={(e) => set("siteName", e.target.value)}
                placeholder="SKORA"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Site URL (canonical base)</label>
              <input
                type="url"
                value={seo.canonicalBase}
                onChange={(e) => set("canonicalBase", e.target.value)}
                placeholder={defaultGlobalSeo.canonicalBase}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Title template</label>
            <input
              type="text"
              value={seo.titleTemplate}
              onChange={(e) => set("titleTemplate", e.target.value)}
              placeholder="%s | SKORA"
              className={`${inputClass} font-mono`}
            />
            <p className="text-[11px] text-slate-500 font-medium">
              <code className="font-mono text-[#2563EB]">%s</code> is replaced by the page title. Preview:{" "}
              <span className="font-bold text-[#0B1310]">{previewTitle}</span>
            </p>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Default page title</label>
            <input
              type="text"
              value={seo.defaultTitle}
              onChange={(e) => set("defaultTitle", e.target.value)}
              maxLength={70}
              className={inputClass}
            />
            <span className="font-mono text-[10px] text-slate-400">{seo.defaultTitle.length}/60</span>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Default meta description</label>
            <textarea
              value={seo.defaultDescription}
              onChange={(e) => set("defaultDescription", e.target.value)}
              rows={3}
              maxLength={180}
              className={`${inputClass} resize-none`}
            />
            <span className="font-mono text-[10px] text-slate-400">{seo.defaultDescription.length}/160</span>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Default keywords</label>
            <input
              type="text"
              value={seo.defaultKeywords.join(", ")}
              onChange={(e) =>
                set(
                  "defaultKeywords",
                  e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                )
              }
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Default social image URL</label>
              <input
                type="url"
                value={seo.ogImage}
                onChange={(e) => set("ogImage", e.target.value)}
                placeholder="Leave empty to use the generated card"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-500 font-medium leading-snug">
                Optional. Leave empty and Next serves the generated 1200×630 card from{" "}
                <code className="font-mono">app/opengraph-image.tsx</code>. Setting a URL here
                overrides that image on every page — only set one you know resolves.
              </p>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Twitter / X handle</label>
              <input
                type="text"
                value={seo.twitterHandle}
                onChange={(e) => set("twitterHandle", e.target.value)}
                placeholder="@skoradigital"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* PREVIEW + CRAWL SETTINGS */}
        <div className="space-y-6">
          <SerpPreview
            url={seo.canonicalBase}
            title={seo.defaultTitle}
            description={seo.defaultDescription}
          />

          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase text-[#0B1310]">Crawling &amp; indexing</h2>
                <p className="text-xs text-slate-500 font-medium">robots.txt and sitemap.xml behaviour.</p>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#F4F6F1] border border-[#E1E6DF] cursor-pointer">
              <span className="space-y-0.5">
                <span className="block text-xs font-black uppercase text-[#0B1310]">Allow search engines</span>
                <span className="block text-[11px] font-medium text-slate-500">
                  Off = robots.txt blocks every route.
                </span>
              </span>
              <input
                type="checkbox"
                checked={seo.robotsEnabled}
                onChange={(e) => set("robotsEnabled", e.target.checked)}
                className="rounded border-slate-400 text-[#2563EB] focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#F4F6F1] border border-[#E1E6DF] cursor-pointer">
              <span className="space-y-0.5">
                <span className="block text-xs font-black uppercase text-[#0B1310]">Publish XML sitemap</span>
                <span className="block text-[11px] font-medium text-slate-500">
                  All published posts at /sitemap.xml.
                </span>
              </span>
              <input
                type="checkbox"
                checked={seo.sitemapEnabled}
                onChange={(e) => set("sitemapEnabled", e.target.checked)}
                className="rounded border-slate-400 text-[#2563EB] focus:ring-0"
              />
            </label>

            <div className="space-y-1">
              <label className={labelClass}>Blocked paths (one per line)</label>
              <textarea
                value={seo.robotsDisallow.join("\n")}
                onChange={(e) =>
                  set(
                    "robotsDisallow",
                    e.target.value.split("\n").map((p) => p.trim()).filter(Boolean)
                  )
                }
                rows={3}
                placeholder={"/admin\n/api"}
                className={`${inputClass} resize-none font-mono`}
              />
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-slate-500">
                <Globe size={12} /> robots.txt preview
              </span>
              <pre className="p-4 rounded-xl bg-[#0B1310] text-[#9fe8c7] text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {robotsText}
              </pre>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Analytics / GTM measurement ID</label>
              <input
                type="text"
                value={seo.analyticsId}
                onChange={(e) => set("analyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={`${inputClass} font-mono`}
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Stored here; wire it to your tag manager script when you add analytics to the site.
              </p>
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl space-y-3">
            <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              <ListTree size={13} /> Sitemap preview
            </span>
            <ul className="space-y-1.5 text-[11px] font-mono text-slate-600">
              <li className="flex justify-between gap-3">
                <span>/</span>
                <span className="text-slate-400">priority 1.0</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>/insights</span>
                <span className="text-slate-400">priority 0.9</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-[#2563EB]">/&lt;each published post&gt;</span>
                <span className="text-slate-400">priority 0.7</span>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* Social profiles — the footer icon row */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl space-y-5">
        <div className="space-y-1.5">
          <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            <Share2 size={13} /> Social profiles
          </span>
          <p className="max-w-2xl text-xs font-medium text-slate-500">
            Rendered as the icon row in the footer. Rows with an empty URL are dropped on save, so a
            half-filled profile never shows up as a dead link.
          </p>
        </div>

        <div className="space-y-3">
          {socials.map((profile, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-[#E1E6DF] bg-[#F4F6F1] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-1.5 sm:w-44 sm:shrink-0">
                  <label className={labelClass} htmlFor={`social-platform-${index}`}>
                    Network
                  </label>
                  <select
                    id={`social-platform-${index}`}
                    value={profile.platform}
                    onChange={(e) => updateSocial(index, { ...profile, platform: e.target.value })}
                    className={inputClass}
                  >
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform.key} value={platform.key}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>

                {profile.platform === "other" && (
                  <div className="space-y-1.5 sm:w-44 sm:shrink-0">
                    <label className={labelClass} htmlFor={`social-label-${index}`}>
                      Label
                    </label>
                    <input
                      id={`social-label-${index}`}
                      value={profile.label ?? ""}
                      onChange={(e) => updateSocial(index, { ...profile, label: e.target.value })}
                      placeholder="Behance"
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="flex flex-1 items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <label className={labelClass} htmlFor={`social-url-${index}`}>
                      Profile URL
                    </label>
                    <input
                      id={`social-url-${index}`}
                      type="url"
                      value={profile.url}
                      onChange={(e) => updateSocial(index, { ...profile, url: e.target.value })}
                      placeholder="https://www.linkedin.com/company/skora"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSocials(socials.filter((_, i) => i !== index))}
                    aria-label={`Remove ${profile.platform} profile`}
                    className="mb-[3px] flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border border-[#E1E6DF] bg-white text-slate-500 transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {socials.length === 0 && (
            <p className="text-[11px] font-medium text-slate-500">
              No profiles yet — the footer hides the social row until at least one link is saved.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => updateSocials([...socials, { platform: "linkedin", url: "" }])}
          className="inline-flex items-center gap-2 rounded-xl border border-[#2563EB]/30 px-4 py-2.5 text-xs font-bold text-[#2563EB] transition-colors hover:bg-[#2563EB]/5"
        >
          <Plus size={14} /> Add profile
        </button>
      </section>
    </form>
  );
}
