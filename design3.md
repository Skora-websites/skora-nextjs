# Design System 3 Specification — TRIONN® Interactive Kinetic Footer Architecture

Derived from the award-winning TRIONN® website launch designed by Sunny Rathod (Awwwards SOTD / Dribbble), this specification defines the exact design, animation, Web Audio interaction, and typography language for SKORA's universal footers.

---

## 🎨 TRIONN Footer Aesthetic Tokens

### 1. Palette & Canvas
- **Deep Space Cyber Background**: `#02040A` / `#050814`
- **Primary Text**: Pure White `#FFFFFF` & Translucent Silver `#94A3B8`
- **Active Accent Glows**:
  - *Main Site Variant*: Electric Cyan `#38BDF8` & Neon Teal `#0DB8B5`
  - *Doctor Healthcare Variant*: Clinical Emerald `#10B981` & Soft Mint `#34D399`
- **Border Grid Matrix**: `rgba(255, 255, 255, 0.08)` with hover line glow

### 2. Core Interactive Features (From TRIONN® Design)

1. **SVG Pluckable Strings Brand Emblem**:
   - Giant brand emblem where stroke paths act as interactive "pluckable strings".
   - Swiping or hovering over the lines triggers real-time sound synthesis via the browser's **Web Audio API** (gentle synth chime tone) and procedural audio-reactive visual pulse waves.

2. **Giant Kinetic Text Marquee**:
   - Infinite, high-impact scrolling text banner:
     - *Main Site*: `"LET'S WORK TOGETHER • TIME TO SCALE YOUR ENTERPRISE •"`
     - *Doctor Healthcare*: `"SCALE YOUR CLINICAL PRACTICE WITH SKORA HEALTH • MORE PATIENTS, STRONGER REPUTATION •"`

3. **Real-Time Telemetry & Local Timezone Clock**:
   - Displays live local clock & system telemetry:
     - `MUMBAI, IN • 11:16 AM GMT+5:30`
     - `● 99.99% CLOUD INFRASTRUCTURE OPERATIONAL`

4. **Magnetic Pill Badges & Social Spheres**:
   - Elevated 3D hover pills (*LinkedIn, Instagram, X/Twitter, GitHub, WhatsApp*) with spring cursor dynamics and radial glow highlights.

---

## 🏛️ Footer Implementations

### 1. Universal Main Site Footer (`components/Footer.tsx`)
- Used on: `/`, `/home`, and all 7 `/services/*` pages.
- Features: TRIONN Pluckable SVG Strings, Web Audio chimes, giant enterprise marquee, local clock telemetry, 4-column quick links, intelligence newsletter wire, and glowing top scroll.

### 2. Specialized Doctor Healthcare Footer (`components/HealthcareFooter.tsx`)
- Used exclusively on: `/healthcare`.
- Features: Identical TRIONN GSAP animations, Web Audio pluckable string chimes, giant doctor kinetic text marquee, local clock telemetry, medical growth quick links, doctor audit trigger, and clinical HIPAA compliance badges.
