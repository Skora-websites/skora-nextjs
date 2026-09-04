"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Global shared WebGL canvas for the marketing site (Deep Space Neon).
 * - Richer particle starfield + glowing wireframe geometry + horizon floor
 * - Mouse parallax + scroll-reactive camera
 * - Perf guards: dpr cap, mobile particle reduction, tab-hidden pause, WebGL fallback
 */
export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // WebGL unavailable — leave container empty (static CSS gradient fallback shows through)
      return;
    }

    const isMobile = window.innerWidth < 768;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Deep-space particle constellation
    const particleCount = isMobile ? 90 : 240;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

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

      sizes[i] = Math.random() * 0.5 + 0.15;
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
    let tabVisible = true;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const handleVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      if (tabVisible) animate();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);

    // 5. Animation loop with on-scroll camera reaction
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

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

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationFrameId);
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
