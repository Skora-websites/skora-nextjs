# Design System 1 Specification — SKORA Cyber-Ambient Theme

Derived from the premium UI architecture in the reference mockup, this design system establishes a high-impact, dark cinematic aesthetic with dual cosmic light flares (Warm Amber/Orange + Electric Violet/Purple) tailored for SKORA Digital Marketing, Tech Enterprise, and Dedicated Healthcare IT & Doctor Portals.

---

## 🎨 Color Palette & Gradient Tokens

### 1. Base Canvas
- **Deep Space Dark Canvas**: `#05030A` / `#0A0612`
- **Card Background (Dark Glass)**: `rgba(15, 10, 26, 0.85)` / `#0E0919` with `backdrop-filter: blur(20px)`
- **Border Matrix**: `rgba(255, 255, 255, 0.12)` with active border glows

### 2. Dual Cosmic Light Flares
- **Left Flare (Warm Amber / Solar Ember)**:
  - Core Glow: `#F97316` (Orange-500) $\rightarrow$ `#EA580C` (Orange-600)
  - Ambient Glow: `radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(5, 3, 10, 0) 70%)`
  - Panel Border: `1px solid rgba(249, 115, 22, 0.4)` with shadow `0 0 35px rgba(249, 115, 22, 0.25)`

- **Right Flare (Electric Violet / Deep Nebula)**:
  - Core Glow: `#A855F7` (Purple-500) $\rightarrow$ `#8B5CF6` (Violet-600)
  - Ambient Glow: `radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(5, 3, 10, 0) 70%)`
  - Panel Border: `1px solid rgba(168, 85, 247, 0.4)` with shadow `0 0 35px rgba(168, 85, 247, 0.25)`

### 3. Typography Hierarchy
- **Primary Font**: `Plus Jakarta Sans`, sans-serif
- **Code & Metric Font**: `JetBrains Mono` / `ui-monospace`
- **Silver Metallic Gradient Headline**:
  - `linear-gradient(180deg, #FFFFFF 0%, #D1D5DB 60%, #9CA3AF 100%)`
- **Amber Glow Highlight**: `#FED7AA` to `#F97316`
- **Purple Glow Highlight**: `#E9D5FF` to `#A855F7`

---

## 🏛️ Layout Architecture

### 1. Floating Pill Navbar
- Centered glassmorphic capsule (`bg-white/5 border border-white/10 backdrop-blur-xl rounded-full`)
- Nav links: `Home` (Active pill indicator), `Services`, `Healthcare Portal`, `News & Blogs`, `Contact`
- Right CTAs: `Log In` & `Book a Demo` (White glass pill button with glow)

### 2. Hero Section
- **Pill Badge**: Centered glowing capsule with spark icon: `✦ Smart Scheduler AI Engine`
- **Headline**: Large crisp metallic display: *"Architecting the Next Generation of Digital Scale & Healthcare Automation!"*
- **Subheadline**: *"Imagine AI marketing execution and doctor patient scheduling happening automatically."*
- **Central Action**: Dual glowing buttons (*Book a Demo* & *Enter Healthcare Doctor Portal*)
- **Client Logo Marquee**: Opendoor, DocuSign, Slack, Splunk, Atlassian

### 3. Dual Interactive 3D Mockup Panels (As in Reference Image)
- **Left Panel (Solar Ember Amber)**:
  - Header: *"You have 3 new appointments"* with glowing bell notification
  - Patient Card: Avatar, Name *"Wilson Rhiel Madsen"*, time *"8:00 - 12:00 Am in 10 min"*
  - Action Buttons: *"Prepare"* & *"Start sessions"* (Gradient glowing button)
- **Right Panel (Electric Violet Purple)**:
  - Header: Live Session *"Session with Peter"* (Started 6 min ago)
  - Data Logging Widget: *"Model prompt — Engage with play item"*
  - Timeline Item: *"Engage with play items — Skill acquisition — Completed 10:35 am"*

### 4. Dedicated Healthcare Doctor Portal Section
- Full-width featured division banner with doctor tools, HIPAA compliance metrics, patient portal demo trigger, and direct redirect button to `/healthcare`.

### 5. 7 Core SKORA Services Hub
- Cards for Digital Marketing, Website Design, Mobile Development, Cloud Services, SaaS Platforms, Project Management Systems (PMS), and CRM Automations.

---

## 🚀 Navigation Logic
- **`SKORA` Logo Click**: Redirects to `/` (Landing Page).
- **`Home` Link Click**: Redirects to `/home` (Dedicated Home Page built on `design1.md`).
- **`Healthcare IT` Link / Button Click**: Redirects to `/healthcare` (Dedicated Doctor Portal).
