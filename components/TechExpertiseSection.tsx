"use client";

import React from "react";
import Marquee from "@/components/animation/Marquee";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";

const expertiseRow1 = [
  { name: "HTML5", category: "Frontend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" },
  { name: "CSS3", category: "Styling", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" },
  { name: "JavaScript", category: "Language", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", category: "Language", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" },
  { name: "React", category: "Frontend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" },
  { name: "Node.js", category: "Backend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" },
  { name: "Python", category: "Language", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" },
  { name: "PHP", category: "Backend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg" },
  { name: "Laravel", category: "Backend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-original.svg" },
  { name: "Angular", category: "Frontend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/angularjs/angularjs-original.svg" },
  { name: "Vue.js", category: "Frontend", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original.svg" },
  { name: "WordPress", category: "CMS", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/wordpress/wordpress-original.svg" },
  { name: "Bootstrap", category: "Styling", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/bootstrap/bootstrap-original.svg" },
  { name: "Tailwind CSS", category: "Styling", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" },
];

const expertiseRow2 = [
  { name: "AWS", category: "Cloud", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", category: "DevOps", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" },
  { name: "Figma", category: "Design", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/figma/figma-original.svg" },
  { name: "GitHub", category: "DevOps", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" },
  { name: "Facebook", category: "Social Media", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/facebook/facebook-original.svg" },
  { name: "Instagram", category: "Social Media", icon: "https://cdn.simpleicons.org/instagram/E4405F" },
  { name: "LinkedIn", category: "Social Media", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/linkedin/linkedin-original.svg" },
  { name: "X", category: "Social Media", icon: "https://cdn.simpleicons.org/x/0b1220" },
  { name: "Pinterest", category: "Social Media", icon: "https://cdn.simpleicons.org/pinterest/E60023" },
  { name: "Meta", category: "Platform", icon: "https://cdn.simpleicons.org/meta/0467DF" },
  { name: "Google Ads", category: "Marketing", icon: "https://cdn.simpleicons.org/googleads/4285F4" },
  { name: "Google Maps", category: "API & Service", icon: "https://cdn.simpleicons.org/googlemaps/4285F4" },
  { name: "Canva", category: "Design", icon: "https://api.iconify.design/simple-icons:canva.svg?color=%2300C4CC&width=96&height=96" },
];

function TechCard({
  item,
  fallback,
}: {
  item: { name: string; category: string; icon: string };
  fallback: string;
}) {
  // Writes two custom properties straight to the node — the border light
  // tracks the cursor without any React state in the loop.
  const trackLight = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={trackLight}
      className="glass-card glass-card-hover spotlight-card group flex h-[130px] w-[140px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.04]"
    >
      <div className="flex h-14 w-full items-center justify-center p-1">
        {/*
          Deliberately a plain <img>, not next/image: these are third-party
          SVGs (devicons / simpleicons / iconify) in a fixed 44px box. The image
          optimiser would refuse to re-encode SVG without `dangerouslyAllowSVG`,
          and even then it can add nothing — SVG is already vector. Each card
          also swaps `src` imperatively in onError below, which is a prop swap
          on <Image>. The optimiser's caching would only add a hop.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.icon}
          alt={item.name}
          // Critical: without this, React 19's SSR hoists every one of these
          // into a <link rel="preload"> — 20 of them on the homepage — and they
          // compete with the actual LCP image for bandwidth. The marquee sits
          // several viewports down, so lazy is both correct and faster.
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallback;
          }}
          className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="w-full text-center">
        <h3 className="truncate text-xs font-bold text-ink transition-colors group-hover:text-accent-light">
          {item.name}
        </h3>
        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-wider text-faint">
          {item.category}
        </span>
      </div>
    </div>
  );
}

/**
 * Two technology rails travelling in opposite directions. Both are GSAP
 * marquees whose speed tracks scroll velocity, so flicking the wheel whips the
 * cards past and they ease back to a cruise when you stop.
 */
export default function TechExpertiseSection() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-main py-20 sm:py-28">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(#d7e0ee 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="section-wrap relative mb-12 flex flex-wrap items-end justify-between gap-6">
        <Reveal variant="fade-left" className="max-w-2xl">
          <span className="kicker">Toolbox</span>
          <SplitHeading as="h2" className="display-hero mt-4 text-4xl sm:text-6xl">
            Fluent in the <span className="display-accent text-accent">modern stack.</span>
          </SplitHeading>
        </Reveal>
        <Reveal variant="fade-right" delay={0.15} className="max-w-sm">
          <p className="text-sm font-medium leading-relaxed text-sub">
            The frameworks, clouds, and platforms we ship with every week — no experiments on your budget.
          </p>
        </Reveal>
      </div>

      {/* Both rails sit inside .section-wrap so the card edge lines up with the
          heading above instead of running under the browser chrome. */}
      <Reveal variant="zoom" duration={0.9} className="section-wrap relative">
        {/* Row 1 — travelling left */}
        <div className="marquee-container relative flex overflow-hidden py-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-main to-transparent md:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-main to-transparent md:w-48" />
          <Marquee direction="left" duration={38} laneClassName="gap-5 px-2.5">
            {/* The gutter lives on this group, between the cards. The lane's
                identical gap only separates the two loop copies — so both must
                stay equal, and the lane's px must stay at half that gap, or the
                -50% wrap lands off-centre and the rail jumps every cycle. */}
            <div className="flex shrink-0 items-center gap-5">
              {expertiseRow1.map((item) => (
                <TechCard
                  key={item.name}
                  item={item}
                  fallback="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg"
                />
              ))}
            </div>
          </Marquee>
        </div>

        {/* Row 2 — travelling right */}
        <div className="marquee-container relative mt-4 flex overflow-hidden py-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-main to-transparent md:w-48" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-main to-transparent md:w-48" />
          <Marquee direction="right" duration={38} laneClassName="gap-5 px-2.5">
            <div className="flex shrink-0 items-center gap-5">
              {expertiseRow2.map((item) => (
                <TechCard
                  key={item.name}
                  item={item}
                  fallback="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg"
                />
              ))}
            </div>
          </Marquee>
        </div>
      </Reveal>
    </section>
  );
}
