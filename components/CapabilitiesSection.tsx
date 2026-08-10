"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code, Activity, Cloud, LayoutTemplate, Smartphone, ArrowRight } from "lucide-react";
import Card3D from "./Card3D";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function CapabilitiesSection() {
  const cards = [
    { link: "/services/pms", Icon: Activity, title: "Healthcare IT Portals", description: "HIPAA-compliant clinic systems, patient management, and EHR integrations.", iconClass: "bg-emerald-50 text-emerald-700" },
    { link: "/services/cloud-services", Icon: Cloud, title: "Cloud Architecture", description: "Secure AWS & Azure deployments, seamless database migrations, and robust infrastructure.", iconClass: "bg-indigo-50 text-indigo-700" },
    { link: "/services/website-design", Icon: LayoutTemplate, title: "Cinematic UI / UX", description: "Premium digital design, aesthetic precision, and clear product experiences.", iconClass: "bg-purple-50 text-purple-700" },
    { link: "/services/mobile-development", Icon: Smartphone, title: "Mobile Applications", description: "High-performance, cross-platform mobile experiences built for speed.", iconClass: "bg-sky-50 text-sky-700" },
  ];

  return (
    <section id="capabilities" className="bg-slate-50 py-24 [perspective:1000px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.55 }} className="mb-12 max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Capabilities</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">What We Build at Skora</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Big Featured Left Card */}
          <a href="/services/saas-development" className="lg:row-span-2">
            <Card3D maxTilt={10} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl h-full">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-50 transition duration-700 group-hover:scale-150" />
              <div className="relative flex h-full flex-col justify-between [transform-style:preserve-3d]">
                <div>
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 [transform:translateZ(40px)]">
                    <Code size={25} />
                  </div>
                  <h3 className="text-3xl font-semibold tracking-tight text-slate-950 [transform:translateZ(30px)]">Custom Enterprise Platforms</h3>
                  <p className="mt-4 leading-relaxed text-slate-600 [transform:translateZ(20px)]">
                    We engineer scalable web applications, SaaS multi-tenant systems, and multi-user platforms tailored to your operational workflows.
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-bold text-blue-700 [transform:translateZ(25px)]">
                  Explore Enterprise Solutions <ArrowRight size={18} />
                </span>
              </div>
            </Card3D>
          </a>

          {/* 4 Cards Grid */}
          {cards.map(({ link, Icon, title, description, iconClass }) => (
            <a key={title} href={link}>
              <Card3D maxTilt={10} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl h-full">
                <div className="[transform-style:preserve-3d]">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} [transform:translateZ(30px)]`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 [transform:translateZ(20px)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 [transform:translateZ(15px)]">{description}</p>
                </div>
              </Card3D>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
