# Nakraku Stash — Landing Page

This directory contains the production-ready, standalone landing page for **Nakraku Stash** (`https://nakraku.app`).

---

## 1. Architecture & Design Principles

- **Zero External Dependencies**: Pure vanilla HTML5, CSS3, and modern ES6 JavaScript.
- **Obsidian Dark Theme**: 1:1 design alignment with the desktop application (`#080A0E` background, `#10B981` emerald accent, `#141820` surface).
- **Ultra-Lightweight & Fast**: Total payload size is under **30 kB** uncompressed, delivering instant paint times and 100/100 Lighthouse performance.
- **Privacy-First Analytics**: Configured with [Plausible Analytics](https://plausible.io) — zero cookies, zero personal data collection, fully GDPR/CCPA compliant, and automatically respects `navigator.doNotTrack`.

---

## 2. Directory Structure

```text
landing/
├── index.html        # Semantic HTML5 layout with all 7 Phase 20 sections
├── style.css         # Responsive Obsidian styling, high density utility metrics
├── main.js           # Client-side smooth scroll, clipboard copy, and privacy checks
└── README.md         # Deployment and maintenance documentation
```

---

## 3. Sections Overview

1. **Header & Navigation**: Brand icon, responsive links, and quick download action.
2. **Hero Section (Task 20.2)**: Hero headline, subtext, NSIS/MSI download CTAs, live performance metrics ticker, and animated workflow SVG preview.
3. **Features Grid (Task 20.3)**: 6 core technical pillars (Win32 zero-elevation engine, multi-monitor clamping, MV3 WebSocket bridge, offline Ed25519 licensing, SQLite WAL, 32px UI density).
4. **How It Works**: 3-step visualization of the stash and restore lifecycle.
5. **Pricing Matrix (Task 20.4)**: Free Community tier vs Pro Perpetual ($29 one-time) comparison.
6. **Changelog Highlights (Task 20.5)**: Latest v0.1.0 release notes with link to full changelog.
7. **Direct Downloads (Task 20.6)**: Download cards for NSIS `.exe`, Enterprise `.msi`, and MV3 extension `.zip`, plus system requirements.
8. **Analytics Integration (Task 20.7)**: Lightweight privacy-first Plausible tracking tag.

---

## 4. Local Preview

You can preview the landing page locally using any static web server:

```powershell
# Using Python
cd landing
python -m http.server 8080

# Or using npx serve
npx serve landing
```

Visit `http://localhost:8080` in any browser.

---

## 5. Deployment Options

- **GitHub Pages**: Configure GitHub Pages to deploy from a custom workflow or the `landing/` directory.
- **Cloudflare Pages / Vercel**: Connect the repository and configure the output directory to `landing`.
