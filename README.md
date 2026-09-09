# Source to Target

Aditya Raj's portfolio — a scrolling single-page site built around an interactive 3D
data-lineage graph (source → systems → skills → connect), mirroring the STT
(Source-to-Target) analysis and lineage tracing he does professionally.

Built with Vite, React, and React Three Fiber.

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
  data/content.js   — résumé content (edit copy here)
  hooks/            — scroll-driven behavior (word reveal, constellation draw, active-section rail)
  components/        — Hero (3D graph), Source, Experience, Projects, Skills, Connect sections
  styles/global.css
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint
