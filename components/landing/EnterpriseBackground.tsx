"use client";

import React from "react";

/** Single subtle enterprise background: faint grid + one top halo. No icons, no emojis. */
export default function EnterpriseBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden enterprise-wash" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(#d7e0ee 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 20%, black 30%, transparent 75%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-main" />
    </div>
  );
}
