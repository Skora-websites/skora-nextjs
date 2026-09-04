"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import * as THREE from "three";

interface LandingIntroProps {
  onComplete?: () => void;
}

/** Lightweight WebGL particle burst rendered behind the monogram. */
function IntroParticleBurst({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.z = 40;

    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Burst field: particles radiating outward from center
    const count = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#38BDF8");
    const blue = new THREE.Color("#2563EB");

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const theta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.09 + 0.015;
      velocities.push(Math.cos(theta) * speed, Math.sin(theta) * speed);

      const c = blue.clone().lerp(cyan, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      camera.aspect = (container.clientWidth || 1) / (container.clientHeight || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let frame: number;
    let running = true;
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;

    const tick = () => {
      if (!running) return;
      frame = requestAnimationFrame(tick);
      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i) + velocities[i * 2];
        const y = posAttr.getY(i) + velocities[i * 2 + 1];
        velocities[i * 2] *= 0.985;
        velocities[i * 2 + 1] *= 0.985;
        posAttr.setXYZ(i, x, y, posAttr.getZ(i));
      }
      posAttr.needsUpdate = true;
      points.rotation.z += 0.0008;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [containerRef]);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0 z-10 pointer-events-none" />;
}

export default function LandingIntro({ onComplete }: LandingIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const sMonogramRef = useRef<HTMLDivElement>(null);
  const textStageRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const laserBeamRef = useRef<HTMLDivElement>(null);

  const [typedText, setTypedText] = useState("S");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Session-gated: never replay within the same browser session
    const hasSeenIntro = sessionStorage.getItem("skora_cinematic_intro_v4");
    if (hasSeenIntro) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const fullWord = "SKORA.info";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("skora_cinematic_intro_v4", "true");
          setVisible(false);
          if (onComplete) onComplete();
        },
      });

      // 1. Laser horizon ignition
      tl.fromTo(
        laserBeamRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: "expo.out" }
      );

      // 2. Deep 3D monogram prism zoom entrance (particle burst fires underneath)
      tl.fromTo(
        sMonogramRef.current,
        { opacity: 0, scale: 0.25, z: -600, rotateY: 60, rotateX: 18 },
        {
          opacity: 1,
          scale: 1,
          z: 0,
          rotateY: 0,
          rotateX: 0,
          duration: 1.0,
          ease: "expo.out",
        }
      );

      // 3. Typewriter sequence
      tl.to(
        {},
        {
          duration: 1.1,
          ease: "none",
          onUpdate: function () {
            const progress = this.progress();
            const charCount = Math.floor(progress * fullWord.length) + 1;
            setTypedText(fullWord.substring(0, Math.min(charCount, fullWord.length)));
          },
        }
      );

      // 4. Dissolve monogram, expand text stage
      tl.to(sMonogramRef.current, {
        opacity: 0,
        scale: 1.5,
        rotateY: -25,
        duration: 0.4,
        ease: "power2.in",
      });

      tl.fromTo(
        textStageRef.current,
        { opacity: 0, scale: 0.88, z: -200, rotateX: -10 },
        { opacity: 1, scale: 1, z: 0, rotateX: 0, duration: 0.5, ease: "back.out(1.4)" },
        "<"
      );

      // 5. Final dissolve curtain reveal
      tl.to(curtainRef.current, {
        opacity: 0,
        scale: 1.08,
        duration: 0.65,
        delay: 0.45,
        ease: "power3.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden [perspective:1400px]"
    >
      <div
        ref={curtainRef}
        className="media-dark absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#03050B] p-6 text-center"
      >
        {/* Ambient deep-space bloom */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-tr from-blue-600/30 via-sky-500/20 to-transparent blur-[160px]" />
        {/* Horizon glow line field */}
        <div aria-hidden="true" className="grid-floor opacity-70" />

        {/* WebGL particle burst behind the monogram */}
        <IntroParticleBurst containerRef={burstRef} />

        {/* Laser horizon beam */}
        <div
          ref={laserBeamRef}
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_30px_#38bdf8]"
        />

        {/* Phase 1: Holographic monogram */}
        <div
          ref={sMonogramRef}
          className="relative z-30 flex flex-col items-center justify-center space-y-4 [transform-style:preserve-3d]"
        >
          <div className="relative flex items-center justify-center">
            <span className="select-none bg-gradient-to-tr from-blue-600 via-sky-400 to-blue-200 bg-clip-text text-8xl font-black font-serif italic tracking-wider text-transparent drop-shadow-[0_0_45px_rgba(56,189,248,0.85)] sm:text-9xl">
              S
            </span>
            <div className="pointer-events-none absolute -inset-8 animate-ping rounded-full border border-sky-400/30 blur-sm" />
          </div>

          <span className="font-mono-accent text-xs font-bold uppercase tracking-[0.3em] text-sky-400">
            ✦ SKORA INFO ✦
          </span>
        </div>

        {/* Phase 2: Typewriter stage */}
        <div
          ref={textStageRef}
          className="pointer-events-none absolute z-40 flex flex-col items-center justify-center space-y-4 opacity-0 [transform-style:preserve-3d]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-950/80 px-4 py-1.5 text-xs font-bold text-sky-300 shadow-xl font-mono-accent">
            <span className="h-2 w-2 animate-ping rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
            <span>ENTERPRISE DIGITAL SOLUTIONS</span>
          </div>

          <div
            aria-hidden="true"
            className="font-sans text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_50px_rgba(37,99,235,0.9)] sm:text-7xl lg:text-8xl"
          >
            {typedText}
            <span className="animate-pulse text-sky-400">|</span>
          </div>

          <p className="font-mono-accent text-xs uppercase tracking-widest text-slate-400 sm:text-sm">
            DOMINATE SEARCH • ENGINEER SAAS • SCALE CLOUD
          </p>
        </div>
      </div>
    </div>
  );
}
