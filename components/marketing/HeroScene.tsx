"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero centerpiece scene: rotating wireframe icosahedron + orbiting cyan
 * satellite ring behind the headline, with a glowing halo core.
 * Lazily mounted (ssr: false) and gracefully absent when WebGL fails.
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    const isMobile = window.innerWidth < 768;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0.6, 17);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Core icosahedron — double-layer wireframe for glow depth
    const coreGeo = new THREE.IcosahedronGeometry(4.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const shellGeo = new THREE.IcosahedronGeometry(6.4, 0);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    // Inner glow core (soft additive sphere)
    const glowGeo = new THREE.SphereGeometry(2.2, 24, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // Orbiting satellites on a tilted ring
    const ringGeo = new THREE.TorusGeometry(8.2, 0.02, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    const satelliteGeo = new THREE.OctahedronGeometry(0.42, 0);
    const satelliteMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const satellites: THREE.Mesh[] = [];
    const satCount = isMobile ? 2 : 4;
    for (let i = 0; i < satCount; i++) {
      const sat = new THREE.Mesh(satelliteGeo, satelliteMat);
      sat.userData.angle = (i / satCount) * Math.PI * 2;
      ring.add(sat);
      satellites.push(sat);
    }

    // Resize to container
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let mouseX = 0;
    let mouseY = 0;
    let tabVisible = true;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const handleVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      if (tabVisible) animate();
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    let animationFrameId: number;
    let elapsed = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const motionScale = reduceMotion ? 0.3 : 1;
      elapsed += 0.008 * motionScale;

      core.rotation.y += 0.0032 * motionScale;
      core.rotation.x = Math.sin(elapsed * 0.6) * 0.12;
      shell.rotation.y -= 0.0018 * motionScale;
      shell.rotation.z += 0.001 * motionScale;
      glow.scale.setScalar(1 + Math.sin(elapsed * 1.4) * 0.08);

      ring.rotation.z += 0.0016 * motionScale;
      for (const sat of satellites) {
        sat.userData.angle += 0.006 * motionScale;
        sat.position.set(
          Math.cos(sat.userData.angle) * 8.2,
          Math.sin(sat.userData.angle) * 8.2,
          0
        );
        sat.rotation.y += 0.02 * motionScale;
      }

      // Mouse parallax on the whole group
      core.position.x += (mouseX * 1.4 - core.position.x) * 0.04;
      core.position.y += (-mouseY * 0.9 - core.position.y) * 0.04;
      shell.position.copy(core.position);
      glow.position.copy(core.position);

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      coreGeo.dispose();
      coreMat.dispose();
      shellGeo.dispose();
      shellMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      satelliteGeo.dispose();
      satelliteMat.dispose();
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
      className="absolute inset-0 pointer-events-none opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_78%)]"
    />
  );
}
