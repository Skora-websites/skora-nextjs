# SEOWINS.io — Full Design Specification & UI Architecture

This document provides a comprehensive, element-by-element design specification extracted directly from the **SKORA** landing page design interface (`websitedesign.jpg`). It serves as the master design system blueprint, containing exact typography, color palettes, spacing rules, layout structures, content copy, UI components, lighting effects, and visual asset requirements.

---

## 1. Executive Summary & Visual Identity

### 1.1 Brand Overview
* **Brand Name:** `SKORA`
* **Niche:** AI SEO & Search Engine Optimization Strategy SaaS / Digital Playbook
* **Core Value Proposition:** 150+ proven SEO and AI SEO strategies helping users rank on legacy search engines (Google, Bing) and generative AI engines (ChatGPT, Gemini, Perplexity).
* **Target Audience:** SEO Professionals, Digital Marketers, Founders, Content Creators, and Business Owners.

### 1.2 Design Philosophy & Aesthetics
* **Theme Concept:** Dark Cyberpunk / Modern AI SaaS with High-Tech Glow Effects.
* **Primary Mood:** Premium, Cutting-edge, Trustworthy, Dynamic, High-converting.
* **Key Visual Characteristics:**
  * **Deep Pitch Dark Background:** High-contrast backdrop (`#05070E` / `#0A0D14`) that makes bright neon elements pop.
  * **Electric Blue Neon Halo Glows:** Soft, diffused radial light halos (`rgba(37, 99, 235, 0.3)`) behind key focal points (hero character, card highlights, CTA banners).
  * **Glassmorphism:** Semi-transparent dark cards with subtle light borders (`border: 1px solid rgba(255, 255, 255, 0.08)`), subtle background blurs, and hover elevation.
  * **Gradient Typography:** Eye-catching white-to-vibrant-blue gradient fills on major section keywords.

---

## 2. Master Design System & Style Guide

### 2.1 Color Palette & Design Tokens

```css
:root {
  /* Canvas & Background Colors */
  --bg-main: #05070E;             /* Deepest canvas dark background */
  --bg-surface: #0B0F19;          /* Card & container dark background */
  --bg-surface-elevated: #111827; /* Elevated card / modal background */
  --bg-glass: rgba(15, 23, 42, 0.65); /* Glassmorphism translucent backdrop */

  /* Accent & Brand Colors */
  --accent-primary: #2563EB;      /* Primary Electric Blue */
  --accent-primary-hover: #1D4ED8;/* Primary Darker Blue for hover states */
  --accent-glow: #3B82F6;         /* Bright Cyan-Blue for halos & light effects */
  --accent-cyan-light: #60A5FA;   /* Light Sky Blue accent text */
  --accent-gold: #F59E0B;         /* Star rating & highlight gold */

  /* Text Colors */
  --text-white: #FFFFFF;          /* Pure white headings */
  --text-primary: #F8FAFC;        /* Off-white body text */
  --text-secondary: #94A3B8;      /* Muted slate silver subtext */
  --text-muted: #64748B;          /* Dark muted gray captions / strikethroughs */

  /* Borders & Dividers */
  --border-light: rgba(255, 255, 255, 0.08); /* Subtle card border */
  --border-accent: rgba(37, 99, 235, 0.4);  /* Glowing blue border */
  --border-divider: rgba(255, 255, 255, 0.05);/* Footer / section dividers */

  /* Shadows & Neon Glows */
  --glow-radial: radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(5, 7, 14, 0) 70%);
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --shadow-button-glow: 0 0 20px rgba(37, 99, 235, 0.5);
}
```

### 2.2 Typography Hierarchy

* **Font Family:** `Inter`, `Outfit`, or `Plus Jakarta Sans` (Sans-Serif)

