# Palsyr

A mobile-first 2D RPG-style web game: explore an overworld, catch and breed
creatures called Pals, battle trainers and friends, and trade on a simulated
social platform — all persisted to `localStorage`, no backend required.

Built with React + Vite + Tailwind for UI, and HTML5 Canvas for the
tile-based world (camera, minimap, sprites).

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs static files to `../palsyr` (served at `/palsyr/` alongside the rest
of this GitHub Pages site), since `vite.config.js` sets `base: '/palsyr/'`
and `build.outDir`.

## Project structure

- `src/data/` — seed data: species, subspecies, world map generation, city
  definitions, trainers, jobs, mock bot profiles.
- `src/lib/` — pure game logic: Pal stat rolling, the turn-based battle
  engine, breeding, market pricing (Master Log), the mock social "server"
  module (`social.js` — swappable for a real backend), localStorage
  persistence.
- `src/state/GameContext.jsx` — the single React context wiring persisted
  player state + Master Log to game actions.
- `src/components/game/` — Canvas renderer, D-pad, minimap, bottom menu.
- `src/components/panels/` — Inventory, Jobs, Master Log, Social overlays.
- `src/components/buildings/` — Market, Nursery, Pound screens.
- `src/components/battle/` — shared battle UI (used by both PvE and Social).
