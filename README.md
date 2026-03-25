# Bánh and Mi

A Tamagotchi-style interactive web app for a Shiba Inu character named Bánh — the Professional Dreamer with (A)ugmented (I)nstinct. Features health meters, mood tracking, dream artifacts, favorite treats, and a terminal-style log panel.

## Tech Stack

- **React 19** + **TypeScript** — UI and type safety
- **Vite** — dev server and bundler
- **Supabase** — backend (database + auth)
- **Recharts** — data visualization (weight graph, metrics)
- **Lucide React** — icons
- **React Router DOM** — client-side routing

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- A [Supabase](https://supabase.com/) project (for backend data)

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/banhandmi.git
   cd banhandmi
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=<your-supabase-project-url>
   VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

   You can find these values in your Supabase project dashboard under **Settings → API**.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start Vite dev server with HMR       |
| `npm run build`     | Type-check with `tsc` then build     |
| `npm run preview`   | Preview the production build locally  |
| `npm run lint`      | Run ESLint across the project         |

## Project Structure

```
src/
├── components/
│   ├── FeatureGrid/        # Feature menu grid
│   ├── ItemCard/           # Individual item display
│   ├── ItemGrid/           # Grid layout for items
│   ├── ItemList/           # List layout for items
│   ├── OgotchiPrototype/   # Tamagotchi-style UI (health meters, buttons, weight graph)
│   ├── ProfileHeader/      # Pet profile header
│   ├── SocialLinks/        # Social media links
│   └── TerminalPanel/      # Terminal/log display
├── modules/
│   └── CategoryPage/       # Category browsing pages
├── hooks/                  # Custom React hooks (items, hunger, mood, treats, etc.)
├── lib/
│   └── supabase.ts         # Supabase client setup
├── App.tsx                 # Root component with routing
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Deployment

Run `npm run build` to produce a production bundle in the `dist/` directory. Deploy the contents of `dist/` to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).

For single-page app routing to work, configure your host to redirect all paths to `index.html`.
