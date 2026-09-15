# PulseSync — Unified Health Monitoring Platform (Problem Statement PS4)

A mobile-first, software-only health vitals monitoring platform that enables patients to capture blood pressure and blood glucose readings from home monitors using their smartphone camera or voice, automatically tracks trends, flags clinical anomalies, and generates doctor-ready summary reports.

---

## 📁 Clean Folder Structure

```text
PulseSync-Frontend/
├── index.html                   # Mobile-responsive shell with Google Fonts + PWA meta
├── package.json                 # Frontend dependencies & scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler, dev proxy to the backend, PWA plugin
├── capacitor.config.ts          # Native app shell config (see MOBILE.md)
├── android/, ios/                # Capacitor-generated native projects (iOS/Android)
├── public/icons/                 # PWA / app icons
├── server/                       # Express + TypeScript backend (see below)
└── src/
    ├── App.css                  # Luxury glassmorphic design system tokens
    ├── App.tsx                  # Root shell connecting all views, state, and modals
    ├── main.tsx                 # React DOM root entrypoint
    ├── vite-env.d.ts            # Vite client types
    ├── components/
    │   ├── AddReading/          # Capture modals & verification
    │   │   ├── AddReadingModal.tsx   # Multi-tab modal (Camera, Voice, Manual)
    │   │   ├── CameraCapture.tsx     # Video feed / photo OCR scanner
    │   │   ├── ConfirmCard.tsx       # Human verification card before saving
    │   │   ├── ManualInput.tsx       # Fast numeric stepper entry
    │   │   └── VoiceInput.tsx        # Web Speech API voice capture
    │   ├── Common/
    │   │   └── Toast.tsx             # Clinical status & celebration toast alerts
    │   ├── Dashboard/           # Main landing & clinical overview
    │   │   ├── AiInsightCard.tsx     # Gemini trend summary & refresh action
    │   │   ├── DashboardView.tsx     # Main dashboard layout
    │   │   ├── LatestReadingsCard.tsx# Vitals glance cards
    │   │   ├── MedicationNudgeBanner.tsx # F8 consecutive high alert banner
    │   │   └── TrendCharts.tsx       # Dual BP (140/90) & Glucose (70/180) charts
    │   ├── Navigation/
    │   │   ├── BottomTabBar.tsx      # Fixed mobile bottom navigation
    │   │   └── Header.tsx            # Brand bar & profile link
    │   ├── Settings/
    │   │   └── SettingsView.tsx      # Patient demographic & demo dataset reset
    │   ├── Share/
    │   │   └── DoctorShareView.tsx   # Live report preview & 1-click PDF download
    │   └── Timeline/
    │       ├── ReadingDetailModal.tsx# Single reading detail sheet with delete
    │       └── TimelineView.tsx      # Day-grouped history with filter chips
    └── lib/
        ├── api.ts               # Backend client (extract/insight) — falls back to mocks if unreachable
        ├── mockData.ts          # 14-day pre-seeded clinical dataset
        ├── pdfExport.ts         # High-resolution clinical Doctor Report PDF generator
        ├── speechParser.ts      # Natural language spoken vitals parser
        ├── store.ts             # Reactive state management + LocalStorage sync
        ├── thresholds.ts        # Clinical thresholds (BP 140/90, Glucose 70/180)
        └── types.ts             # Strict TypeScript data models
```

---

## 🖥️ Backend (`server/`)

A small Express + TypeScript API implementing the Gemini extraction/insight contract from `plan-ps4.md` §5, backed by Supabase (or an in-memory store when Supabase isn't configured yet):

```text
server/
├── src/
│   ├── index.ts              # Express app (port 8000)
│   ├── routes/
│   │   ├── extract.ts        # POST /api/extract  (image | text | audio → structured reading)
│   │   ├── insight.ts        # POST /api/insight   (readings[] → plain-language trend summary)
│   │   └── readings.ts       # GET/POST/DELETE /api/readings (Supabase-backed CRUD)
│   └── lib/
│       ├── gemini.ts         # @google/genai wrapper — fails soft to a stub if no API key
│       ├── supabase.ts       # Supabase client — falls back to an in-memory store if unconfigured
│       └── thresholds.ts     # Same clinical thresholds as the frontend
└── supabase/migrations/0001_init.sql   # readings + profiles tables, RLS policies
```

The frontend already proxies `/api/*` to `http://localhost:8000` in dev (`vite.config.ts`), and every extraction/insight call in the UI tries the real backend first, then silently falls back to the existing offline stub/mock logic — so the app **still runs with zero setup**, and gets smarter the moment you add real keys.

**Run it:**

```bash
cd server
cp .env.example .env       # optionally fill in GEMINI_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                 # http://localhost:8000
```

To provision real persistence, create a Supabase project and run `server/supabase/migrations/0001_init.sql` in its SQL editor (or via `supabase db push`), then set `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`. To enable real AI extraction/insights, get a free key at https://aistudio.google.com/apikey and set `GEMINI_API_KEY`.

## ⚡ Quick Start

```bash
# Install frontend dependencies
npm install

# Run frontend + backend together
npm run dev:all

# ...or just the frontend (offline-first, works with zero backend)
npm run dev

# Build for production
npm run build
```

## 📱 Mobile apps (iOS & Android) + installable PWA

The same codebase ships to iOS, Android, and desktop web without any UI rewrite:

- **Installable PWA** (works immediately, no build step): `npm run build && npm run preview`, then on a phone browser use "Add to Home Screen" (iOS Safari) or the "Install app" prompt (Android Chrome).
- **Native iOS/Android app** via [Capacitor](https://capacitorjs.com) — see **[MOBILE.md](./MOBILE.md)** for the full workflow (`npm run cap:android`, `npm run cap:ios`, permissions, and pointing the app at a real backend URL on-device).
