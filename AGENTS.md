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
| `office.js` | Three.js scene (loaded via CDN import map, v0.170.0). Procedural office geometry, box-model characters, A* pathfinding for idle roaming, sofa/TV animations. Polls `/api/activity` every 5s. |
| `index.html` | Single-page shell. Import map pins Three.js + addons to CDN. UI is Indonesian (`lang="id"`). |
| `style.css` | All styles in one file, minified first line + readable additions. |
| `assets/kenney/` | GLB models (Kenney furniture pack, CC0). Referenced by name in `office.js`. |

## Key details

- **No build/bundle** — edit files, refresh browser. Three.js loaded from `cdn.jsdelivr.net` via import map in `index.html`.
- **Server reads local filesystem** — `server.mjs` reads `%USERPROFILE%\.gemini\antigravity\brain\` for transcript data. Windows paths assumed (`process.env.USERPROFILE`).
- **Workers array** — 5 characters (Joko=main session, Budi/Sari/Agus/Rina=subagents). Mapping is index-based in `updateActivity()`.
- **All UI text is Indonesian** — keep labels, status messages, and UI strings in Indonesian.
- **No tests, no linter, no TypeScript** — vanilla JS, no tooling to run.