| Element | Font Weight | Desktop Size | Mobile Size | Line Height | Color |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | Bold (700/800) | `56px` (`3.5rem`) | `36px` (`2.25rem`) | `1.1` | White + Blue Gradient |
| **Section Title (H2)** | Bold (700) | `40px` (`2.5rem`) | `28px` (`1.75rem`) | `1.2` | White + Blue Gradient |
| **Subsection Title (H3)**| Semi-Bold (600) | `20px` (`1.25rem`) | `18px` (`1.125rem`)| `1.3` | Pure White (`#FFFFFF`) |
| **Body Large** | Regular (400) | `18px` (`1.125rem`)| `16px` (`1rem`) | `1.6` | Muted Silver (`#94A3B8`)|
| **Body Standard** | Regular (400) | `15px` (`0.9375rem`)|`14px` (`0.875rem`) | `1.5` | Muted Slate (`#94A3B8`) |
| **Badge / Pill Text** | Medium (500) | `13px` (`0.8125rem`)|`12px` (`0.75rem`) | `1.2` | Sky Blue (`#60A5FA`) |
| **Button Text** | Semi-Bold (600) | `15px` (`0.9375rem`)|`14px` (`0.875rem`) | `1.0` | Pure White (`#FFFFFF`) |

---

## 3. Section-by-Section Design & Content Blueprint

```
+-----------------------------------------------------------------------+
|  [NAVBAR] Logo | Strategies  AI SEO  Pricing  Testimonials  FAQ | CTA   |
+-----------------------------------------------------------------------+
|  [HERO SECTION]                                                       |
|  (Pill) The Future of SEO is Here                                     |
|  Rank Higher. Get Seen Everywhere.                                    |
|  Subhead text...                                   (Hero Image &      |
|  [CTA Button] [Pricing Pill]                        Floating AI       |
|  ✓ 150+ Strategies  ✓ Step-by-Step  ✓ AI Focused     Badges)          |
+-----------------------------------------------------------------------+
|  [FEATURES GRID] Everything You Need to Grow Traffic & Revenue        |
|  [Card 1]          [Card 2]          [Card 3]          [Card 4]       |
+-----------------------------------------------------------------------+
|  [PRODUCT SHOWCASE]                                                   |
|  (Laptop Mockup Dashboard)   |  (Pill) Inside SEOWINS.io              |
|                              |  Your Playbook for SEO & AI Visibility |
|                              |  ✓ Rank higher  ✓ Get cited in AI      |
|                              |  [Explore Strategies Button]           |
+-----------------------------------------------------------------------+
|  [SOCIAL PROOF & TESTIMONIALS]                                        |
|  Trusted by SEO Professionals | (Testimonial Card)                    |
|  2,500+  150+  Millions      | ★★★★★ Quote text...                   |
|  Members Strategies Visits   | Avatar | James R., Affiliate Marketer   |
+-----------------------------------------------------------------------+
|  [BOTTOM CTA BANNER]                                                  |
|  Get Lifetime Access for a One-Time Payment | $79 $179  [Get Access]  |
+-----------------------------------------------------------------------+
|  [FOOTER] Logo | Quick Links | Legal | Social Icons | Copyright      |
+-----------------------------------------------------------------------+
```

---

### 3.1 Header / Navigation Bar
* **Positioning:** Fixed / Sticky top navbar with glassmorphism backdrop.
* **Height:** `72px`
* **Container Width:** `1240px` max-width.
* **Elements:**
  * **Logo (Left):**
    * Text: `SEOWINS.io`
    * Style: Bold white font (`#FFFFFF`), size `22px`. The `.io` domain suffix is rendered in Sky Blue (`#3B82F6`) with a subtle glowing dot accent.
  * **Center Navigation Links:**
    * Links: `Strategies`, `AI SEO`, `Pricing`, `Testimonials`, `FAQ`
    * Typography: `14px` Medium (500), color `#94A3B8`.
    * Hover State: Transition to `#FFFFFF` with smooth line opacity glow underneath.
  * **Right Action Group:**
    * `Log in` — Text link, color `#94A3B8`, hover `#FFFFFF`.
    * `Get Access Now` — Primary Pill Button:
      * Background: `#2563EB`
      * Border Radius: `8px`
      * Padding: `10px 20px`
      * Text: `14px` Semi-Bold White.

---

### 3.2 Hero Section

#### Left Column (Copy & Conversion Flow)
1. **Top Badge Pill:**
   * Content: `✦ The Future of SEO is Here ✦`
   * Style: Dark semi-transparent pill (`rgba(37, 99, 235, 0.1)`), border `1px solid rgba(59, 130, 246, 0.3)`, text color `#60A5FA`, font size `13px`, rounded-full (`9999px`).
