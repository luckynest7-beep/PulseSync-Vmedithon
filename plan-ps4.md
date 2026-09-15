# plan.md — Vmedithon PS4: Unified Health Monitoring Platform

> **Audience:** coding agents (Claude Code / Antigravity) working on this repo.
> **Read this whole file before writing any code.** It is the single source of truth for scope, stack, phases, and conventions.
> **Last updated:** 2026-09-15

> **⚠️ Implementation note (added after initial build):** the shipped stack diverges from
> the pins below in a few places — **Vite + React** instead of Next.js (no route handlers,
> the Gemini key lives in a separate `server/` Express API instead), and **Firebase
> (Cloud Firestore)** instead of Supabase for persistence (see `server/src/lib/firebase.ts`
> and `server/.env.example`). Native iOS/Android apps (via Capacitor) and an installable
> PWA were also added, superseding the "mobile web only" scope in §10. Treat this note as
> the source of truth over the sections below wherever they conflict; the rest of the
> feature scope, thresholds, and conventions still apply as written.

---

## 0. TL;DR for agents

- We are building a **mobile-first web app** for a **24-hour hackathon** (Vmedithon, Problem Statement PS4).
- **Priority #1 is a clickable frontend prototype with mock data** — it must be ready for a **prototype review** before any backend/AI wiring happens. Do Phase 1 completely before touching Phase 2+.
- Core loop: **photo of a BP monitor / glucometer → AI reads the number → saved to one timeline → trend chart → AI insight → anomaly flag → share PDF with doctor.** Plus voice input and medication nudges.
- Stack: **Next.js (App Router, TypeScript) + Tailwind + shadcn/ui + Recharts + `@google/genai` (Gemini) + Supabase + jsPDF.**
- Every Gemini call goes through a **Next.js Route Handler** (`/app/api/...`). The API key is **never** shipped to the browser.
- Use **Gemini free tier** (`gemini-2.5-flash-lite` by default). No Google Cloud billing needed.
- Do not overscope. Section 10 lists things we are explicitly NOT building.

---

## 1. Project context

### 1.1 The hackathon
- **Event:** Vmedithon — a 24-hour health-tech hackathon.
- **Team lead:** Dheeraj (2nd-year B.Tech AI/ML, VIT).
- **Deliverable:** a live, working demo shown to judges + a short pitch. Judges score on (1) does the unified capture actually work live, (2) is there real AI value beyond storage, (3) is provider sharing addressed, (4) is the demo tight and reliable.
- **Milestone 1 (before anything else):** a frontend prototype for internal review. All screens navigable, realistic mock data, camera UI working, no backend required.

### 1.2 Problem Statement PS4 (verbatim summary)
Fragmented data and lack of interoperability in health-monitoring devices — especially for chronic conditions like hypertension and diabetes — impede effective management. Needed: a unified solution where users capture readings from different sources (blood-pressure or glucose monitors) **using their phone camera**, updating a **personal health dataset**. The platform should offer **AI-driven insights** into health trends and **easy sharing with healthcare providers**.

### 1.3 The problem in plain words
People with BP or diabetes take readings on separate devices. The numbers stay stuck on tiny device screens, paper, or memory. Nobody — not the patient, not the doctor — sees the trend. We fix that with software only: **point phone at the device → number is read → it joins one smart, shareable record.** No new hardware.

### 1.4 One-line pitch
**"One photo. One record. One shareable history — no new hardware required."**

---

## 2. Feature scope (complete list — nothing else gets built)

| # | Feature | Priority | Phase |
|---|---------|----------|-------|
| F1 | Camera-based reading capture (photo → AI extraction → confirm → save) | P0 | 1 (UI) → 2 (AI) |
| F2 | Unified personal timeline (all readings, all sources, one list) | P0 | 1 (UI) → 3 (DB) |
| F3 | Trend charts (BP systolic/diastolic, glucose) | P0 | 1 |
| F4 | AI-driven insights (plain-language trend summary) | P0 | 1 (UI) → 2 (AI) |
| F5 | Provider sharing (PDF export / read-only link) | P0 | 5 |
| F6 | Anomaly flagging (instant red/yellow badge on out-of-range readings) | P1 | 1 (rule-based, pure frontend) |
| F7 | Voice input fallback (speak the reading) | P1 | 4 |
| F8 | Medication nudge tied to readings (rule-based banner) | P1 | 1 (UI) → 4 (logic) |

### Feature details

