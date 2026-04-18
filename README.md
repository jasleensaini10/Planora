# Wanderly — Vacation Planner

A React + Vite + Tailwind single-page app for planning multi-day trips with preference-based attraction recommendations, an auto-balanced itinerary generator, drag-and-drop day planning, and an optional Leaflet map view. Trips are saved to `localStorage`.

## Features

- **Create trip**: pick a destination (8 curated cities), select preferences (nature, shopping, food, history, popular), choose 1–14 days via slider.
- **Smart recommendations** scored by rating, preference overlap, and popularity.
- **Plan for me**: auto-generates a balanced day-by-day plan (3–5 activities/day, rotating categories, 8h daily budget).
- **I'll plan myself**: browse recommendations and drag & drop activities between days and an unassigned pool.
- **Map view**: per-day Leaflet map with OpenStreetMap tiles (no API key).
- **Persistent**: all trips stored in `localStorage`.

## Tech

React 18 · TypeScript · Vite · TailwindCSS · react-router-dom · @dnd-kit · react-leaflet · lucide-react · nanoid.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview the built app

## Seeded destinations

Paris, Rome, Tokyo, New York, Barcelona, London, Bangkok, Istanbul — ~15–18 attractions each with ratings, visit times, coordinates, and category tags.

## Project layout

```
src/
  components/   # CategoryBadge, MapView
  context/      # TripsContext (localStorage persistence)
  data/         # attractions.ts, destinations.ts
  lib/          # recommend.ts, planner.ts, storage.ts
  pages/        # Home, CreateTrip, Recommendations, Itinerary
  types.ts      # shared types
```
