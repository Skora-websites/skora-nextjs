<div align="center">
  <br />
  <div>
    <img src="./public/logo.svg" alt="SUDO CRM Logo" width="80" height="80" />
  </div>
  <br />
  <h1>SUDO CRM</h1>
  <p>
    <strong>A modern, full-stack Customer Relationship Management platform</strong>
  </p>
  <p>
    Built with Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Firebase · Recharts
  </p>
  <br />
</div>

---

## Overview

**SUDO CRM** is a production-ready CRM platform designed for sales teams to manage leads, customers, deals, and contacts through an intuitive dashboard with powerful analytics. It features a modern UI with dark/light mode, responsive layout, and a comprehensive theme configurator.

---

## ✨ Features

### Core Modules

| Module       | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| **Dashboard** | Real-time KPIs, revenue charts, deal pipeline visualization, activity feed |
| **Leads**     | Track and manage sales leads with status, source, and probability tracking |
| **Pipeline**  | Visual deal pipeline with drag-and-drop stages (Kanban-style)       |
| **Customers**  | Customer profiles with lifetime value, deal history, and contact management |
| **Contacts**   | Centralized contact directory with communication history             |
| **Analytics**  | Revenue trends, conversion metrics, lead source analysis, forecasting |
| **Settings**   | User preferences, theme configuration, profile management            |

### User Experience

- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Dark/Light Mode** — Toggleable with system preference detection
- **Theme Configurator** — Customizable sidebar type, navbar fixed/static, mini sidebar
- **Glassmorphism UI** — Modern blurred navbar and card effects
- **Smooth Animations** — Framer Motion powered micro-interactions
- **Skeleton Loaders** — Loading states for all async content
- **Accessibility** — Keyboard navigable, screen-reader supported

---

## 🚀 Tech Stack

| Category       | Technology                                                    |
| -------------- | ------------------------------------------------------------- |
| **Framework**  | [Next.js 16](https://nextjs.org/) (App Router)                |
| **UI Library** | [React 19](https://react.dev/)                                |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)                 |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/)                   |
| **Components** | [Radix UI](https://www.radix-ui.com/) (primitives)            |
| **Animation**  | [Framer Motion](https://www.framer.com/motion/)               |
| **Charts**     | [Recharts](https://recharts.org/)                             |
| **Database**   | [Firestore](https://firebase.google.com/products/firestore)   |
| **Auth**       | [Firebase Auth](https://firebase.google.com/products/auth) (email/password + Google OAuth) |
| **Session**    | Firebase session cookies via Firebase Admin SDK               |
| **Icons**      | [Lucide React](https://lucide.dev/)                           |
| **Validation** | [Zod](https://zod.dev/)                                       |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (or pnpm, yarn, bun)
- A **Firebase** project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/sudarshank264/SUDOCRM.git
cd SUDOCRM

# Install dependencies
npm install
```

### Environment Variables

Edit `.env` with your Firebase credentials:

```bash
# Firebase Admin SDK (service account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
# or path to service account file:
# FIREBASE_SERVICE_ACCOUNT_PATH=path/to/service-account.json

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── app/                    # App Router pages & layouts
│   ├── (auth)/             # Authentication (login, register)
│   ├── analytics/          # Analytics & reports
│   ├── api/                # API routes (leads, customers, deals, etc.)
│   ├── contacts/           # Contact management
│   ├── customers/          # Customer management
│   ├── dashboard/          # Main dashboard
│   ├── leads/              # Lead management
│   ├── pipeline/           # Deal pipeline
│   └── settings/           # Settings & preferences
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/             # Shell, sidebar, navbar, theme configurator
│   ├── providers/          # Auth & theme providers
│   ├── shared/             # Data table, empty state, page header
│   └── ui/                 # Radix UI primitives & base components
├── hooks/                  # Custom React hooks (useApiData, etc.)
├── lib/                    # Firebase config, auth, Firestore services
├── public/                 # Static assets
├── types/                  # TypeScript type definitions
└── middleware.ts            # Route protection via session cookies
```

---

## 🔒 Authentication

SUDO CRM uses **Firebase Authentication** with session cookie management:

- **Email/Password** — Secure credentials-based signup and login
- **Google OAuth 2.0** — Sign in with Google account (popup or redirect flow)
- **Session Cookies** — Server-side sessions via Firebase Admin SDK (`verifySessionCookie` with revocation)
- **Role-based access** — Supports `admin`, `manager`, and `agent` roles stored in Firestore

Protected routes are enforced via **Next.js Middleware** using the session cookie.

---

## 🎨 Design System

The CRM follows a **clean, modern, and functional** design language:

| Token              | Value    | Usage                              |
| ------------------ | -------- | ---------------------------------- |
| `$primary`         | `#5e72e4` | Buttons, links, active nav         |
| `$success`         | `#2dce89` | Approval badges, positive stats    |
| `$danger`          | `#f5365c` | Delete actions, errors             |
| `$warning`         | `#fb6340` | Pending states, cautionary notices |
| `$info`            | `#11cdef` | Informational highlights           |
| `$dark`            | `#344767` | Headings, primary text             |

Design tokens are defined in `app/globals.css` via Tailwind v4 `@theme` directives.

---

## 🧪 Scripts

| Script            | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start development server       |
| `npm run build`   | Create production build        |
| `npm start`       | Start production server        |
| `npm run lint`    | Run ESLint                     |
| `npx next build`  | Typecheck + build              |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

<div align="center">
  <sub>Built with ❤️ using Next.js, React, and TypeScript</sub>
</div>
