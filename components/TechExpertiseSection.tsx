"use client";

import React from "react";
import { motion } from "framer-motion";

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
  { name: "X", category: "Social Media", icon: "https://cdn.simpleicons.org/x/000000" },
  { name: "Pinterest", category: "Social Media", icon: "https://raw.githubusercontent.com/devicons/devicon/master/icons/pinterest/pinterest-original.svg" },
  { name: "Meta", category: "Platform", icon: "https://cdn.simpleicons.org/meta/0467DF" },
  { name: "Google Ads", category: "Marketing", icon: "https://cdn.simpleicons.org/googleads/4285F4" },
  { name: "Google Maps", category: "API & Service", icon: "https://cdn.simpleicons.org/googlemaps/4285F4" },
  { name: "Canva", category: "Design", icon: "https://cdn.simpleicons.org/canva/00C4CC" },
];

export default function TechExpertiseSection() {
  return (
    <section className="relative overflow-hidden bg-[#080A0F] py-24 border-t border-white/10">
      <style>{`
        @keyframes marqueeLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { display: flex; width: max-content; animation: marqueeLeft 38s linear infinite; }
        .animate-marquee-right { display: flex; width: max-content; animation: marqueeRight 38s linear infinite; }
        .marquee-container:hover .animate-marquee-left,
        .marquee-container:hover .animate-marquee-right { animation-play-state: paused; }
      `}</style>

      <div className="relative mx-auto mb-12 max-w-4xl px-4 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Our <span className="text-[#22C55E]">Tech &amp; Media Stack</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-normal text-neutral-400">
          Empowering scalable digital ecosystems with industry-standard development frameworks, cloud solutions, and media platforms.
        </p>
      </div>

      {/* Marquee Row 1 - Left */}
      <div className="marquee-container relative flex overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080A0F] to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#080A0F] to-transparent md:w-48" />

        <div className="animate-marquee-left flex gap-4 px-4 py-2">
          {[...expertiseRow1, ...expertiseRow1, ...expertiseRow1].map((item, index) => (
            <motion.div
              key={`row1-${item.name}-${index}`}
              whileHover={{ y: -3 }}
              className="group flex h-[120px] w-[130px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-lg border border-white/10 bg-[#0E121B] p-3.5 transition-all duration-200 hover:border-white/25"
            >
              <div className="flex h-12 w-full items-center justify-center p-1">
                <img
                  src={item.icon}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg";
                  }}
                  className="max-h-10 max-w-10 object-contain transition-transform duration-200 group-hover:scale-105 filter grayscale-[20%]"
                />
              </div>
              <div className="w-full text-center">
                <h3 className="text-xs font-bold text-white transition-colors group-hover:text-[#22C55E] truncate">
                  {item.name}
                </h3>
                <span className="mt-0.5 block text-[9px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 - Right */}
      <div className="marquee-container relative flex overflow-hidden py-3 mt-2">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080A0F] to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#080A0F] to-transparent md:w-48" />

        <div className="animate-marquee-right flex gap-4 px-4 py-2">
          {[...expertiseRow2, ...expertiseRow2, ...expertiseRow2].map((item, index) => (
            <motion.div
              key={`row2-${item.name}-${index}`}
              whileHover={{ y: -3 }}
              className="group flex h-[120px] w-[130px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-lg border border-white/10 bg-[#0E121B] p-3.5 transition-all duration-200 hover:border-white/25"
            >
              <div className="flex h-12 w-full items-center justify-center p-1">
                <img
                  src={item.icon}
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg";
                  }}
                  className="max-h-10 max-w-10 object-contain transition-transform duration-200 group-hover:scale-105 filter grayscale-[20%]"
                />
              </div>
              <div className="w-full text-center">
                <h3 className="text-xs font-bold text-white transition-colors group-hover:text-[#22C55E] truncate">
                  {item.name}
                </h3>
                <span className="mt-0.5 block text-[9px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {item.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
