"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import Reveal from "@/components/animation/Reveal";
import "./LaptopSlider.css";

const slideData = [
  {
    id: 1,
    title: "Institution management platform",
    description: "Multi-user system with roles, attendance, and reports.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
  },
  {
    id: 2,
    title: "Clinic website and recruitment",
    description: "Service pages, doctor profiles, and application flow.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
  },
  {
    id: 3,
    title: "Product review portal",
    description: "Article publishing, search, and affiliate tracking.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
  },
  {
    id: 4,
    title: "Business dashboard",
    description: "Orders, customers, and day-to-day operations in one view.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  },
  {
    id: 5,
    title: "Marketing website",
    description: "Fast pages with clear calls to action and analytics.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
  },
  {
    id: 6,
    title: "Video and content library",
    description: "Organized video content with thumbnails and search.",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=800&q=80",
  },
];

const renderKeyboard = () => {
  const keys = [];
  for (let i = 0; i < 76; i++) {
    keys.push(<div key={i} className={`laptop-key ${i === 72 ? "spacebar" : ""}`}></div>);
  }
  return keys;
};

/**
 * 3D MacBook carousel.
 *
 * The rig's Y rotation is tweened by GSAP rather than transitioned by CSS, so
 * the spin can carry the same weighted ease as the rest of the page and the
 * caption swap can be choreographed against it: caption lifts out as the rig
 * turns, new caption settles in behind it. Autoplay only runs while the
 * section is on screen and stops on hover; reduced motion shows slide one
 * statically.
 */
export default function LaptopSlider() {
  const [rotationCount, setRotationCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rotationRef = useRef(0);
  const reduced = useRef(false);

  const totalSlides = slideData.length;
  const currentIndex = ((rotationCount % totalSlides) + totalSlides) % totalSlides;
  const activeSlide = slideData[currentIndex];

  // Spin the rig. Driven imperatively (not from state) so React never
  // re-renders 60×/s and the tween can be interrupted cleanly.
  const spinTo = useCallback((steps: number, immediate = false) => {
    const spinner = spinnerRef.current;
    if (!spinner) return;
    const target = steps * -60;
    rotationRef.current = target;
    gsap.to(spinner, {
      rotationY: target,
      duration: immediate || reduced.current ? 0 : 0.85,
      ease: CINEMA.enter,
      overwrite: "auto",
    });
  }, []);

  // Caption choreography: current copy lifts out, the new one rises into place.
  const swapCaption = useCallback(() => {
    const el = captionRef.current;
    if (!el || reduced.current) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, ease: CINEMA.enter, overwrite: true }
    );
  }, []);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (spinnerRef.current) gsap.set(spinnerRef.current, { rotationY: 0 });

    // Only autoplay while the section is actually on screen.
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 85%",
      end: "bottom 15%",
      onToggle: (self) => setIsInView(self.isActive),
    });
    return () => st.kill();
  }, []);

  // Rotation ticker.
  useEffect(() => {
    if (reduced.current) return;
    if (isHovered || !isInView) return;
    const timer = setInterval(() => {
      setRotationCount((prev) => prev + 1);
    }, 2600);
    return () => clearInterval(timer);
  }, [isHovered, isInView]);

  // Spin whenever the active slide changes (ticker above drives the count).
  useEffect(() => {
    spinTo(rotationCount, rotationCount === 0);
  }, [rotationCount, spinTo]);

  useEffect(() => {
    swapCaption();
  }, [rotationCount, swapCaption]);

  useEffect(() => {
    if (rotationCount > 0 && isInView && audioRef.current && !isMuted) {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.volume = 0.4;
      audio.play().catch(() => setIsMuted(true));
    }
  }, [rotationCount, isInView, isMuted]);

  return (
    <Reveal variant="zoom" duration={1}>
      <div className="cred-carousel-section" ref={sectionRef}>
        <audio ref={audioRef} src="https://actions.google.com/sounds/v1/foley/swoosh.ogg" preload="auto" />

        <div className="audio-controls">
          <button
            className={`audio-toggle ${!isMuted ? "audio-active" : ""}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isMuted ? "Sound: OFF" : "Sound: ON"}</span>
          </button>
        </div>

        <div className="carousel-layout-wrapper">
          <div
            className="carousel-scene"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="carousel-spinner" ref={spinnerRef}>
              {slideData.map((slide, index) => {
                const angle = index * 60;
                const isActive = index === currentIndex;

                return (
                  <div
                    key={slide.id}
                    className={`carousel-item ${isActive ? "item-active" : "item-inactive"}`}
                    style={{ transform: `rotateY(${angle}deg) translateZ(450px)` }}
                  >
                    <div className="macbook-3d-rig">
                      <div className="macbook-lid">
                        <div className="dim-overlay"></div>
                        <div className="macbook-screen">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="screen-glare"></div>
                        </div>
                      </div>

                      <div className="macbook-base">
                        <div className="dim-overlay"></div>
                        <div className="macbook-keyboard-well">{renderKeyboard()}</div>
                        <div className="macbook-trackpad"></div>
                        <div className="macbook-base-lip"></div>
                      </div>

                      <div className="desk-shadow"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="carousel-text-overlay">
            <div ref={captionRef} className="text-animate-wrapper">
              <h3 className="gradient-text">{activeSlide.title}</h3>
              <p>{activeSlide.description}</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
