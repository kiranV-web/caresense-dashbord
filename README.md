# CareSense — Dashboard

The admin dashboard for CareSense: the customer list, each customer's full call history, a per-call view with the playable recording, the transcript, the AI summary and mood timeline, and the ranked "needs a manager's attention today" queue across all calls. Everything on this page is read from the API in the sibling [`careSense-server`](https://github.com/kiranV-web/careSense) repository — that repo's README covers the transcription/analysis pipeline and the manager-attention scoring formula in full; this one covers the frontend.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript, built with Vite |
| Routing | React Router v7 |
| Styling | styled-components |
| Charts / audio | Custom waveform + sentiment-timeline components (no charting library) |
| Serving | Docker multi-stage build → static files served by Nginx, reverse-proxying `/api/*` to the backend container |
| Deployment | Same DigitalOcean Droplet as the backend, via the root-level `docker compose` |

## What's on each page

| Route | What it shows |
|---|---|
| `/` | Home dashboard — KPIs, the "Requires attention" tile (count + top reasons, click through to the ranked queue), the conversation-quality radar, reported-issue trends, the AI coaching insight, and a recent-calls preview |
| `/calls` | The full call list, with filter chips including **Requires attention** — the ranked, score-first manager queue |
| `/calls/:id` | Call detail — playable recording synced to the transcript, per-segment speaker/timestamp/mood, the AI summary and resolution verdict, the 7-rule etiquette check with quoted evidence per rule, and (for flagged calls) the attention score with a hover breakdown of exactly how it was calculated |
| `/customers` | Every customer, searchable by caller ID or logged name |
| `/customers/:id` | One customer's complete call history — every recording and transcript they're attached to |
| `/team` | Per-agent call volumes, handle times, and outcomes, plus a heatmap of etiquette performance across the team |
| `/team/:agentId` | One agent's activity heatmap, etiquette pass/fail breakdown, and recent calls |
| `/recurring-groups/:id` | A recurring-issue cluster — the AI's verdict, recommended action, and the timeline of every call in it |
| `/upload` | Drag-and-drop ZIP upload with live progress — safe to refresh mid-upload; processing continues server-side and progress picks back up on reload |
| `/chat` | The chat agent — ask a question in plain English, answered from real call data via ~20 predefined data functions, not free-text generation |
| `/settings` | Recurrence lookback window, ideal call duration, enabled etiquette rules |

### Where the call's "notion" comes from

On the call-detail page, the sentiment waveform and transcript are colour-coded per speaker turn from the backend's per-segment mood classification — so the exact moment a customer went from neutral to irritated, or an agent's tone read as rude, or the call ended on a satisfied note, is visible and clickable, not just summarised in prose.

### The attention score, consistently everywhere

The same score, urgency label, and reasons appear identically on the Home tile, the attention-queue rows, and the call-detail page — the frontend never recalculates it; every view reads the same number from the API. A score of 99 is the ceiling and means the call needs direct manager review now.

## Environment variables (build-time)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | *(blank)* | Leave blank in production — API calls go through the same-origin Nginx proxy. Set only for pointing at a different API host in development. |
| `VITE_MAX_UPLOAD_BYTES` | `209715200` (200 MB) | Client-side upload size guard, shown in the upload UI |
| `VITE_SHOW_TRANSCRIPT_TONE` | `true` | Toggles the per-line mood label in the transcript view |

## Running it from scratch

### Local development

Requires the backend running first (see `careSense-server`'s README) — its dev server listens on `:1000` by default, which is what this dashboard's Vite dev server proxies `/api` to (`vite.config.ts`).

```bash
npm install
npm run dev          # Vite dev server on :5173, proxies /api → http://localhost:1000
```

```bash
npm run build         # production build (tsc -b && vite build)
npm run preview        # preview the production build locally
npm run lint
```

### Full stack in Docker

This repo doesn't run standalone in Docker — it's built and served as part of the root-level `docker-compose.yml` one directory above both repos, alongside the API, worker, Postgres, and Redis. From that parent directory, with `careSense-server` and `careSense-dashboard` checked out as siblings:

```bash
cp .env.example .env      # fill in secrets — see careSense-server's README for the full list
docker compose up -d --build
```

Open `http://<droplet-ip>/` (or `http://localhost/` locally) — only the dashboard's port 80 is published; it reverse-proxies every `/api/*` request to the backend container internally.
