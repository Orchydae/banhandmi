---
name: frontend
description: Instructions for building and maintaining the @banhandmi mobile-first React TypeScript frontend
---

# Mobile Frontend Skill

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Framework   | React 19 + TypeScript          |
| Build tool  | Vite 6                         |
| Styling     | Vanilla CSS (custom properties)|
| Fonts       | Google Fonts (see Typography)  |
| Linting     | ESLint flat config + TS-ESLint |

## Design System

### Colors

| Token                | Value       | Usage                              |
|----------------------|-------------|-------------------------------------|
| `--color-primary`    | `#FFC067`   | Primary golden accent               |
| `--color-primary-light` | `#FFD699` | Lighter golden for subtle fills    |
| `--color-primary-dark`  | `#E5A044` | Darker golden for text on gold bg  |
| `--color-accent`     | `#069494`   | Teal accent (name, counters, icons)|
| `--color-accent-dark`| `#2B7A78`   | Darker teal for borders/rings      |
| `--color-bg-start`   | `#FFF5E6`   | Gradient start (top)               |
| `--color-bg-mid`     | `#FFE0B2`   | Gradient midpoint                  |
| `--color-bg-end`     | `#FFC067`   | Gradient end (bottom)              |
| `--color-secondary`  | `#FDFBD4`   | Secondary background light yellow  |
| `--color-dark`       | `#010302`   | Dark base for text and dark glass  |

Background uses a `radial-gradient` for the top left and bottom right over `var(--color-secondary)`, attached as `fixed`.

### Typography

| Font               | CSS Variable       | Usage                                       |
|--------------------|---------------------|----------------------------------------------|
| **Plus Jakarta Sans** | `--font-body`    | All body text, labels, card titles, UI copy  |
| **Space Mono**        | `--font-display` | Big titles, counters, terminal text, tech-related elements, badges |

Weights loaded: Plus Jakarta Sans 400–800, Space Mono 400 & 700.

### Glassmorphism

The core visual effect. Panels use blurred translucent backgrounds to create a dreamy, ethereal feel.

**Standard glass** (`.glass` class):
```css
background: rgba(253, 251, 212, 0.3);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.45);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
```

**Glass on Background** (`.glass--on-bg` class, used when sitting over secondary color):
```css
background: rgba(255, 192, 103, 0.3);
backdrop-filter: blur(18px);
-webkit-backdrop-filter: blur(18px);
border: 1px solid rgba(255, 255, 255, 0.45);
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
```

**Dark tint glass** (for accent panels like stats counter):
```css
background: rgba(1, 3, 2, 0.3); /* --color-dark at 30% opacity */
border: 1px solid rgba(255, 192, 103, 0.3);
```

**Dark glass** (for terminal/code panels):
```css
background: rgba(30, 30, 30, 0.75);
border: 1px solid rgba(255, 255, 255, 0.08);
```

Always include both `backdrop-filter` and `-webkit-backdrop-filter` for Safari support.

### Spacing & Radius

Spacing tokens: `xs(4px)`, `sm(8px)`, `md(16px)`, `lg(24px)`, `xl(32px)`, `2xl(48px)`.
Border radius: `sm(12px)`, `md(20px)`, `lg(28px)`, `full(50%)`.

## Component Architecture

- Global components live in `src/components/`.
- Global hooks live in `src/hooks/`.
- Feature modules live in `src/modules/` (inside modules, follow the same structure: `components/` and `hooks/` if needed).

Each component has a co-located `.tsx` + `.css` pair.

| Component        | Purpose                                           |
|------------------|----------------------------------------------------|
| `ProfileHeader`  | Avatar ring, handle, name, bio, share, stats counter|
| `FeatureGrid`    | 2×2 bento grid of glass feature cards              |
| `SocialLinks`    | Row of social media icons (TikTok, IG, YT, Threads)|
| `TerminalPanel`  | Dark glass console with animated typing lines      |

## Conventions

- **Mobile-first**: All layouts target a single-column 420px-max view. App is centered via flexbox on `#root`.
- **BEM naming**: CSS classes use `block__element--modifier` pattern, e.g. `feature-card__icon`, `feature-card--golden`.
- **No CSS frameworks**: All styles are vanilla CSS using custom properties from `index.css`.
- **Icons**: Use `lucide-react` for standard icons. Use inline SVGs only for brand icons (e.g., TikTok, Threads) missing from lucide.
- **Animations**: Use CSS `@keyframes` and `transition` for micro-animations. Keep durations 0.2–0.5s.
- **Accessibility**: All interactive elements must have `aria-label`. Use semantic HTML (`header`, `nav`, `section`).

## Running

- `npm run dev` — Start Vite dev server
- `npm run build` — Production build to `dist/` **(Skip this step if only modifying CSS files)**
- `npm run lint` — ESLint check
