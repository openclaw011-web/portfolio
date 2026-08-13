# Prabesh Amgain — Motion Portfolio

A minimalist, motion-graphics portfolio for **Prabesh Amgain**, built with React, TypeScript, GSAP and Lenis. Content is driven live by his GitHub profile (github.com/Prabeshamgain) and rendered through an editorial, alche.studio / alethia.earth-inspired design language.

![hero](docs/screenshots/1-hero-dark.png)

## ✨ Highlights

- **Fluid motion** — Lenis smooth scrolling synced with GSAP ScrollTrigger; char-by-char hero reveal; pinned horizontal-scroll project showcase; infinite marquee; parallax scroll progress; magnetic buttons and a mix-blend custom cursor.
- **Live GitHub integration** — repo count, followers, stars and update dates fetched from the GitHub API (with graceful offline fallback).
- **Theme system** — dark/light toggle with system-preference detection, no-flash inline init, persisted choice, and smooth token transitions.
- **Localized** — full English (en) and Nepali (ने) dictionaries, auto-detected on first visit and persisted. Even the document title and `lang` attribute switch.
- **Headless-CMS-ready** — a content layer that serves bundled JSON by default and hydrates from any headless CMS endpoint when configured (see below).
- **Accessible & performant** — `prefers-reduced-motion` disables the preloader, pin and heavy transforms (vertical stack instead); semantic HTML, visible focus rings, touch fallbacks for the custom cursor; code-split bundles (≈18 kB gzip main), transform/opacity-only animations, `will-change` discipline, and lazy-heavy chunks.

## 🚀 Quick start

```bash
npm install
npm run dev       # dev server
npm run build     # type-check + production build
npm run preview   # serve the build locally
```

## 🧱 Stack

| Concern        | Choice                                   |
| -------------- | ---------------------------------------- |
| Framework      | React 18 + TypeScript + Vite             |
| Motion         | GSAP (ScrollTrigger) + Lenis             |
| i18n           | Lightweight custom store (en / ne)       |
| CMS            | Adapter layer — local JSON by default    |
| Styling        | Hand-rolled CSS custom properties        |
| Fonts          | Fraunces (display), Space Grotesk (sans), Space Mono (mono) |

## 🗂 Project structure

```
src/
├── components/     # Preloader, Cursor, Nav, Hero, Marquee, About,
│                   # Work (pinned horizontal), Capabilities, Journey,
│                   # Contact, Footer, SectionHeading, ScrollProgress
├── content/        # en.json + ne.json — every word on the site
├── hooks/          # useReveal (scroll-triggered reveals)
├── lib/
│   ├── cms.ts      # headless-CMS content layer (local fallback)
│   ├── github.ts   # live GitHub API client + graceful degradation
│   ├── i18n.tsx    # locale provider (auto-detect, persistence)
│   ├── lenis.ts    # smooth-scroll singleton, synced with ScrollTrigger
│   ├── motion.ts   # GSAP setup, char/word splitters, reduced-motion guard
│   └── theme.ts    # theme store (system pref, persistence, no flash)
└── styles/         # design tokens + global base
```

## 🧠 Headless CMS wiring

The site works out of the box with **zero credentials** (content ships in `src/content/*.json`). To manage content through a headless CMS instead:

1. Copy `.env.example` → `.env`.
2. Point `VITE_CMS_URL` at any endpoint that returns the same shape as the bundled JSON:

   ```json
   {
     "en": { "hero": { "name": "Prabesh Amgain", "...": "..." } },
     "ne": { "hero": { "name": "प्रबेश अम्गाईं", "...": "..." } }
   }
   ```

   Compatible with **Sanity** (HTTP query API), **Contentful** (delivery API behind a tiny edge function), or any serverless JSON endpoint. On load, the app fetches the remote content and hydrates the locale dictionaries; if the fetch fails, bundled content is used.

3. Rebuild. No other code changes needed — the CMS layer (`src/lib/cms.ts`) handles it.

## 🎨 Design decisions

- **Palette** — warm bone `#f2ede4` on ink `#0c0b09` with a single vermilion accent `#ff5c35` (deepened for light mode contrast). One accent, used sparingly.
- **Type** — Fraunces for oversized editorial display (with italic flourishes on alternate lines), Space Grotesk for UI, Space Mono for micro-labels, indexes and metadata.
- **Texture** — an animated SVG film-grain overlay sits above everything at 5% opacity, giving the flat surfaces a subtle analogue warmth.
- **Structure** — one long scroll: preloader → hero → marquee → profile → pinned projects → capabilities → journey → contact → footer.

## 🌍 Deploy

Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages):

```bash
npm run build   # outputs to dist/
```

Update `og:url` / `meta` in `index.html` to the production domain before deploying.

## ✅ QA

A headless-Chromium suite (Playwright) lives in the repo and runs with one command:

```bash
npx playwright-core install chromium   # once
npm run build && npm run preview &      # serve dist/ on :4173
npm run qa                              # runs scripts/qa.mjs
```

It verifies: preloader exit, hero char animation, role rotator, theme toggle + persistence + token colors, locale switch + persistence, work-section pinning, horizontal scrub, **no heading/card overlap at any scroll position**, marquee motion, counters, custom cursor, mobile layout (no overflow, burger menu, full-screen menu navigation), and full reduced-motion fallbacks. Failure screenshots land in `docs/screenshots/qa/`.

> Note: unauthenticated GitHub API calls are rate-limited (60/hour/IP). The app falls back to bundled metadata when the API is unavailable — the site never breaks.
