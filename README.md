<div align="center">

<img src="public/icons/icon-512.png" width="88" alt="PulseSync logo" />

# PulseSync

### One photo. One record. One shareable history — no new hardware required.

A software-only vitals platform that turns a phone camera or voice into a unified,
AI-analyzed, doctor-shareable health record — built for **Vmedithon, Problem Statement PS4**.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat&logo=pwa&logoColor=white)](#-mobile-apps--installable-pwa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[🌐 Live Web Demo](https://pulsesync1vmedithon.vercel.app/)** · **[📱 Download Android APK](https://github.com/luckynest7-beep/PulseSync-Vmedithon/releases/download/android-v1.0.0/app-release.apk)**

</div>

> **Demo status:** the live web demo above is a frontend-only deployment (no backend configured yet), so it
> runs fully offline-first — mock trend data, and AI insights use the local fallback text instead of live
> Gemini. See [Deployment](#deployment) for what's needed to light up the real backend + accounts there.
> The Android APK has real Firebase sign-up/login working out of the box (independent of any backend);
> Gemini extraction and cross-device Firestore sync need a deployed backend the same way.

---

## Table of Contents

- [The problem](#the-problem)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Mobile apps & installable PWA](#-mobile-apps--installable-pwa)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## The problem

Fragmented data and lack of interoperability in health-monitoring devices — especially
for chronic conditions like hypertension and diabetes — impede effective management.
People take blood pressure and glucose readings on separate home devices, and the
numbers stay stuck on tiny screens, paper, or memory. Nobody, not the patient and not
the doctor, ever sees the trend.

**PulseSync fixes this with software only.** Point a phone camera at the monitor, the
reading is extracted automatically, and it joins one smart, trend-tracked, shareable
record — no new hardware, no manual logging.

## Screenshots

<table>
<tr>
<td align="center" width="20%"><img src="docs/screenshots/dashboard.jpg" alt="Dashboard" /><br /><sub><b>Dashboard</b></sub></td>
<td align="center" width="20%"><img src="docs/screenshots/camera-capture.jpg" alt="Camera capture" /><br /><sub><b>Camera Capture</b></sub></td>
<td align="center" width="20%"><img src="docs/screenshots/manual-entry.jpg" alt="Manual entry" /><br /><sub><b>Manual Entry</b></sub></td>
<td align="center" width="20%"><img src="docs/screenshots/timeline.jpg" alt="Timeline" /><br /><sub><b>Timeline</b></sub></td>
<td align="center" width="20%"><img src="docs/screenshots/share-pdf.jpg" alt="Provider sharing" /><br /><sub><b>Provider Sharing</b></sub></td>
</tr>
</table>

## Features

| | Feature | Description |
|---|---|---|
| 📸 | **Camera capture** | Point the camera at a BP monitor or glucometer → AI extracts the numbers → you confirm before anything saves. |
| 🎙️ | **Voice input** | Speak a reading ("blood pressure 148 over 94") and it's parsed the same way as a photo. |
| 📈 | **Trend charts** | BP (systolic/diastolic) and glucose trends with clinical reference lines, 7/30-day toggle. |
| 🧠 | **AI-driven insights** | Plain-language trend summaries generated from your recent readings — never diagnostic, always with a disclaimer. |
| 🚩 | **Anomaly flagging** | Instant, rule-based high/low badges the moment a reading is saved. |
| 💊 | **Medication nudges** | A dismissible banner appears after two consecutive elevated readings. |
| 🚨 | **Emergency contact alert** | A reading at an emergency-level extreme (hypertensive crisis, severe hypo/hyperglycemia) prompts a one-tap call to the contact saved in Settings. |
| 🔐 | **Real accounts** | Sign up / log in with email + password (Firebase Auth); your mobile number is collected as a profile field. Once signed in, readings are your own real, per-account data in Firestore — not the shared demo dataset. Optional: skip entirely and the app runs exactly as before, local/mock, no login. |
| 🗂️ | **Unified timeline** | Every reading, every source (camera/voice/manual), one day-grouped history. |
| 🩺 | **Provider sharing** | One-tap, doctor-ready PDF export with charts, a readings table, and the latest AI insight. |

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | React 18, TypeScript (strict), Vite, Recharts, jsPDF + html2canvas, Web Speech API |
| **Backend** | Express, TypeScript, Zod validation, `@google/genai` (Gemini) |
| **Persistence** | Firebase (Cloud Firestore) via `firebase-admin`, with an automatic in-memory fallback |
| **Mobile** | Capacitor (native iOS & Android shells) + a fully installable PWA — one codebase, three targets |
| **Deployment** | Render (backend, free tier) via [`render.yaml`](render.yaml) Blueprint |

## Architecture

```mermaid
flowchart LR
    subgraph Client["Client — one React codebase"]
        Web["Desktop / Mobile Web"]
        PWA["Installed PWA"]
        Native["Native iOS / Android app<br/>(Capacitor)"]
    end

    Client -->|"fetch /api/*"| API["Express API<br/>(server/)"]
    API -->|"image / text / audio"| Gemini["Google Gemini<br/>structured extraction & insights"]
    API -->|"readings, per-user scoped"| DB[("Firebase<br/>Cloud Firestore")]
    API -.fallback when unset.-> Mem[("In-memory store")]
```

Every Gemini call is routed through the backend — the API key never reaches the
browser or the app bundle. If no key is configured, extraction/insight endpoints
fail soft to clear placeholder responses instead of crashing, so the whole app
still runs end-to-end with zero setup.

## Getting started

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/luckynest7-beep/PulseSync-Vmedithon.git
cd PulseSync-Vmedithon
npm install

# Run the frontend + backend together
npm run dev:all
```

Open **http://localhost:5173** — the app works immediately with mock data and safe
AI fallbacks, no keys required. To enable real Gemini extraction/insights and
persistent storage, see [Environment variables](#environment-variables) below.

Other useful scripts:

```bash
npm run dev          # frontend only (offline-first)
npm run build         # production build
npm run cap:android   # build, sync, and open the native Android project
npm run cap:ios       # build, sync, and open the native iOS project (macOS only)
```

## Environment variables

**`server/.env`** (copy from `server/.env.example`):

| Variable | Required? | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Enables real AI extraction/insights. Get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — no billing needed. Leave blank to run on safe stub responses. |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-2.5-flash-lite`. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Optional | Local dev: path to the service-account JSON downloaded from Firebase Console → Project Settings → Service Accounts → Generate new private key. No editing needed — save it as `server/firebase-service-account.json` (git-ignored) and point at it. **Once set, `/api/readings` requires a valid Firebase ID token on every request** — see below. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Optional | Same credential, as a one-line JSON string — for hosts like Render that only support env vars. Leave both Firebase vars blank for an in-memory store (resets on restart) with no auth requirement (original hackathon-demo behavior). |
| `PORT` | Optional | Defaults to `8000`. |

**Frontend `.env.local`** (copy from `.env.example`):

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_API_URL` | Optional | Base URL of a deployed backend. Leave blank in local dev — Vite already proxies `/api` to `localhost:8000`. |
| `VITE_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` | Optional | Firebase Web app config from Firebase Console → Project Settings → General → "Your apps". Also enable the **Email/Password** sign-in provider under Authentication → Sign-in method. Leave all blank to skip login entirely — the app runs exactly as before (local/mock data, no auth gate). |

Secrets are never committed — both `.env` files, and the mobile release keystore, are
git-ignored.

## Project structure

<details>
<summary>Expand full tree</summary>

```text
PulseSync-Vmedithon/
├── src/                        # React frontend
│   ├── components/
│   │   ├── AddReading/         # Camera / Voice / Manual capture + confirm card
│   │   ├── Dashboard/          # Charts, insight card, medication nudge banner
│   │   ├── Timeline/           # Day-grouped history + detail sheet
│   │   ├── Share/              # Doctor-facing PDF report preview
│   │   ├── Settings/, Navigation/, Common/
│   └── lib/
│       ├── api.ts              # Backend client — falls back to offline mocks on any failure
│       ├── store.ts            # Reactive state + LocalStorage persistence
│       ├── thresholds.ts       # Clinical BP/glucose flag rules
│       └── types.ts, mockData.ts, pdfExport.ts, speechParser.ts
│
├── server/                     # Express + TypeScript API
│   ├── src/routes/             # extract.ts · insight.ts · readings.ts
│   ├── src/lib/                # gemini.ts · firebase.ts · thresholds.ts
│   └── firestore.rules         # Per-user access rules (defense-in-depth)
│
├── android/, ios/               # Capacitor native projects
├── public/icons/                 # App & PWA icons
├── capacitor.config.ts, vite.config.ts (PWA plugin)
├── render.yaml                  # One-click Render Blueprint for the backend
└── MOBILE.md                    # Full native build & device-install workflow
```

</details>

## 📱 Mobile apps & installable PWA

The same React codebase ships three ways, with zero UI duplication:

- **Desktop / mobile web** — the standard Vite build, deployable anywhere static.
- **Installable PWA** — works today, no build step. "Add to Home Screen" on iOS
  Safari, or the "Install app" prompt on Android Chrome.
- **Native iOS & Android app** — wrapped with [Capacitor](https://capacitorjs.com),
  giving native camera/microphone permission dialogs and a real installable app.

A pre-built, signed **[Android APK](https://github.com/luckynest7-beep/PulseSync-Vmedithon/releases/download/android-v1.0.0/app-release.apk)**
is available under [Releases](https://github.com/luckynest7-beep/PulseSync-Vmedithon/releases) —
sideload it directly, no build step needed. Full native build, signing, and
on-device install instructions live in **[MOBILE.md](./MOBILE.md)**.

## Deployment

**Live demo:** [pulsesync1vmedithon.vercel.app](https://pulsesync1vmedithon.vercel.app/) — frontend
only right now, running fully offline-first (no backend, no login). To light up the real
backend + accounts there:

1. Deploy `server/` — either to [Render](https://render.com)'s free tier via the committed
   [`render.yaml`](render.yaml) Blueprint (supply `GEMINI_API_KEY` and the `FIREBASE_SERVICE_ACCOUNT_*`
   vars when prompted), or as a Vercel serverless function using the same repo
   (`server/api/index.ts` + `server/vercel.json` are already set up for this — set the
   project's Root Directory to `server`).
2. On the Vercel project serving the frontend, add `VITE_API_URL` (pointing at the deployed
   backend) plus the six `VITE_FIREBASE_*` values from [Environment variables](#environment-variables),
   then redeploy.

See [MOBILE.md](./MOBILE.md) for building your own signed release APK.

## Roadmap

Deliberately out of scope for now (see `plan-ps4.md` for the full hackathon spec):

- Bluetooth / vendor-API integration with real monitors
- HL7 / FHIR interoperability
- Doctor-side login portal or in-app messaging
- Custom-trained OCR/ML models (extraction is Gemini-based by design)

## License

Released under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built for Vmedithon — Problem Statement PS4 · Unified Health Monitoring Platform</sub>
</div>