**F1 — Camera capture.** "Add Reading" → opens camera (mobile web `<input type="file" accept="image/*" capture="environment">`) → image is sent to `/api/extract` → Gemini returns structured JSON (type, values, confidence) → UI shows a **confirm card** where the user can edit any value → on confirm, the reading is saved. Never auto-save without confirmation. Show a clear "Couldn't read this — try again or use voice/manual" state when confidence is low or parsing fails.

**F2 — Timeline.** Reverse-chronological list grouped by day. Each row: type icon (BP / glucose), value, time, source icon (camera / voice / manual), and anomaly badge if flagged. Tapping a row opens a detail sheet (values, source, timestamp, delete).

**F3 — Trend charts.** Two charts on the Dashboard: BP (two lines: systolic + diastolic, with dashed reference lines at 140 and 90) and Glucose (one line, reference lines at 70 and 180). Range toggle: last 7 / last 30 readings. Must update immediately when a reading is added.

**F4 — AI insights.** An "Insight" card on the Dashboard. Calls `/api/insight` with the last 10 readings; Gemini returns a 2–3 sentence, non-diagnostic observation + one gentle suggestion. Always render the disclaimer line "Not medical advice — discuss with your doctor." Also a "Refresh insight" button.

**F5 — Provider sharing.** "Share with Doctor" button → generates a PDF client-side (jsPDF + chart snapshot via html2canvas) containing: patient name, date range, both charts, a table of readings (with flags), and the latest insight. Stretch: `/share/[token]` read-only page rendering the same summary.

**F6 — Anomaly flagging.** Pure client-side rules, no AI call, runs at save time. Thresholds in `lib/thresholds.ts` (see §7). Flagged readings get a red ("High") or yellow ("Low") badge in the timeline, and a toast/banner appears at save time.

**F7 — Voice input.** Mic button on the Add Reading screen. Primary: browser Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) → transcript string → `/api/extract` in text mode → same confirm card. Fallback (if Web Speech unsupported): record with `MediaRecorder`, send audio blob to `/api/extract` and let Gemini transcribe + parse.

**F8 — Medication nudge.** Rule: if the last 2+ readings of the same type are flagged High, show a dismissible banner on the Dashboard: "Your recent [BP/glucose] readings are elevated. Have you taken your medication today?" Optional stretch: a simple daily reminder time stored in the user profile that triggers a browser notification.

---

## 3. Architecture

```
Browser (Next.js app, mobile-first)
  ├─ /            Dashboard: charts, insight card, med nudge banner, quick-add FAB
  ├─ /add         Add Reading: camera / voice / manual tabs → confirm card
  ├─ /timeline    Unified timeline (grouped by day) + detail sheet
  ├─ /share       Generate PDF (and stretch: /share/[token] read-only view)
  └─ /settings    Name, units, medication reminder time (stretch)
        │
        ▼
Next.js Route Handlers (server-side; Gemini key lives here)
  ├─ POST /api/extract   image | text | audio  → structured reading JSON
  └─ POST /api/insight   readings[]           → insight text
        │
        ▼
Gemini API (@google/genai, model gemini-2.5-flash-lite, free tier)

Supabase (Postgres + Auth) ← readings, profiles   [Phase 3; Phase 1 uses in-memory mock store]
```

### 3.1 Tech stack (pinned decisions — do not swap without asking)
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest stable, App Router, TypeScript) | Route handlers keep the Gemini key server-side |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, mobile-friendly components |
| Charts | Recharts | LineChart + ReferenceLine cover everything we need |
| AI SDK | `@google/genai` (the unified Google Gen AI SDK) | **Not** the legacy `@google/generative-ai` package |
| AI model | `gemini-2.5-flash-lite` (default) / `gemini-2.5-flash` (fallback if accuracy is poor) | Both free-tier; both accept image + audio input |
| DB/Auth | Supabase (`@supabase/supabase-js`) | Email magic-link or anonymous auth; keep it simple |
| PDF | jsPDF + html2canvas | Client-side, no server rendering |
| State | React state + a small Zustand store for readings | Keeps Phase 1 (mock) and Phase 3 (Supabase) swappable behind one interface |
| Validation | zod | Validate Gemini JSON before it touches UI |

