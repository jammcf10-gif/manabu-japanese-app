# Manabu v0.11.3 — Live AI setup

Manabu is a speaking-first Japanese learning app. Learners should never need to configure AI settings.

## What the learner does

Open **Friends → Conversation Coach** and tap **Start**.

Manabu automatically checks for Live AI:
- If the secure AI server is running, Manabu uses real dynamic AI conversation.
- If it is not running, Manabu falls back to the built-in conversation coach so the feature still works.

## Make Live AI work locally

You need an OpenAI API key on the server. Do NOT put it inside `index.html`.

### macOS / Linux

```bash
cd manabu-japanese-app
export OPENAI_API_KEY="your-key-here"
npm start
```

### Windows PowerShell

```powershell
cd manabu-japanese-app
$env:OPENAI_API_KEY="your-key-here"
npm start
```

Then open:

```text
http://localhost:8787
```

Now **Start** in Manabu will auto-detect the server and use Live AI.

## Important for Netlify / static hosting

A drag-and-drop Netlify site only hosts static files. It does **not** run `server.mjs`, so true Live AI will not work there by itself.

For a public beta, deploy `server.mjs` (or equivalent serverless functions) to a secure backend and keep `OPENAI_API_KEY` only as a server environment variable. The browser should call the same-origin endpoints:

- `POST /api/manabu-ai`
- `POST /api/manabu-transcribe`

The included `server.mjs` provides both endpoints for local/private-beta use.

## Included files

- `index.html` — Manabu app
- `server.mjs` — secure AI proxy + static server
- `package.json` — local start command
- `manifest.json` — PWA manifest
- `service-worker.js` — basic offline app-shell caching
- `icon.svg` — app icon

## No real-money purchases

The XP shop uses earned learning XP only. There are no real-money payments, paid XP or subscription flows in this build.