2. **Main Headline (H1):**
   * Line 1: `Rank Higher.` (Solid Pure White `#FFFFFF`)
   * Line 2: `Get Seen Everywhere.` (Gradient Fill: `#3B82F6` to `#60A5FA` / `#93C5FD`)
   * Typography: `56px` Extra Bold, line-height `1.1`, letter-spacing `-0.02em`.
3. **Subheadline:**
   * Copy: `"150+ proven SEO & AI SEO strategies to help you rank on Google, Bing, ChatGPT, Gemini, Perplexity and other AI platforms — drive more traffic, leads, and revenue."`
   * Typography: `18px` Regular, color `#94A3B8`, max-width `540px`, line-height `1.6`.
4. **Primary Call-to-Action Group:**
   * **Primary Button:**
     * Text: `Get Instant Access →` (with right arrow icon).
     * Style: Solid Vibrant Blue (`#2563EB`), hover `#1D4ED8`.
     * Dimensions: Height `52px`, padding `0 28px`, border-radius `10px`.
     * Box Shadow: `0 0 25px rgba(37, 99, 235, 0.45)`.
   * **Pricing Offer Badge (Next to CTA Button):**
     * Dark pill border container containing two lines/parts:
     * Line 1: `One-Time Payment` (Muted label, `11px`).
     * Line 2: `$79` (Highlighted white price, `18px` bold) and `$179` (Strikethrough dark gray price, `14px`).
5. **Trust Indicators (Checkmark Grid underneath CTA):**
   * Layout: Horizontal flex wrap with 4 item pills:
     * `[✓] 150+ Tested Strategies`
     * `[✓] Step-by-Step Guides`
     * `[✓] AI & LLM Focused`
     * `[✓] One-Time Payment`
   * Icon Style: Glowing square blue checkmark badge (`rgba(37, 99, 235, 0.2)` container with sky blue checkmark).
   * Text: `13px` Medium slate text (`#94A3B8`).

#### Right Column (Hero Visual Artwork)
* **Main Character Visual:**
  * Professional portrait of a confident male founder/strategist wearing black hoodie and glasses, arms crossed.
* **Lighting Effects:**
  * High-intensity radial neon blue halo behind head and torso (`radial-gradient(circle, #2563EB 0%, transparent 70%)`).
  * Orbital light trails / cyan neon wireframe curves wrapping around the subject.
* **Floating Glassmorphic AI Brand Badges:**
  * Floating 3D badges representing search engines and generative AI platforms:
    1. `Google` (Multi-color G icon on dark glass container)
    2. `ChatGPT` (White OpenAI spirograph logo on dark glass container)
    3. `Gemini` (Glowing 4-point blue star logo)
    4. `Perplexity` (Cyan teal grid/symbol logo)
    5. `Bing` (Blue b logo)
  * Card Styling: Translucent dark background (`rgba(15, 23, 42, 0.8)`), border `1px solid rgba(255, 255, 255, 0.12)`, backdrop filter `blur(12px)`, border-radius `12px`, floating micro-animation drift.

---

### 3.3 Features Overview Grid ("Everything You Need to")

* **Section Header:**
  * Tagline / Eyebrow: `Everything You Need to` (`16px` Medium, `#94A3B8`, center aligned).
  * Main Headline (H2): `Grow Traffic & Revenue` (`40px` Bold, gradient text fill from White to Electric Blue, center aligned).
* **Grid Layout:** 4-Column Card Layout (`grid-template-columns: repeat(4, 1fr)`).
* **Card Component Blueprint:**

```
+------------------------------------+
|  [Glowing Blue Icon Container]     |
|                                    |
|  Proven Strategies                 |
|  150+ tested SEO & AI SEO          |
|  strategies that actually work.    |
+------------------------------------+
```

| Card | Icon Type | Card Title | Description Copy |
| :--- | :--- | :--- | :--- |
| **Card 1** | Open Book / Playbook | `Proven Strategies` | `"150+ tested SEO & AI SEO strategies that actually work."` |
| **Card 2** | Launch Rocket | `Step-by-Step Guides` | `"Detailed implementation guides to get results faster."` |
| **Card 3** | Analytics Bar Chart | `AI Visibility` | `"Get featured in ChatGPT, Gemini, Perplexity & more."` |
| **Card 4** | Lightning Bolt | `Traffic & Revenue` | `"Drive more organic traffic, leads, and sales on autopilot."` |

