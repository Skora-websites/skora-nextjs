"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FileText,
  Save,
  Search,
  Send,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SerpPreview from "@/components/admin/SerpPreview";
import { slugify, stripHtml } from "@/lib/blog";

interface EditorSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  noindex: boolean;
  schemaType: "BlogPosting" | "Article";
}

interface EditorState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  seo: EditorSeo;
}

const emptyState: EditorState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "",
  category: "",
  tags: "",
  status: "draft",
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    noindex: false,
    schemaType: "BlogPosting",
  },
};

const inputClass =
  "w-full bg-white border border-[#E1E6DF] rounded-xl px-3 py-2.5 text-xs text-[#0B1310] font-bold placeholder:font-medium placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none transition-colors";
const labelClass = "text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5";

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

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E1E6DF] space-y-6 shadow-xl">
      <div className="flex items-center gap-3 pb-4 border-b border-[#E1E6DF]">
        <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20">{icon}</div>
        <div>
          <h2 className="text-lg font-black uppercase text-[#0B1310]">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [id, setId] = useState<string | undefined>(postId);
  const [form, setForm] = useState<EditorState>(emptyState);
  const [slugTouched, setSlugTouched] = useState(Boolean(postId));
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const set = useCallback(<K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setSeo = useCallback((key: keyof EditorSeo, value: EditorSeo[keyof EditorSeo]) => {
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } as EditorSeo }));
  }, []);

  // ── Load an existing post ──────────────────────────
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/posts/${postId}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load the post.");
          setLoading(false);
          return;
        }
        const post = data.data.post;
        setForm({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          coverImage: post.coverImage || "",
          author: post.author || "",
          category: post.category || "",
          tags: (post.tags || []).join(", "),
          status: post.status === "published" ? "published" : "draft",
          seo: { ...emptyState.seo, ...(post.seo || {}) },
        });
        setId(post.id);
      } catch {
        if (!cancelled) setError("Failed to load the post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  // ── Save ───────────────────────────────────────────
  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      setError("A post title is required.");
      setActiveTab("content");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(null);

    const payload = {
      ...form,
      status,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      seo: { ...form.seo },
    };

    try {
      const res = await fetch(id ? `/api/posts/${id}` : "/api/posts", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save the post.");
        return;
      }
      const post = data.data.post;
      setSaved(status === "published" ? "Post published — the live page is ready." : "Draft saved.");
      setForm((prev) => ({ ...prev, status, slug: post.slug }));
      setSlugTouched(true);
      if (!id) {
        setId(post.id);
        router.replace(`/admin/blog/${post.id}`);
      }
      setTimeout(() => setSaved(null), 5000);
    } catch {
      setError("Network error — the post was not saved.");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived SEO values ─────────────────────────────
  const seoUrl = (form.seo.canonicalUrl || `/blog/${form.slug || slugify(form.title) || "your-post"}`).replace(
    /^https?:\/\/[^/]+/,
    ""
  );
  const seoTitle = form.seo.metaTitle || form.title;
  const seoDescription = form.seo.metaDescription || form.excerpt;
  const wordCount = useMemo(() => stripHtml(form.content).split(/\s+/).filter(Boolean).length, [form.content]);

  const checklist = useMemo(() => {
    const titleLen = seoTitle.trim().length;
    const descLen = seoDescription.trim().length;
    const items = [
      { ok: titleLen >= 30 && titleLen <= 60, label: `Meta title 30–60 chars (now ${titleLen})` },
      { ok: descLen >= 70 && descLen <= 160, label: `Meta description 70–160 chars (now ${descLen})` },
      { ok: Boolean(form.slug), label: "URL slug set" },
      { ok: form.seo.keywords.length > 0, label: "Focus keywords added" },
      { ok: Boolean(form.coverImage), label: "Cover image added" },
      { ok: Boolean(form.excerpt.trim()), label: "Excerpt added" },
      { ok: wordCount >= 100, label: `Article has 100+ words (now ${wordCount})` },
      { ok: !form.seo.noindex, label: "Indexable by search engines" },
    ];
    return items;
  }, [seoTitle, seoDescription, form, wordCount]);

  const score = Math.round((checklist.filter((i) => i.ok).length / checklist.length) * 100);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div className="space-y-1">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-slate-500 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft size={13} /> All posts
          </Link>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            {id ? "Edit " : "New "}
            <span className="display-accent text-accent">post.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {id
              ? "Update the article, its search metadata, then publish."
              : "Write the article, tune its SEO, then publish it to /blog."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-5 py-3 rounded-xl bg-white border border-[#E1E6DF] text-[#0B1310] font-black text-xs uppercase tracking-wider hover:border-slate-400 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save size={15} /> Save draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={15} /> {form.status === "published" ? "Update & publish" : "Publish"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-2"
        >
          <CircleAlert size={18} /> {error}
        </motion.div>
      )}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2"
        >
          <CheckCircle2 size={18} /> {saved}
          {form.status === "published" && (
            <Link
              href={`/blog/${form.slug}`}
              target="_blank"
              className="ml-auto inline-flex items-center gap-1 text-emerald-700 underline"
            >
              View page <ExternalLink size={12} />
            </Link>
          )}
        </motion.div>
      )}

      {/* Tabs (mobile) / Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* Section tabs */}
          <div className="flex gap-2 lg:hidden">
            {(
              [
                { key: "content", label: "Content", icon: <FileText size={14} /> },
                { key: "seo", label: "SEO", icon: <Search size={14} /> },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-white text-slate-600 border-[#E1E6DF]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {tab.icon} {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── CONTENT ───────────────────────────── */}
          <div className={activeTab === "content" ? "space-y-6" : "hidden lg:block lg:space-y-6"}>
            <Card
              icon={<FileText size={20} />}
              title="Article content"
              subtitle="Title, URL, summary and the article body."
            >
              <div className="space-y-2">
                <Field label="Post title">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title,
                        slug: slugTouched ? prev.slug : slugify(title),
                      }));
                    }}
                    placeholder="e.g. How AI Search Is Redefining Patient Acquisition"
                    className={`${inputClass} text-base py-3`}
                  />
                </Field>

                <Field
                  label="URL slug"
                  hint={
                    <span className="font-mono text-[10px] text-slate-400 break-all">
                      /blog/{form.slug || "…"}
                    </span>
                  }
                >
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", slugify(e.target.value));
                    }}
                    placeholder="auto-generated-from-title"
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>

              <Field label="Excerpt" hint={<span className="font-mono text-[10px] text-slate-400">{form.excerpt.length}/160</span>}>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  rows={2}
                  maxLength={160}
                  placeholder="One-paragraph summary shown on the blog index and used as the meta description fallback."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Cover image URL">
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={(e) => set("coverImage", e.target.value)}
                    placeholder="https://…/article-cover.jpg"
                    className={inputClass}
                  />
                </Field>
                <Field label="Author">
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => set("author", e.target.value)}
                    placeholder="SKORA Editorial Team"
                    className={inputClass}
                  />
                </Field>
                <Field label="Category">
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="Digital Marketing"
                    className={inputClass}
                  />
                </Field>
                <Field label="Tags" hint={<span className="font-mono text-[10px] text-slate-400">comma separated</span>}>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="seo, ai, healthcare"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Article body</label>
                  <span className="font-mono text-[10px] font-bold text-slate-400">{wordCount} words</span>
                </div>
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => set("content", html)}
                  placeholder="Write the article. Use the toolbar for headings, lists, links and images…"
                />
              </div>

              {form.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-2xl border border-[#E1E6DF]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </Card>
          </div>

          {/* ── SEO ───────────────────────────────── */}
          <div className={activeTab === "seo" ? "space-y-6" : "hidden lg:block lg:space-y-6"}>
            <Card
              icon={<Search size={20} />}
              title="Search engine optimisation"
              subtitle="Meta tags, social preview and indexing for this post."
            >
              <SerpPreview url={seoUrl} title={seoTitle} description={seoDescription} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Meta title"
                  hint={
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        form.seo.metaTitle.length > 60 ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      {form.seo.metaTitle.length}/60
                    </span>
                  }
                >
                  <input
                    type="text"
                    value={form.seo.metaTitle}
                    onChange={(e) => setSeo("metaTitle", e.target.value)}
                    maxLength={70}
                    placeholder={form.title || "Defaults to the post title"}
                    className={inputClass}
                  />
                </Field>

                <Field label="Focus keywords" hint={<span className="font-mono text-[10px] text-slate-400">comma separated</span>}>
                  <input
                    type="text"
                    value={form.seo.keywords.join(", ")}
                    onChange={(e) =>
                      setSeo(
                        "keywords",
                        e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                      )
                    }
                    placeholder="patient acquisition, ai search, geo"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                label="Meta description"
                hint={
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      form.seo.metaDescription.length > 160 ? "text-red-500" : "text-slate-400"
                    }`}
                  >
                    {form.seo.metaDescription.length}/160
                  </span>
                }
              >
                <textarea
                  value={form.seo.metaDescription}
                  onChange={(e) => setSeo("metaDescription", e.target.value)}
                  rows={3}
                  maxLength={180}
                  placeholder={form.excerpt || "Defaults to the excerpt"}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <Field label="Canonical URL" hint={<span className="font-mono text-[10px] text-slate-400">optional</span>}>
                <input
                  type="url"
                  value={form.seo.canonicalUrl}
                  onChange={(e) => setSeo("canonicalUrl", e.target.value)}
                  placeholder={`https://…/blog/${form.slug || "your-post"}`}
                  className={`${inputClass} font-mono`}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Open Graph title">
                  <input
                    type="text"
                    value={form.seo.ogTitle}
                    onChange={(e) => setSeo("ogTitle", e.target.value)}
                    maxLength={70}
                    placeholder={form.seo.metaTitle || form.title || "Social share title"}
                    className={inputClass}
                  />
                </Field>
                <Field label="Open Graph image URL">
                  <input
                    type="url"
                    value={form.seo.ogImage}
                    onChange={(e) => setSeo("ogImage", e.target.value)}
                    placeholder="https://…/share-image.jpg"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Open Graph description">
                <textarea
                  value={form.seo.ogDescription}
                  onChange={(e) => setSeo("ogDescription", e.target.value)}
                  rows={2}
                  maxLength={180}
                  placeholder={form.seo.metaDescription || form.excerpt || "Social share description"}
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Twitter / X card">
                  <select
                    value={form.seo.twitterCard}
                    onChange={(e) => setSeo("twitterCard", e.target.value as EditorSeo["twitterCard"])}
                    className={inputClass}
                  >
                    <option value="summary_large_image">Summary with large image</option>
                    <option value="summary">Summary</option>
                  </select>
                </Field>
                <Field label="Schema.org type">
                  <select
                    value={form.seo.schemaType}
                    onChange={(e) => setSeo("schemaType", e.target.value as EditorSeo["schemaType"])}
                    className={inputClass}
                  >
                    <option value="BlogPosting">BlogPosting</option>
                    <option value="Article">Article</option>
                  </select>
                </Field>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F6F1] border border-[#E1E6DF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.seo.noindex}
                  onChange={(e) => setSeo("noindex", e.target.checked)}
                  className="mt-0.5 rounded border-slate-400 text-[#2563EB] focus:ring-0"
                />
                <span className="space-y-1">
                  <span className="block text-xs font-black uppercase text-[#0B1310]">
                    Ask search engines not to index this post
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500">
                    Adds <code className="font-mono">noindex</code> robots meta + excludes it from the sitemap.
                  </span>
                </span>
              </label>
            </Card>
          </div>
        </div>

        {/* ── SIDEBAR ─────────────────────────────── */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="p-6 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl space-y-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Publishing
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F6F1] border border-[#E1E6DF]">
              <span className="text-xs font-bold text-slate-600">Status</span>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  form.status === "published"
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {form.status}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSave(form.status === "published" ? "published" : "draft")}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} /> {id ? "Save changes" : "Save draft"}
              </button>
              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={saving}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={15} /> {form.status === "published" ? "Republish" : "Publish now"}
              </button>
              {form.status === "published" && form.slug && (
                <Link
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#E1E6DF] text-[#0B1310] font-black text-xs uppercase tracking-wider hover:border-slate-400 transition-all inline-flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> View live page
                </Link>
              )}
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-white border border-[#E1E6DF] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
                SEO checklist
              </h3>
              <span
                className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                  score >= 75
                    ? "bg-emerald-100 text-emerald-700"
                    : score >= 40
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {score}%
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[#F4F6F1] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>

            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-2 text-[11px] font-medium">
                  {item.ok ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <CircleAlert size={14} className="text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <span className={item.ok ? "text-slate-600" : "text-slate-400"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
