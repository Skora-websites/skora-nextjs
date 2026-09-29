"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CircleAlert,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  seo: { noindex: boolean };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/posts?all=1", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load posts.");
          return;
        }
        setPosts(data.data.posts || []);
      } catch {
        if (!cancelled) setError("Failed to load posts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleStatus = async (post: PostRow) => {
    const next = post.status === "published" ? "draft" : "published";
    if (next === "draft" && !window.confirm("Unpublish this post? It will disappear from /blog.")) return;
    setBusyId(post.id);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update the post.");
        return;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, status: next, publishedAt: data.data.post.publishedAt } : p
        )
      );
    } catch {
      setError("Network error — status not changed.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (post: PostRow) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setBusyId(post.id);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not delete the post.");
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch {
      setError("Network error — post not deleted.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.slug.includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "ALL" || post.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  const publishedCount = posts.filter((p) => p.status === "published").length;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6DF]">
        <div>
          <span className="kicker mb-2">Blog</span>
          <h1 className="display-hero text-3xl sm:text-5xl text-[#0B1310]">
            Articles <span className="display-accent text-accent">({posts.length}).</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {publishedCount} published · {posts.length - publishedCount} draft
            {posts.length - publishedCount === 1 ? "" : "s"} · every post gets its own SEO-ready page at /blog/[slug].
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-2"
        >
          <Plus size={16} /> New post
        </Link>
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

      {/* Search + filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, slug, category or tag..."
            className="w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors shadow-sm"
          />
        </div>

        <div className="relative">
          <Filter size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-[#E1E6DF] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0B1310] focus:outline-none focus:border-[#2563EB] transition-colors cursor-pointer appearance-none font-mono shadow-sm"
          >
            <option value="ALL">ALL STATUSES ({posts.length})</option>
            <option value="published">PUBLISHED ({publishedCount})</option>
            <option value="draft">DRAFTS ({posts.length - publishedCount})</option>
          </select>
        </div>
      </div>

      {/* Posts table */}
      <div className="rounded-3xl bg-white border border-[#E1E6DF] overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-xs">Loading posts...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <FileText size={34} className="mx-auto text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">
              {posts.length === 0
                ? "No posts yet. Create the first article and it goes live at /blog/your-slug."
                : "No posts match this filter."}
            </p>
            {posts.length === 0 && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] text-white font-black text-xs uppercase tracking-wider"
              >
                <Plus size={15} /> Write the first post
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F4F6F1] border-b border-[#E1E6DF] text-slate-600 uppercase font-mono tracking-wider">
                <tr>
                  <th className="p-4 sm:p-5 font-bold">Post</th>
                  <th className="p-4 sm:p-5 font-bold">Category &amp; tags</th>
                  <th className="p-4 sm:p-5 font-bold">SEO</th>
                  <th className="p-4 sm:p-5 font-bold">Status</th>
                  <th className="p-4 sm:p-5 font-bold">Updated</th>
                  <th className="p-4 sm:p-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E6DF] font-medium">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F4F6F1]/60 transition-colors">
                    <td className="p-4 sm:p-5 max-w-[22rem]">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="font-bold text-[#0B1310] text-sm hover:text-[#2563EB] transition-colors block"
                      >
                        {post.title || "Untitled"}
                      </Link>
                      <span className="block text-[11px] font-mono text-slate-500 truncate">/blog/{post.slug}</span>
                    </td>

                    <td className="p-4 sm:p-5">
                      <div className="text-[#0B1310] font-bold">{post.category || "—"}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[12rem]">
                        {post.tags.slice(0, 3).join(", ") || "no tags"}
                      </div>
                    </td>

                    <td className="p-4 sm:p-5">
                      {post.seo?.noindex ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-300">
                          noindex
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          indexed
                        </span>
                      )}
                    </td>

                    <td className="p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(post)}
                        disabled={busyId === post.id}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border cursor-pointer transition-colors disabled:opacity-50 ${
                          post.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={post.status === "published" ? "Click to unpublish" : "Click to publish"}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </button>
                    </td>

                    <td className="p-4 sm:p-5 font-mono text-slate-500">
                      {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 sm:p-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          title="Edit"
                          className="p-2 rounded-lg border border-[#E1E6DF] text-slate-500 hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors"
                        >
                          <Pencil size={14} />
                        </Link>
                        {post.status === "published" && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            title="View live page"
                            className="p-2 rounded-lg border border-[#E1E6DF] text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                        <a
                          href={`https://www.google.com/search?q=site:${encodeURIComponent(`/blog/${post.slug}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Check indexing"
                          className="p-2 rounded-lg border border-[#E1E6DF] text-slate-500 hover:text-[#2563EB] hover:border-[#2563EB]/40 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          disabled={busyId === post.id}
                          title="Delete"
                          className="p-2 rounded-lg border border-[#E1E6DF] text-slate-500 hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