* **Card Styling:**
  * Background: Dark Slate Navy (`#0B0F19`).
  * Border: `1px solid rgba(255, 255, 255, 0.06)`.
  * Padding: `32px 24px`.
  * Border Radius: `16px`.
  * Icon Badge Container: `56px x 56px` rounded square (`12px` radius), deep blue gradient background, vibrant glowing blue vector icon inside.
  * Hover State: Border turns glowing blue (`#3B82F6`), subtle `-6px` Y-axis float, shadow `0 12px 30px rgba(37, 99, 235, 0.2)`.

---

### 3.4 Product Showcase / Inside Section ("Your Playbook")

* **Layout:** 2-Column Split (50% Left Mockup, 50% Right Copy & Bullets).
* **Left Column — Product Mockup Visual:**
  * Realistic 3D angled laptop container presenting the `SEOWINS.io` digital dashboard.
  * Screen Contents: Grid of strategy modules, filter sidebar, dark theme UI cards, "Inside SEOWINS.io" top branding.
* **Right Column — Value Proposition Copy:**
  1. **Top Badge:** `Inside SEOWINS.io` (Dark blue pill with sky blue text).
  2. **Heading (H2):** `"Your Playbook for SEO & AI Visibility"`
     * `"Your Playbook for"` -> Pure White `#FFFFFF`
     * `"SEO & AI Visibility"` -> Electric Blue Gradient Fill
  3. **Checklist Bullet Items:**
     * `[✓] Rank higher on Google & Bing`
     * `[✓] Get cited in AI answers`
     * `[✓] Optimize content that converts`
     * `[✓] Stay ahead of the competition`
     * *Checkmark Icon Style:* Electric blue circle checkmark container with cyan glow.
  4. **Action Button:**
     * Text: `Explore Strategies →`
     * Style: Solid Blue (`#2563EB`) CTA Button with right arrow.

---

### 3.5 Social Proof & Testimonials Section

* **Layout:** 2-Column Asymmetric Layout (Left: Impact Statistics, Right: Featured Testimonial Card).

#### Left Side — Social Proof Statistics
* **Heading (H2):**
  * Line 1: `Trusted by SEO Professionals` (White `#FFFFFF`)
  * Line 2: `Marketers & Business Owners` (Gradient Blue Fill)
* **3-Stat Counter Grid:**
  1. **Stat Item 1:**
     * Icon: People / Group Icon (Blue glow container)
     * Metric: `2,500+` (`28px` Bold White)
     * Label: `Happy Members` (`14px` Muted Slate)
  2. **Stat Item 2:**
     * Icon: Rocket Icon (Blue glow container)
     * Metric: `150+` (`28px` Bold White)
     * Label: `Proven Strategies` (`14px` Muted Slate)
  3. **Stat Item 3:**
     * Icon: Growth Graph Icon (Blue glow container)
     * Metric: `Millions` (`28px` Bold White)
     * Label: `of Organic Visits Generated` (`14px` Muted Slate)

#### Right Side — Featured Testimonial Card
* **Card Container:**
  * Background: `#0D1322`
  * Border: `1px solid rgba(255, 255, 255, 0.08)`
  * Padding: `36px`
  * Radius: `20px`
  * Position: Relative (with large translucent blue double-quote graphic `”` anchored top-right).
* **Card Contents:**
  1. **Star Rating:** 5 Gold Stars (`★★★★★`, `#F59E0B`).
  2. **Quote Text:**
     * `"SEOWINS.io completely changed the way I approach SEO. The AI strategies helped me get featured in ChatGPT and increase traffic like never before."`
     * Typography: `16px` Regular, line-height `1.6`, text color `#F8FAFC`.
  3. **Author Info Bar:**
     * Avatar: Circular portrait photo of James R. (`48px x 48px`, rounded-full with blue border halo).
     * Author Name: `James R.` (`16px` Semi-Bold White).
     * Author Role: `Affiliate Marketer` (`14px` Muted Slate).

---