### 3.2 Environment variables (`.env.local`, never committed)
```
GEMINI_API_KEY=            # from https://aistudio.google.com/apikey (free tier)
GEMINI_MODEL=gemini-2.5-flash-lite
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
`GEMINI_API_KEY` has **no** `NEXT_PUBLIC_` prefix on purpose. It must only be read inside `/app/api/**`.

---

## 4. Data model

```ts
// lib/types.ts
export type ReadingType = 'bp' | 'glucose';
export type ReadingSource = 'camera' | 'voice' | 'manual';
export type Flag = 'high' | 'low' | null;

export interface Reading {
  id: string;            // uuid
  userId: string;
  type: ReadingType;
  systolic?: number;     // bp only
  diastolic?: number;    // bp only
  pulse?: number;        // bp only, optional
  glucose?: number;      // glucose only, mg/dL
  source: ReadingSource;
  flag: Flag;            // computed at save time via lib/thresholds.ts
  takenAt: string;       // ISO timestamp
  createdAt: string;     // ISO timestamp
}

export interface Profile {
  userId: string;
  displayName: string;
  reminderTime?: string; // "20:00", stretch feature
}
```

**Supabase table `readings`** (Phase 3): same columns, snake_case, `user_id` FK to `auth.users`, RLS: users can only read/write their own rows.

**Reading store interface** (implemented twice — mock in Phase 1, Supabase in Phase 3):
```ts
// lib/store/readingStore.ts
export interface ReadingStore {
  list(): Promise<Reading[]>;
  add(r: Omit<Reading, 'id' | 'createdAt' | 'flag'>): Promise<Reading>;
  remove(id: string): Promise<void>;
}
```

---

## 5. Gemini integration spec (Phase 2)

### 5.1 Extraction endpoint — `POST /api/extract`
Request body (one of):
```ts
{ mode: 'image', imageBase64: string, mimeType: 'image/jpeg' | 'image/png' }
{ mode: 'text',  transcript: string }
{ mode: 'audio', audioBase64: string, mimeType: 'audio/webm' | 'audio/mp4' }
```
Response (validated with zod before returning):
```ts
{
  type: 'bp' | 'glucose' | 'unknown',
  systolic: number | null,
  diastolic: number | null,
  pulse: number | null,
  glucose: number | null,
  confidence: 'high' | 'medium' | 'low',
  rawText: string          // what the model saw/heard, for the confirm card
}
```

Server implementation sketch (verified against current `@google/genai` docs):
```ts
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const readingSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['bp', 'glucose', 'unknown'] },
    systolic: { type: Type.NUMBER, nullable: true },
    diastolic: { type: Type.NUMBER, nullable: true },
    pulse: { type: Type.NUMBER, nullable: true },
    glucose: { type: Type.NUMBER, nullable: true },
    confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    rawText: { type: Type.STRING },
  },
  required: ['type', 'confidence', 'rawText'],
};

const EXTRACT_PROMPT = `You read numbers off home medical monitors.
Identify whether the input shows a blood pressure monitor (systolic/diastolic mmHg, optional pulse) or a glucose meter (mg/dL).
Extract only the numbers actually shown. If unclear, set type to "unknown" and confidence to "low".
Never guess values that are not visible/spoken.`;

const imagePart = { inlineData: { data: imageBase64, mimeType } };

const response = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite',
  contents: [imagePart, EXTRACT_PROMPT],          // for text mode: [EXTRACT_PROMPT, transcript]
  config: { responseMimeType: 'application/json', responseSchema: readingSchema },
});
const parsed = ReadingZod.parse(JSON.parse(response.text));
```
Notes for agents:
- Downscale images client-side to max ~1024px on the long edge before base64-encoding (saves tokens, faster).
- Wrap in try/catch; on any failure return `{ type: 'unknown', confidence: 'low', ... }` so the UI can show the retry state — never throw a 500 to the client for a bad photo.
- Rate limit is per-minute on the free tier; add a simple in-memory debounce so a double-tap doesn't fire twice.

### 5.2 Insight endpoint — `POST /api/insight`
Request: `{ readings: Reading[] }` (last 10, oldest → newest). Response: `{ insight: string }`.
```ts
const INSIGHT_PROMPT = `You are a cautious health-trend summarizer, NOT a diagnostic tool.
Given these home readings (oldest to newest), write 2-3 plain-language sentences about the trend.
Mention direction (rising/falling/stable) and rough magnitude. Do not diagnose or name conditions.
End with one gentle, practical suggestion. Max 60 words.`;
```
Plain text response (no schema needed). UI appends the fixed disclaimer line.

---

## 6. Screen specifications (Phase 1 — build these first)

All screens: mobile viewport first (375–430px wide), then make sure they don't break at desktop widths. Bottom tab bar: **Home · Add · Timeline · Share**.

### 6.1 `/` Dashboard
- Header: greeting + today's date.
- **Med nudge banner** (conditional, dismissible) — F8.
- **Latest reading cards** (2 small cards: last BP, last glucose, each with flag badge if any).
- **BP chart** and **Glucose chart** with 7/30 toggle — F3.
- **Insight card** with "Refresh" button and disclaimer — F4 (mock text in Phase 1).
- Floating "+" button → `/add`.

### 6.2 `/add` Add Reading
- Three tabs: **Camera · Voice · Manual**.
- Camera tab: big "Take photo" button (opens device camera), preview thumbnail, "Analyze" button, loading state, then **Confirm card**.
- Voice tab: mic button with listening animation, live transcript, "Parse" button → Confirm card. (UI only in Phase 1; wire in Phase 4.)
- Manual tab: type selector + numeric inputs → Confirm card.
- **Confirm card** (shared component): editable fields, detected type, confidence pill, "Save" / "Retake". On save → run threshold check → toast (red if flagged) → navigate to `/timeline`.

### 6.3 `/timeline`
- Day-grouped list — F2. Row: icon, value(s), time, source icon, flag badge.
- Empty state with a CTA to add first reading.
- Tap row → bottom sheet with details + Delete.

### 6.4 `/share`
- Preview of what the doctor will get (name, range, charts, table, insight).
- "Download PDF" button (Phase 5). In Phase 1 the button can show a "Coming in next build" toast.

### 6.5 `/settings` (low priority)
- Display name, units (mg/dL only for now), reminder time (stretch).

### 6.6 Mock data (Phase 1)
`lib/mock/readings.ts` must export ~20 readings over the last 14 days, mixed BP and glucose, mixed sources, including: 2 consecutive high BP readings (to trigger F6 + F8), one low glucose reading, and realistic timestamps (morning/evening). The mock insight text should read like a real Gemini output.

---

## 7. Thresholds (`lib/thresholds.ts`) — F6

| Type | High (red) | Low (yellow) |
|---|---|---|
| BP | systolic ≥ 140 **or** diastolic ≥ 90 | systolic < 90 **or** diastolic < 60 |
| Glucose (mg/dL) | ≥ 180 | < 70 |

Return `'high' | 'low' | null`. Unit-tested. Used by the Add flow, the timeline badges, chart reference lines, and the F8 nudge rule.

---

## 8. Phased build plan

### Phase 0 — Scaffold (≈ 45 min)
- [ ] `npx create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint, `src/` dir).
- [ ] Install: `@google/genai zod zustand recharts jspdf html2canvas @supabase/supabase-js lucide-react`; init shadcn/ui (button, card, tabs, badge, sheet, toast, input, select).
- [ ] Create `lib/types.ts`, `lib/thresholds.ts` (+ tests), `lib/store/readingStore.ts` interface + `mockReadingStore.ts`.
- [ ] Bottom tab layout, empty page shells for all 5 routes.
- [ ] `.env.local.example` committed with placeholder keys.
- **Done when:** `npm run dev` shows the tab bar and all routes load.

### Phase 1 — FRONTEND PROTOTYPE (PRIORITY — ≈ 5–6 h) ← ship this for prototype review
- [ ] Dashboard fully built on mock data: latest-reading cards, both charts with reference lines + 7/30 toggle, insight card (mock text), med-nudge banner logic wired to mock data.
- [ ] Add Reading: all three tabs rendered; camera capture actually opens the phone camera and shows the preview; "Analyze" returns a **stubbed** extraction (`lib/mock/extractStub.ts` returns a plausible reading after 1.2 s) → Confirm card → save into the mock store → flag computed → toast → timeline updated.
- [ ] Timeline with day grouping, badges, empty state, detail sheet with delete.
- [ ] Share screen preview built from live store data (no PDF yet).
- [ ] Responsive check on a real phone via LAN (`npm run dev -- -H 0.0.0.0`) — camera capture requires HTTPS or localhost on some phones; if it fails on LAN, use `ngrok`/`cloudflared` tunnel for the review.
- **Done when:** a reviewer can walk the full demo script (§9) end-to-end on a phone with zero backend, and every feature is visible in the UI.

### Phase 2 — Gemini wiring (≈ 2–3 h)
- [ ] `POST /api/extract` (image + text modes) per §5.1, with zod validation and safe failure response.
- [ ] `POST /api/insight` per §5.2.
- [ ] Replace `extractStub` with the real call behind the same function signature; replace mock insight with real call.
- [ ] Client-side image downscale before upload.
- [ ] Test against **real photos** of the 1–2 devices we will demo with (bring the actual devices). Tune the prompt until confidence is reliably "high" on those.
- **Done when:** a real photo of our demo BP cuff and glucometer round-trips correctly ≥ 9 times out of 10.

### Phase 3 — Supabase persistence (≈ 1.5–2 h)
- [ ] Project + `readings` and `profiles` tables + RLS.
- [ ] Auth: magic link (or anonymous sign-in if faster) — one screen, no fancy flows.
- [ ] `supabaseReadingStore.ts` implementing `ReadingStore`; swap via a single env flag (`NEXT_PUBLIC_STORE=mock|supabase`).
- **Done when:** readings survive a page refresh and are scoped to the logged-in user.

### Phase 4 — Add-ons (≈ 2–3 h)
- [ ] F7 Voice: Web Speech API → transcript → `/api/extract` text mode. MediaRecorder + audio mode as fallback.
- [ ] F8 Med nudge rule against live store (already UI-complete from Phase 1).
- [ ] Stretch: reminder time in profile + browser notification.
- **Done when:** speaking "BP 150 over 95" produces a confirm card with those values; two high readings in a row show the banner.

### Phase 5 — Provider sharing (≈ 1.5 h)
- [ ] jsPDF + html2canvas export from `/share`: header, charts, readings table with flags, latest insight, disclaimer.
- [ ] Stretch: `/share/[token]` read-only page.
- **Done when:** the downloaded PDF opens on a phone and is legible.

### Phase 6 — Polish, test, demo prep (remaining time)
- [ ] Loading/error/empty states on every screen; no unhandled promise rejections in console.
- [ ] Run the full demo script (§9) three times on the actual demo phone.
- [ ] Record a 60-second backup screen recording of the working flow in case live demo fails.
- [ ] Pre-seed the demo account with ~15 readings so charts look meaningful from second one.

**If behind schedule, cut in this order:** share-link page → reminder notification → MediaRecorder audio fallback → Web Speech voice → PDF polish. **Never cut:** camera capture, timeline, charts, anomaly flags, insights.

---

## 9. Demo script (what the app must support end-to-end)

1. Open Dashboard on a fresh/pre-seeded account.
2. Tap **+** → Camera → photograph the real BP monitor → extraction → confirm → save.
3. Photograph a second, deliberately high reading → red anomaly toast + red badge in timeline.
4. Back on Dashboard: med-nudge banner appears (two highs in a row); charts show the new points.
5. Tap **Refresh insight** → AI sentence about the rising trend.
6. Tap **+** → Voice → say "glucose 95" → confirm → save.
7. Tap **Share** → Download PDF → open it.
8. Close with the one-liner from §1.4.

---

## 10. Explicitly OUT of scope (do not build, do not suggest)

- Bluetooth / vendor-API integration with real devices.
- HL7 / FHIR compliance (mention as future work only).
- Doctor-side login portal or messaging.
- Custom-trained OCR/ML models.
- Support for arbitrary monitor brands — we demo with 1–2 devices we own.
- Full medication scheduling / pill inventory.
- Native iOS/Android apps — mobile web only.
- Any diagnostic language in AI output.

---

## 11. Conventions for coding agents

- **Language/style:** TypeScript strict. Clean, production-style code with **no explanatory comments** unless a line is genuinely non-obvious. Small components, one responsibility each.
- **Folder layout:** `src/app/**` routes and API; `src/components/**` UI; `src/lib/**` types, thresholds, stores, mock, gemini client; `src/lib/store` has the swappable store interface.
- **Secrets:** `GEMINI_API_KEY` only in route handlers. If you find it referenced in a client component, that is a bug — fix it.
- **Mock-first:** every external dependency (Gemini, Supabase) sits behind a function/interface with a mock implementation so the frontend can always run offline.
- **Fail soft:** extraction/insight failures must render a friendly retry state, never a crash.
- **Verify, don't assume:** after each phase, actually run the app on a phone and walk the demo script. Report what you ran and what you saw, not what should work.
- **Commits:** one commit per checklist item, message prefixed with the phase (`p1: dashboard charts with reference lines`).
- **Before starting a task:** state which Phase/checkbox you're doing and what "done" means for it. **After:** report result, files touched, and anything blocked.
- **Do not add features not in §2.** If something seems missing, ask Dheeraj first.

---

## 12. Reference links (verified 2026-09-15)

- Gemini API pricing & free tier: https://ai.google.dev/gemini-api/docs/pricing
- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini generateContent (image input via `inlineData`): https://ai.google.dev/api/generate-content
- `@google/genai` SDK repo & coding guidelines: https://github.com/googleapis/js-genai
- Get a free API key: https://aistudio.google.com/apikey
