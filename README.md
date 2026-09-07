# Manabu v0.11.9 beta

## v0.11.9 navigation update
- Progress now lives inside **Me → Progress** instead of occupying a bottom-navigation slot.
- Bottom navigation is simplified to **Learn · Friends · Me**.
- Existing XP, streaks, quiz mastery and other locally stored progress are unchanged.


**Tutor pronunciation audio:** Tutor answers now include a **🔊 Hear Japanese** control. Local dictionary/course lookups use the app's hidden Japanese-script speech targets for more reliable Japanese text-to-speech. Live AI tutor lookups now request a hidden Japanese speech form while keeping the learner-facing answer romaji-first. The Tutor intro explains that learners can type a word naturally and tap the audio control to hear it.

# Manabu v0.11.7 beta

**Major curriculum expansion:** Manabu now has hundreds of feed lessons and vocabulary cards across six learning levels: Beginner, Conversational Beginner, Intermediate, Upper Intermediate, Advanced, and Manabu Master.

- All 42 Search packs now feed useful vocabulary and phrases into the learning curriculum.
- Dedicated level tabs let learners browse any stage without losing their For You position.
- Higher levels include a curated bank of longer grammar patterns, natural connectors, nuanced expressions, and dedicated vocabulary cards.
- For You remains adaptive and is capped to a large rotating working set so the phone does not render the entire curriculum at once.
- Existing progress, XP, saved items, quiz history, streaks, and feed positions remain in local storage.

# Manabu v0.11.5 beta

**PWA relaunch fix:** saved Home Screen apps now fall back to the Manabu app shell instead of showing `Not found` when reopened at a previously visited route.

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


## v0.11.5
- Learn feed now remembers the exact lesson you were on when switching to Friends, Progress or Me.
- Feed position is saved locally and restored after closing/reopening the installed web app.
- For You and Beginner keep separate remembered positions.


## v0.11.7 Tutor rebuild
- Type a bare English word such as `who` and get `dare`; type `dare` and get `who`.
- No need to write `what does ___ mean?`, `___ in Japanese`, or specify the direction.
- Supports English, Japanese romaji, and known Japanese-script course words while keeping tutor answers romaji-first.
- Fixed the old substring bug that could answer `nani` for `who` because the question itself contained `what`.
- Tutor now indexes the full lesson + Search vocabulary library, not just the old small hard-coded list.
- Unknown words/phrases automatically fall through to the configured Live AI server instead of saying they are not in the prototype vocabulary.
