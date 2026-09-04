"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Global shared WebGL canvas for the marketing site (Deep Space Neon).
 * - Richer particle starfield + glowing wireframe geometry + horizon floor
 * - Mouse parallax + scroll-reactive camera
 * - Perf guards: dpr cap, 30fps cap, mobile particle reduction,
 *   pauses when tab hidden, offscreen, or hidden by the light theme.
 */
export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 768;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: "low-power" });
    } catch {
      // WebGL unavailable — leave container empty (static CSS gradient fallback shows through)
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    container.appendChild(renderer.domElement);

    // 1. Deep-space particle constellation
    const particleCount = isMobile ? 90 : 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const blueColor = new THREE.Color("#2563EB");
    const cyanColor = new THREE.Color("#38BDF8");
    const white = new THREE.Color("#E0F2FE");

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const roll = Math.random();
      const mixedColor =
        roll > 0.85 ? white : blueColor.clone().lerp(cyanColor, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. Glowing wireframe polyhedrons
    const icoGeo = new THREE.IcosahedronGeometry(7, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    icoMesh.position.set(-20, 12, -12);
    scene.add(icoMesh);

    const icoGlowGeo = new THREE.IcosahedronGeometry(9.5, 0);
    const icoGlowMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    });
    const icoGlowMesh = new THREE.Mesh(icoGlowGeo, icoGlowMat);
    icoGlowMesh.position.copy(icoMesh.position);
    scene.add(icoGlowMesh);

    const torusGeo = new THREE.TorusKnotGeometry(5.5, 1.3, 90, 14);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(22, -14, -16);
    scene.add(torusMesh);

    // 3. Neon horizon grid floor (three.js twin of the CSS .grid-floor)
    const gridHelper = new THREE.GridHelper(220, 56, 0x38bdf8, 0x1d4ed8);
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.1;
    gridHelper.position.set(0, -26, 0);
    scene.add(gridHelper);

    // 4. Scroll & mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 5. Animation loop — 30fps cap, pauses when tab hidden / canvas offscreen
    //    (offscreen covers scroll + the light theme's display:none)
    const FRAME_INTERVAL = 1000 / 30;
    let animationFrameId = 0;
    let running = false;
    let lastFrameTime = 0;
    let ioVisible = true;

    const tick = (time: number) => {
      if (!running) return;
      animationFrameId = requestAnimationFrame(tick);
      if (time - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = time;

      const scrollFactor = targetScrollY * 0.001;
      const motionScale = reduceMotion ? 0.25 : 1;

      icoMesh.rotation.x += 0.0028 * motionScale;
      icoMesh.rotation.y += (0.0038 + scrollFactor * 0.002) * motionScale;
      icoGlowMesh.rotation.y -= (0.0022 + scrollFactor * 0.001) * motionScale;
      icoGlowMesh.rotation.z += 0.0016 * motionScale;

      torusMesh.rotation.x -= (0.002 + scrollFactor * 0.001) * motionScale;
      torusMesh.rotation.y += (0.003 + scrollFactor * 0.002) * motionScale;

      particles.rotation.y += 0.0005 * motionScale;

      const scrollCamY = -targetScrollY * 0.014;
      camera.position.y += (scrollCamY - mouseY * 3 - camera.position.y) * 0.05;
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastFrameTime = 0;
      animationFrameId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
    };

    const syncLoop = () => {
      const pageVisible = document.visibilityState === "visible";
      if (ioVisible && pageVisible) startLoop();
      else stopLoop();
    };

    const io = new IntersectionObserver(
      (entries) => {
        ioVisible = entries[0]?.isIntersecting ?? true;
        syncLoop();
      },
      { threshold: 0 }
    );
    io.observe(container);

    const handleVisibility = () => syncLoop();
    document.addEventListener("visibilitychange", handleVisibility);

    startLoop();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      stopLoop();
      io.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      geometry.dispose();
      particleMaterial.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      icoGlowGeo.dispose();
      icoGlowMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      gridHelper.dispose();
      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="three-bg fixed inset-0 z-0 pointer-events-none opacity-60 bg-[radial-gradient(ellipse_at_top,rgba(11,18,36,0.9)_0%,#05070E_70%)]"
    />
  );
}
