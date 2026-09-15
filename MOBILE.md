# PulseSync — Mobile (iOS & Android)

PulseSync ships as one web codebase (`src/`) reused three ways:

1. **Desktop / mobile web** — the Vite build in `dist/`, deployable anywhere static (Vercel, Netlify, GitHub Pages).
2. **Installable PWA** — same build, installable to a phone home screen with no app store, no native build step. Works today on Android (Chrome "Install app") and iOS (Safari → Share → "Add to Home Screen").
3. **Native iOS / Android app** — the same build wrapped by [Capacitor](https://capacitorjs.com) into a real Xcode/Android Studio project (`ios/`, `android/`), for camera/mic access via native permission dialogs and an app-store-ready shell.

No UI code is duplicated between web and native — Capacitor loads the same React app inside a native WebView.

## Prerequisites

- Node 18+ (already required for the web app)
- **Android:** Android Studio + JDK 17 (Windows, macOS, or Linux)
- **iOS:** a Mac with Xcode 15+ and CocoaPods (`sudo gem install cocoapods`) — Apple requires building/signing on macOS

## One-time setup

Already done in this repo (`capacitor.config.ts`, `android/`, `ios/` are committed):

```bash
npm install
npx cap add android   # already run — creates android/
npx cap add ios       # already run — creates ios/
```

You only need to re-run `cap add` if you delete those folders.

## Day-to-day workflow

Every time you change `src/` and want to see it on a device/emulator:

```bash
npm run cap:android   # builds the web app, syncs it into android/, opens Android Studio
npm run cap:ios       # builds the web app, syncs it into ios/, opens Xcode (macOS only)
```

Then hit Run in Android Studio / Xcode, or:

```bash
npx cap run android
npx cap run ios
```

## Backend URL on a real device

The web app calls the backend via `VITE_API_URL` (see `.env.example`). On a real phone, `localhost` refers to the phone itself, not your dev machine — so before building for a device demo, either:

- point `VITE_API_URL` at your machine's LAN IP (e.g. `http://192.168.1.20:8000`) or a tunnel (ngrok/cloudflared), then `npm run cap:sync`, or
- deploy `server/` somewhere reachable (Railway, Render, Fly.io) and point `VITE_API_URL` at it.

## Permissions

Already configured:

- **Android** (`android/app/src/main/AndroidManifest.xml`): `CAMERA`, `RECORD_AUDIO`, `INTERNET`.
- **iOS** (`ios/App/App/Info.plist`): `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`.

If Xcode/Android Studio complains about a missing signing team or package name, that's expected on a fresh checkout — set your own team/signing identity locally; it isn't something the web codebase controls.
