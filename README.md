# PulseSync — Unified Health Monitoring Platform (Problem Statement PS4)

A mobile-first, software-only health vitals monitoring platform that enables patients to capture blood pressure and blood glucose readings from home monitors using their smartphone camera or voice, automatically tracks trends, flags clinical anomalies, and generates doctor-ready summary reports.

---

## 📁 Clean Folder Structure

```text
project/frontend/
├── index.html                   # Mobile-responsive shell with Google Fonts
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler & dev proxy config
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
        ├── mockData.ts          # 14-day pre-seeded clinical dataset
        ├── pdfExport.ts         # High-resolution clinical Doctor Report PDF generator
        ├── speechParser.ts      # Natural language spoken vitals parser
        ├── store.ts             # Reactive state management + LocalStorage sync
        ├── thresholds.ts        # Clinical thresholds (BP 140/90, Glucose 70/180)
        └── types.ts             # Strict TypeScript data models
```

---

## ⚡ Quick Start

```bash
# Navigate to frontend folder
cd project/frontend

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
