"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";

interface LandingIntroProps {
  onComplete?: () => void;
}

export default function LandingIntro({ onComplete }: LandingIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topShutterRef = useRef<HTMLDivElement>(null);
  const bottomShutterRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const phrases = [
    { main: "DOMINATE SEARCH & AI", sub: "150+ Battle-Tested SEO & GEO Strategies" },
    { main: "ENGINEER WEB & MOBILE", sub: "Next.js 16 • Swift • Kotlin • Cross-Platform" },
    { main: "SCALE CLOUD & CRM", sub: "AWS DevOps • Multi-Tenant SaaS • PMS Automations" },
  ];

  useEffect(() => {
    // Check if intro played in this session to prevent repeating on refresh unless forced
    const hasSeenIntro = sessionStorage.getItem("skora_cinematic_intro_v2");
    if (hasSeenIntro) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("skora_cinematic_intro_v2", "true");
          setVisible(false);
          if (onComplete) onComplete();
        },
      });

      // Step 1: Laser Horizon Line Ignition
      tl.fromTo(
        laserRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: "expo.out" }
      )
        .to(laserRef.current, {
          scaleY: 12,
          opacity: 0.3,
          duration: 0.5,
          ease: "power2.inOut",
        });

      // Step 2: Phrase 1 Reveal (Zoom in 3D)
      tl.fromTo(
        ".gsap-phrase-0",
        { opacity: 0, scale: 0.6, z: -300, rotateX: 30 },
        { opacity: 1, scale: 1, z: 0, rotateX: 0, duration: 0.8, ease: "power3.out" }
      ).to(".gsap-phrase-0", {
        opacity: 0,
        scale: 1.2,
        z: 200,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.in",
        onComplete: () => setPhraseIndex(1),
      });

      // Step 3: Phrase 2 Reveal
      tl.fromTo(
        ".gsap-phrase-1",
        { opacity: 0, scale: 0.6, z: -300, rotateX: -30 },
        { opacity: 1, scale: 1, z: 0, rotateX: 0, duration: 0.8, ease: "power3.out" }
      ).to(".gsap-phrase-1", {
        opacity: 0,
        scale: 1.2,
        z: 200,
        duration: 0.5,
        delay: 0.4,
        ease: "power2.in",
        onComplete: () => setPhraseIndex(2),
      });

      // Step 4: Phrase 3 Reveal (Final Brand Emblem)
      tl.fromTo(
        ".gsap-phrase-2",
        { opacity: 0, scale: 0.5, rotateY: 45 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 0.9, ease: "back.out(1.8)" }
      );

      // Step 5: Cinematic Shutter Iris Split Reveal
      tl.to(topShutterRef.current, {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
        delay: 0.5,
      })
        .to(
          bottomShutterRef.current,
          {
            yPercent: 100,
            duration: 1.0,
            ease: "expo.inOut",
          },
          "<"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-auto [perspective:1000px]"
    >
      {/* Top Shutter Panel */}
      <div
        ref={topShutterRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#04060B] z-20 flex flex-col justify-end items-center border-b border-blue-500/30"
      >
        {/* Laser Beam Horizon */}
        <div
          ref={laserRef}
          className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#38bdf8] origin-center"
        />
      </div>

      {/* Bottom Shutter Panel */}
      <div
        ref={bottomShutterRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#04060B] z-20 flex flex-col justify-start items-center border-t border-blue-500/30"
      />

      {/* Center Cinematic Stage */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center">
        {/* Dynamic Glowing Cyber Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.25)_0%,transparent_70%)] pointer-events-none blur-3xl animate-pulse"></div>

        {/* Phrases 3D Sequence Container */}
        <div ref={textContainerRef} className="relative z-40 max-w-3xl space-y-6 [transform-style:preserve-3d]">
          {phraseIndex === 0 && (
            <div className="gsap-phrase-0 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-mono font-bold text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>CINEMATIC EXPERIENCE • PHASE 01</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(37,99,235,0.8)]">
                {phrases[0].main}
              </h1>
              <p className="text-sm sm:text-lg font-mono text-[#94A3B8]">
                {phrases[0].sub}
              </p>
            </div>
          )}

          {phraseIndex === 1 && (
            <div className="gsap-phrase-1 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-mono font-bold text-blue-400 border border-blue-500/30">
                <Zap className="w-4 h-4 animate-bounce" />
                <span>CINEMATIC EXPERIENCE • PHASE 02</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(56,189,248,0.8)]">
                {phrases[1].main}
              </h1>
              <p className="text-sm sm:text-lg font-mono text-[#94A3B8]">
                {phrases[1].sub}
              </p>
            </div>
          )}

          {phraseIndex === 2 && (
            <div className="gsap-phrase-2 space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 p-[2px] mx-auto shadow-[0_0_50px_rgba(37,99,235,0.6)]">
                <div className="w-full h-full bg-[#0B0F19] rounded-[22px] flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
                  SKORA<span className="text-blue-500 font-black">.digital</span>
                </h1>
                <p className="text-xs sm:text-sm font-mono text-cyan-400 tracking-widest uppercase mt-2">
                  ENTERPRISE DIGITAL & TECH SOLUTIONS
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
