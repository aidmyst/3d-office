# AGENTS.md

## What this is

3D virtual office dashboard that visualizes Antigravity AI agent activity in real-time. No build step, no bundler, no package.json — plain HTML/CSS/JS served by a minimal Node.js static server.

## Run

```sh
node server.mjs          # serves at http://127.0.0.1:8000
PORT=3000 node server.mjs # custom port
```

No install step. No dependencies beyond Node.js (v18+).

## Architecture

| File | Purpose |
|------|---------|
| `server.mjs` | Static file server + `/api/activity` endpoint. Reads Antigravity transcript JSONL files from `~/.gemini/antigravity/brain/` to detect active sessions and subagents. |
| `office.js` | Three.js scene (loaded via CDN import map, v0.170.0). Procedural office geometry, GLB mini-characters with animations (idle/walk/sit), A* pathfinding for idle roaming, sofa/TV turns. Polls `/api/activity` every 5s. |
| `index.html` | Single-page shell. Import map pins Three.js + addons to CDN. UI is Indonesian (`lang="id"`). |
| `style.css` | All styles in one file, minified first line + readable additions. |
| `assets/kenney/` | GLB models (Kenney furniture pack + Mini Characters pack, CC0). Character models in `assets/kenney/characters/glb/`. |

## Key details

- **No build/bundle** — edit files, refresh browser. Three.js loaded from `cdn.jsdelivr.net` via import map in `index.html`.
- **Server reads local filesystem** — `server.mjs` reads `%USERPROFILE%\.gemini\antigravity\brain\` for transcript data. Windows paths assumed (`process.env.USERPROFILE`).
- **Workers array** — 5 characters loaded async via `initWorkers()` (Joko=male-a, Budi=male-b, Sari=female-a, Agus=male-c, Rina=female-b). Mapping is index-based in `updateActivity()`.
- **Character animations** — Kenney Mini Characters GLB models with 32 animations. Uses Three.js AnimationMixer. Active: idle, walk, sit.
- **All UI text is Indonesian** — keep labels, status messages, and UI strings in Indonesian.
- **No tests, no linter, no TypeScript** — vanilla JS, no tooling to run.
