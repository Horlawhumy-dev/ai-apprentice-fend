# AI Apprentice — Frontend

The browser app for the **Capture → Map → Teach** loop: an expert works while the app captures
their actions and the reasoning behind them, that becomes a reviewable Work Map, and an apprentice
is then coached against it on cases they have not seen.

The API lives in a separate repository (see [Backend](#backend)). This app holds no secrets and no
sample data — everything on screen comes from a capture you actually ran.

## Problem

Expert judgement is undocumented and perishable. The person who knows *why* a value was set, when
a case must be escalated, or which exception is acceptable is usually the only person who knows,
and they are unavailable or gone. New people learn by shadowing, which is slow and inconsistent.

Writing it down captures procedure but loses judgement. Recording a screen shows what happened, not
what the expert was weighing. Asking them to fill in a form after the fact gets you a cleaned-up
rationale, not the real one.

## Solution

Three screens, one loop:

- **Expert Capture** (`/expert`) — share a screen, work normally, and narrate the judgement calls.
  Events stream in from the instrumented app; the interviewer asks about a decision only when there
  is evidence to ask about. Off Record is enforced by the server.
- **Work Map** (`/work-map/[workflowId]`) — every captured step with the expert's own words as its
  justification, the rules derived from those words, and the evidence each one came from. Steps are
  never confirmed automatically.
- **Apprentice** (`/apprentice`) — run an unseen case against a confirmed map. Each action is checked
  against the captured rules, and a miss comes back with the reasoning that defined the rule.

`/work-map/latest` resolves to the most recent map **you** captured. Nothing is seeded: with no
captures it shows an empty state and points back at `/expert`.

## Architecture

```
src/app/                 routes (thin: metadata, layout, data resolution)
  page.tsx               landing
  expert/                capture + interviewer
  work-map/[workflowId]/ review a map; "latest" resolves server-side then redirects
  apprentice/            training cases
src/components/
  ui/                    Card, Button, Badge (+StatusDot), Field, Icon, PageShell, SiteNav, Backdrop
  capture/               CaptureControls, ScreenSharePreview, DebriefPanel, InstrumentationCard
  voice-agent/AgentPanel ElevenLabs conversation + manual transcript fallback
  work-map/WorkMapView   step timeline, guardrails, evidence, review actions
src/services/
  api.ts                 the only place that talks to the backend
  captureStore.ts        capture status, off-record, and transcript persistence
src/lib/ui.ts            shared tone/label maps
src/types/               API response types
```

Conventions worth knowing:

- **`src/services/api.ts` is the only module that calls the API.** Components use it, so the base
  URL and error handling live in one place.
- **Server components resolve, client components interact.** `work-map/[workflowId]/page.tsx`
  resolves `latest` and redirects before any client code runs; `WorkMapView` then fetches and edits.
- **The browser never sees a provider key.** It asks the backend for a short-lived ElevenLabs signed
  URL and connects with the official `@elevenlabs/client` SDK.
- **No domain is assumed.** The UI has no built-in business app and no seeded workflow; content is
  whatever your instrumented system emits plus what you say.

## Stack

- **Framework**: Next.js 16.3.8 (App Router, Turbopack), React 19.2
- **Language**: TypeScript 5 (strict)
- **Styling**: Tailwind CSS 4 with design tokens declared via `@theme` in `src/app/globals.css`
- **Voice**: `@elevenlabs/client` — browser-side Conversational AI over a backend-minted signed URL
- **Lint**: ESLint 9 with `eslint-config-next`

## Setup

Requires Node 20+ and a running backend (default `http://localhost:8000`).

```bash
npm install
cp .env.local.example .env.local     # then edit if your API is elsewhere
npm run dev                          # http://localhost:3000
```

Verify the two halves are talking:

```bash
curl $NEXT_PUBLIC_API_URL/api/health
```

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | no | `http://localhost:8000` | Backend base URL. Baked into the client bundle at build time, so it must be set before `npm run build`, not just `npm run dev`. |

That is the only variable this app reads. There is no provider key here by design — voice is enabled
by configuring `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` on the **backend**.

## Demo instructions

Run the backend first (`make run` in the API repo), then:

```bash
npm run dev
```

1. **Capture** — open `http://localhost:3000/expert`, click **Create session**, then **Start screen
   share** and **Start capture**. Click **Start voice interview** and allow the microphone; the badge
   turns to *Voice live*. Work for real and say *why* you chose what you chose. If voice is
   unavailable the panel says so and the text box below it accepts typed rationale instead.
2. **Map** — finish the task. Open **Work Map**, review each step, read the rule and the quoted
   evidence, then **Confirm** the steps you agree with.
3. **Teach** — open **Apprentice**, paste the work map ID, give a case ID and a JSON body, then
   **Start training case**. Submit an action that breaks a confirmed rule and it is blocked with the
   expert's reasoning attached.

There is no demo mode and no seeded data, so the walkthrough is only as good as the capture you just
recorded. The quickest honest path is to instrument any page with the snippet shown on `/expert`, or
send events straight to `POST /api/sessions/{id}/events`.

### Troubleshooting

| Symptom | Cause |
| --- | --- |
| Voice panel says it cannot reach the API | Backend down or restarting. The panel retries and keeps the manual input available. |
| *Voice is not configured on the API* | `ELEVENLABS_API_KEY` / `ELEVENLABS_AGENT_ID` unset on the backend. |
| *No work map yet* | No captures on this database. Run `/expert` first. |
| *Workflow not found* | The map belongs to a different database or was generated on another machine. |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Backend

The FastAPI service is a separate repository and owns the database, the work-map generation, the
guardrail evaluation, and all provider credentials. See its `README.md` for the API contract,
configuration, and capture event schema.