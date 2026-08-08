# ANRA Health — Next.js (converted from Vite/React)

## Setup

```bash
npm install
cp .env.example .env.local
# edit .env.local and paste your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000

## Build for production (self-hosted)

```bash
npm run build
npm run start
```

Or, since `next.config.js` uses `output: "standalone"`, you can deploy just the
standalone build (smaller, no need for full node_modules on the server):

```bash
npm run build
node .next/standalone/server.js
```

Set `GEMINI_API_KEY` as a real environment variable on your server (not a
`.env` file committed to git).

## What changed from the old Vite app

- Stack: Vite + React Router → Next.js 15 (App Router) + TypeScript
- Routing: `react-router-dom` `<Routes>` → file-based routing in `src/app/`
- API: Vercel serverless functions in `/api` → Next.js Route Handlers in
  `src/app/api/*/route.ts` (same Gemini logic, same safety checks — just a
  different file convention)
- Model: `gemini-2.0-flash` (deprecated) → `gemini-2.5-flash-lite` in all 3
  AI routes
- Assets: Vite static imports → files in `/public`, referenced by absolute path
- No Vercel-specific files (vercel.json, etc.) — deploy anywhere Node runs

## What's intentionally unchanged

Every page, every feature, every translation across all 9 languages, the AI
symptom checker's emergency safety net (client + server side), the physician
matcher, and the referral PDF generator all work exactly as before — this was
a stack conversion, not a redesign.

## Known follow-up items (not done in this pass)

- Full strict TypeScript typing (currently loose/permissive — see tsconfig.json)
- Dr. Kapoor's full platform vision (new design direction, specialty pages,
  genomics/longevity sections, AI agent platform, CMS, database) — separate,
  much larger phase of work
- Self-hosted deployment specifics (Docker/Nginx/SSL) — depends on your
  server details, not yet configured
