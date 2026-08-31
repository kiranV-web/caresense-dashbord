# CareSense — Dashboard

The admin dashboard for CareSense: the customer list, each customer's full call history, a per-call view with the playable recording, the transcript, the AI summary and mood timeline, and the ranked "needs a manager's attention today" queue across all calls. Everything on this page is read from the API in the sibling [`careSense-server`](https://github.com/kiranV-web/careSense) repository — that repo's README covers the transcription/analysis pipeline and the manager-attention scoring formula in full; this one covers the frontend.

**Live site:** [https://kirancodez.com/](https://kirancodez.com/)

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
| `/` | Home dashboard — KPIs, a **Requires attention** tile showing the active count, highest score/urgency, and category breakdown, plus conversation quality, reported-issue trends, AI coaching, and recent calls |
| `/calls` | The full call list. **Requires attention** switches to an individually ranked, score-first queue where every row shows rank, numeric score, urgency, primary reason, additional flags, and waiting time. |
| `/calls/:id` | Call detail — playable recording synced to the transcript, speaker/timestamp/mood data, AI summary, resolution and etiquette results, plus (when applicable) a prominent attention score with expandable factors, rank, calculation time, and previous/next attention navigation |
| `/customers` | Caller directory grouped by caller ID, searchable by caller ID or any logged name. Cards show name aliases, totals, and outcome-coloured call-history dots. |
| `/customers/:id` | One caller ID's complete call history. Different names logged against that ID remain visible as aliases; selecting a call opens the existing call-detail route. |
| `/team` | Per-agent call volumes, handle times, and outcomes, plus a heatmap of etiquette performance across the team |
| `/team/:agentId` | One agent's activity heatmap, etiquette pass/fail breakdown, and recent calls |
| `/recurring-groups/:id` | A recurring-issue cluster — the AI's verdict, recommended action, and the timeline of every call in it |
| `/upload` | Drag-and-drop ZIP upload with client validation, byte-upload progress, live processing stages, per-file errors, and batch cancellation. After the API returns a batch ID, processing survives navigation or refresh and progress is restored from the server. |
| `/chat` | The chat agent — ask a question in plain English, answered from real call data via ~20 predefined data functions, not free-text generation |
| `/settings` | Recurrence lookback window, ideal call duration, enabled etiquette rules |

### Where the call's "notion" comes from

On the call-detail page, the sentiment waveform and transcript are colour-coded per speaker turn from the backend's per-segment mood classification — so the exact moment a customer went from neutral to irritated, or an agent's tone read as rude, or the call ended on a satisfied note, is visible and clickable, not just summarised in prose.

### The attention score, consistently everywhere

The frontend never calculates or infers attention scores. It renders the backend's shared score object through `ManagerAttentionScore`: `compact` on Home, `standard` in queue rows, and `prominent` on call detail.

- Home shows the active count, highest current numeric score and urgency label, plus the category breakdown—never an average.
- The queue is sorted by the backend and shows each call's rank, score, urgency, primary reason, additional flags, and waiting time without expanding the row.
- Call detail shows the same result beside the title and exposes **Why this score?**, factor values, calculation time, queue position, and previous/next attention calls.

The backend caps scores at 99. Numeric scores are always paired with their text label; colour is supplementary, not the only signal.

## Environment variables (build-time)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | *(blank)* | Optional base URL for upload/progress requests. Leave blank for the normal same-origin Vite/Nginx proxy. Other dashboard reads currently use same-origin `/api` paths. |
| `VITE_MAX_UPLOAD_BYTES` | `209715200` (200 MB) | Client-side upload size guard, shown in the upload UI |
| `VITE_SHOW_TRANSCRIPT_TONE` | `true` | Toggles the per-line mood label in the transcript view |

## Running it from scratch

### Local development

Requires Node.js 22 or newer and the backend running first (see `careSense-server`'s README). The backend's example environment listens on `:1000`, which is where this dashboard's Vite server proxies `/api` (`vite.config.ts`).

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
