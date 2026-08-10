"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Search,
  Infinity as InfinityIcon,
  ShoppingCart,
  Megaphone,
  MessageSquare,
} from "lucide-react";

const socialIconsSvg = {
  facebook: (
    <path d="M22.7 0H1.3C.6 0 0 .6 0 1.3v21.4C0 23.4.6 24 1.3 24h11.5v-9.3H9.7v-3.6h3.1V8.4c0-3.1 1.9-4.8 4.7-4.8 1.3 0 2.5.1 2.8.1V7l-1.9.1c-1.5 0-1.8.7-1.8 1.8v2.3h3.6l-.5 3.6h-3.1V24h6.1c.7 0 1.3-.6 1.3-1.3V1.3C24 .6 23.4 0 22.7 0Z" />
  ),
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.3-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8.1-3.3 1.7-4.8 4.9-4.9 1.2-.1 1.6-.1 4.8-.1ZM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0Zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9Z" />
  ),
  x: (
    <path d="M18.2 2.3h3.3l-7.2 8.3 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.3 2.3H8l4.7 6.2 5.5-6.2Zm-1.2 17.5h1.8L7.1 4.1H5.1L17 19.8Z" />
  ),
  linkedin: (
    <path d="M19 0H5C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5ZM8 19H5V8h3v11ZM6.5 6.7c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8ZM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.5V19Z" />
  ),
};

const iceCubes = [
  {
    name: "Instagram",
    icon: <svg viewBox="0 0 24 24" className="w-10 h-10 fill-white drop-shadow-md">{socialIconsSvg.instagram}</svg>,
    size: "h-28 w-28",
    left: "8%",
    delay: 0,
  },
  {
    name: "Facebook",
    icon: <svg viewBox="0 0 24 24" className="w-12 h-12 fill-white drop-shadow-md">{socialIconsSvg.facebook}</svg>,
    size: "h-32 w-32",
    left: "80%",
    delay: 1.5,
  },
  {
    name: "WhatsApp",
    icon: <MessageCircle size={44} color="white" strokeWidth={1.5} className="drop-shadow-md" />,
    size: "h-24 w-24",
    left: "15%",
    delay: 3,
  },
  {
    name: "LinkedIn",
    icon: <svg viewBox="0 0 24 24" className="w-14 h-14 fill-white drop-shadow-md">{socialIconsSvg.linkedin}</svg>,
    size: "h-36 w-36",
    left: "25%",
    delay: 0.5,
  },
  {
    name: "Google",
    icon: <Search size={40} color="white" strokeWidth={2.5} className="drop-shadow-md" />,
    size: "h-24 w-24",
    left: "65%",
    delay: 2,
  },
  {
    name: "Meta",
    icon: <InfinityIcon size={56} color="white" strokeWidth={1.5} className="drop-shadow-md" />,
    size: "h-32 w-32",
    left: "72%",
    delay: 3.5,
  },
  {
    name: "Amazon",
    icon: <ShoppingCart size={40} color="white" strokeWidth={2} className="drop-shadow-md" />,
    size: "h-28 w-28",
    left: "35%",
    delay: 1.2,
  },
  {
    name: "Pinterest",
    icon: <span className="text-white font-serif text-5xl font-bold drop-shadow-md">P</span>,
    size: "h-24 w-24",
    left: "88%",
    delay: 0.8,
  },
  {
    name: "WordPress",
    icon: <span className="text-white font-serif text-4xl font-bold drop-shadow-md">W</span>,
    size: "h-20 w-20",
    left: "5%",
    delay: 2.5,
  },
  {
    name: "Workchat",
    icon: <MessageSquare size={36} color="white" strokeWidth={1.5} className="drop-shadow-md" />,
    size: "h-20 w-20",
    left: "55%",
    delay: 4,
  },
  {
    name: "Google Ads",
    icon: <Megaphone size={44} color="white" strokeWidth={1.5} className="drop-shadow-md" />,
    size: "h-28 w-28",
    left: "45%",
    delay: 0.2,
  },
];