### 3.6 Bottom Conversion Banner (Offer CTA)

* **Container Design:**
  * Full-width dark slate card with internal radial blue glow (`background: linear-gradient(180deg, #0B101D 0%, #060912 100%)`).
  * Border: `1px solid rgba(59, 130, 246, 0.3)`.
  * Radius: `20px`.
  * Padding: `40px 48px`.
* **Flex Layout (Space-between):**
  * **Left Text Side:**
    * Main Title (H3): `Get Lifetime Access for a One-Time Payment` (`24px` Bold White).
    * Subtitle: `Pay once, get lifetime access to 150+ SEO & AI SEO strategies.` (`15px` Muted Slate `#94A3B8`).
  * **Right Offer Side:**
    * **Price Group:**
      * `$79` (`36px` Bold White)
      * `$179` (`20px` Strikethrough Muted Gray `#64748B`)
    * **CTA Button:**
      * Text: `Get Access Now →`
      * Button style: Vibrant Blue (`#2563EB`), height `50px`, padding `0 32px`, border-radius `10px`, glowing box shadow `0 0 20px rgba(37, 99, 235, 0.4)`.

---

### 3.7 Footer Section

* **Top Divider:** `1px solid rgba(255, 255, 255, 0.05)`.
* **Grid Layout:** 4 Columns (Brand Info, Quick Links, Legal, Social Follow).

| Column | Header | Content List |
| :--- | :--- | :--- |
| **Col 1 (Brand)** | `SEOWINS.io` Logo | `"The ultimate playbook for SEO and AI SEO strategies to grow traffic, leads, and revenue."` |
| **Col 2 (Quick Links)**| `Quick Links` | `Strategies`<br>`AI SEO`<br>`Pricing`<br>`Testimonials`<br>`FAQ` |
| **Col 3 (Legal)** | `Legal` | `Terms of Use`<br>`Privacy Policy`<br>`Refund Policy`<br>`Contact Us` |
| **Col 4 (Follow Us)**| `Follow Us` | Social Icon Group:<br>• **Twitter (X)** Icon<br>• **YouTube** Icon<br>• **LinkedIn** Icon |

* **Bottom Copyright Bar:**
  * Center aligned text: `© 2025 SEOWINS.io — All rights reserved.`
  * Typography: `13px` Muted Slate `#64748B`.

---

## 4. UI Component Library Specification

### 4.1 Buttons & Interactive States

#### Primary Blue Button (`.btn-primary`)
```css
.btn-primary {
  background-color: #2563EB;
  color: #FFFFFF;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background-color: #1D4ED8;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.6);
}
```

#### Glass Pill Badge (`.badge-pill`)
```css
.badge-pill {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60A5FA;
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

## 5. Responsive Layout Strategy & Breakpoints

* **Desktop Superwide (1440px+):** Max container width `1240px`, centered. Full multi-column grids.
* **Standard Desktop (1024px - 1439px):** Container width `960px` to `1140px`. Hero graphics side-by-side.
* **Tablet (768px - 1023px):**
  * Hero switches to stacked vertical layout (Left copy top, Right image bottom).
  * 4-Column Feature Grid drops to 2x2 matrix grid.
  * Product showcase converts to vertical stack (Mockup top, Copy bottom).
  * Social proof stats & testimonial stack vertically.
* **Mobile (< 767px):**
  * Single column flow (`flex-direction: column`).
  * Hero title font size drops to `36px`.
  * CTA buttons expand to full width (`width: 100%`).
  * Floating AI badges horizontal scroll or touch carousel.

---

## 6. Implementation Checklist & Acceptance Criteria

- [x] **Color Accuracy:** Verify pitch black canvas background (`#05070E`) and electric blue accents (`#2563EB`).
- [x] **Typography Setup:** Load `Inter` or `Outfit` from Google Fonts with weights 400, 500, 600, 700, 800.
- [x] **Glow Filters:** Implement radial gradient halos behind hero visual, CTAs, and cards.
- [x] **Floating Badges:** Render glassmorphic cards for Google, ChatGPT, Gemini, Perplexity, and Bing.
- [x] **Content Copy Precision:** Ensure exact copy for headlines, features, statistics, testimonial quote, and footer links match `websitedesign.jpg`.
