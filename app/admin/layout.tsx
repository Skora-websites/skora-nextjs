"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sliders,
  Settings,
  LogOut,
  ShieldCheck,
  Globe,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Skip auth layout wrapper on /admin/login
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push("/admin/login");
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#F4F6F1] flex flex-col items-center justify-center text-[#0B1310] space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
          Verifying Admin Security Token...
        </p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Leads & Enquiries", href: "/admin/leads", icon: Users },
    { label: "Content & Packages", href: "/admin/content", icon: Sliders },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans flex flex-col lg:flex-row selection:bg-[#2563EB] selection:text-white">
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#E1E6DF] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs shadow-md">
            SK
          </div>
          <span className="text-base font-black text-[#0B1310] tracking-tight uppercase">SKORA ADMIN</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-[#F4F6F1] border border-[#E1E6DF] text-slate-700 cursor-pointer"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E1E6DF] flex flex-col justify-between p-6 transition-transform duration-300 lg:static lg:translate-x-0 shadow-lg ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Brand Header */}
          <div className="space-y-2">
            <Link
              href="/"
              target="_blank"
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#EFF6FF] border border-[#2563EB]/30 hover:border-[#2563EB] transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-black text-sm shadow-md">
                  SK
                </div>
                <div>
                  <h2 className="text-xs font-black text-[#0B1310] uppercase tracking-wider">SKORA DIGITAL</h2>
                  <span className="text-[10px] font-mono font-bold text-[#2563EB] block">✦ Admin Portal ✦</span>
                </div>
              </div>
              <Globe size={16} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <span className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
              MANAGEMENT SUITE
            </span>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-extrabold"
                      : "text-slate-600 hover:bg-[#F4F6F1] hover:text-[#0B1310]"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account & Logout */}
        <div className="pt-6 border-t border-[#E1E6DF] space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#EFF6FF] border border-[#2563EB]/30 text-[#2563EB] flex items-center justify-center font-black text-xs">
                AD
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B1310]">Administrator</p>
                <p className="text-[10px] font-mono text-slate-500">admin@skora.digital</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>LOGOUT SESSION</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