const expertiseRow1 = [
  { name: "HTML5", category: "Frontend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
  { name: "CSS3", category: "Styling", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
  { name: "JavaScript", category: "Language", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", category: "Language", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "React", category: "Frontend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Node.js", category: "Backend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
  { name: "Python", category: "Language", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
  { name: "PHP", category: "Backend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },
  { name: "Laravel", category: "Backend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" },
  { name: "Angular", category: "Frontend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg" },
  { name: "Vue.js", category: "Frontend", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
  { name: "WordPress", category: "CMS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg" },
  { name: "Bootstrap", category: "Styling", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
  { name: "Tailwind CSS", category: "Styling", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
];

const expertiseRow2 = [
  { name: "AWS", category: "Cloud", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", category: "DevOps", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Figma", category: "Design", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { name: "GitHub", category: "DevOps", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
  { name: "Facebook", category: "Social Media", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg" },
  { name: "Instagram", category: "Social Media", icon: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" },
  { name: "LinkedIn", category: "Social Media", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" },
  { name: "X", category: "Social Media", icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" },
  { name: "Pinterest", category: "Social Media", icon: "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.org.svg" },
  { name: "Meta", category: "Platform", icon: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Google Ads", category: "Marketing", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg" },
  { name: "Google Maps", category: "API & Service", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Google_Maps_icon_%282020%29.svg" },
  { name: "Canva", category: "Design", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg" },
];

export default function FeelTheMarket() {
  return (
    <>
      <style>{`
        @keyframes marqueeLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marqueeRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-marquee-left { display: flex; width: max-content; animation: marqueeLeft 38s linear infinite; }
        .animate-marquee-right { display: flex; width: max-content; animation: marqueeRight 38s linear infinite; }
        .marquee-container:hover .animate-marquee-left,
        .marquee-container:hover .animate-marquee-right { animation-play-state: paused; }
      `}</style>

      {/* CRED-STYLE ICE CUBES SECTION */}
      <section className="relative h-[750px] w-full overflow-hidden bg-[#030914] flex items-center justify-center border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,42,92,.6)_0%,rgba(3,9,20,1)_80%)] pointer-events-none"></div>

        {/* Gravity Dropping Ice Cubes */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          {iceCubes.map((cube) => (
            <motion.div
              key={cube.name}
              animate={{
                y: ["-100vh", `${Math.random() * 20 - 10}vh`, `${Math.random() * 30 + 10}vh`, "100vh"],
                rotate: [0, Math.random() * 20 - 10, Math.random() * -20 + 10, Math.random() * 45],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: cube.delay,
                times: [0, 0.15, 0.85, 1],
              }}
              className={`absolute ${cube.size} flex items-center justify-center rounded-3xl bg-gradient-to-br from-sky-200/40 via-sky-400/10 to-white/5 border border-white/40 shadow-[inset_0_4px_20px_rgba(255,255,255,0.3),_0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-auto cursor-pointer`}
              style={{ left: cube.left }}
              whileHover={{ scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }}
            >
              {cube.icon}
            </motion.div>
          ))}
        </div>

        {/* Slogan */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[3.5rem] font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[7rem] leading-[0.95]"
          >
            feel the market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-blue-400 to-indigo-500">
              in your favour.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-slate-300"
          >
            Dominate every channel. Our engineered digital strategies align your enterprise with the platforms that drive absolute, quantifiable scale.
          </motion.p>
        </div>
      </section>

      {/* OUR EXPERTISE LOGO MARQUEES */}
      <section className="relative overflow-hidden border-t border-slate-800 bg-[#05070E] py-16">
        <div className="relative mx-auto mb-10 max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Our <span className="text-gradient">Tech & Media Expertise</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[#94A3B8]">
            Empowering scalable digital ecosystems with industry-standard development frameworks, cloud solutions, and media platforms.
          </p>
        </div>

        {/* Row 1 */}
        <div className="marquee-container relative flex overflow-hidden py-3">
          <div className="animate-marquee-left flex gap-5 px-4 py-2">
            {[...expertiseRow1, ...expertiseRow1, ...expertiseRow1].map((item, index) => (
              <motion.div
                key={`row1-${item.name}-${index}`}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group flex h-[120px] w-[135px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border border-white/10 bg-[#0B0F19] p-4 shadow-xl backdrop-blur transition-all hover:border-blue-500/50"
              >
                <div className="flex h-12 w-full items-center justify-center p-1">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="max-h-10 max-w-10 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="w-full text-center">
                  <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {item.name}
                  </h3>
                  <span className="text-[9px] font-semibold text-[#64748B] uppercase block">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="marquee-container relative flex overflow-hidden py-3 mt-3">
          <div className="animate-marquee-right flex gap-5 px-4 py-2">
            {[...expertiseRow2, ...expertiseRow2, ...expertiseRow2].map((item, index) => (
              <motion.div
                key={`row2-${item.name}-${index}`}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group flex h-[120px] w-[135px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-2xl border border-white/10 bg-[#0B0F19] p-4 shadow-xl backdrop-blur transition-all hover:border-cyan-500/50"
              >
                <div className="flex h-12 w-full items-center justify-center p-1">
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="max-h-10 max-w-10 object-contain transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="w-full text-center">
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                    {item.name}
                  </h3>
                  <span className="text-[9px] font-semibold text-[#64748B] uppercase block">
                    {item.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
