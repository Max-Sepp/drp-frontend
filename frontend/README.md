# Frontend

React Native mobile app built with [Expo](https://expo.dev) (SDK 54) and TypeScript. Distributed and updated via [EAS](https://expo.dev/eas).

- Expo slug: `drp-mobility`
- EAS project ID: `fa941353-94dc-490c-a5b0-209e52e4ee56`

## Prerequisites

- Node.js 22+
- npm 10+
- The [Expo Go](https://expo.dev/go) app on a physical device, or an Android/iOS simulator

## Install

```bash
npm install
```

## Run locally

```bash
npm run start       # Metro bundler + QR code for Expo Go
npm run android     # open on a connected Android device/emulator
npm run ios         # open on an iOS simulator (macOS only)
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to load the app on a physical device.

## Accessing the deployed app

The app is shipped through EAS — there is no public web URL. There are two ways to get it onto a device:

### 1. Install a build (production / preview)

Builds are produced by the [`EAS Build`](../.github/workflows/eas-build.yml) GitHub Actions workflow:

- **Production**: push a `v*` git tag (e.g. `v1.0.0`) — builds Android + iOS with the `production` profile.
- **Preview**: trigger the workflow manually from the Actions tab and pick the `preview` profile.

Once the build finishes:

- **Android (production)** — a GitHub Release is created automatically under the tag (e.g. `v1.0.0`) with a direct `.apk` download link. Download and install it (enable "Install unknown apps" for your browser/file manager).
- **Android (preview)** — browse the EAS project dashboard: <https://expo.dev/accounts/_/projects/drp-mobility/builds> and download the `.apk` from the latest build.
- **iOS** — production builds require a TestFlight invite; preview builds run on the iOS simulator only.

### 2. Run the latest `main` via OTA update

Any push to `main` that touches `frontend/**` triggers the [`EAS Update`](../.github/workflows/eas-update.yml) workflow, which publishes a JS bundle to the `production` update channel.

If you already have a production build installed, reopening the app pulls the newest update from
`https://u.expo.dev/fa941353-94dc-490c-a5b0-209e52e4ee56` automatically — no reinstall needed (native changes still require a fresh build).

## Triggering builds and updates manually

You need the `EXPO_TOKEN` secret configured in the repo (already set for CI). Locally:

```bash
npx eas-cli login
npx eas-cli build   --profile preview --platform all       # ad-hoc build (all, android, or ios)
npx eas-cli update  --channel production --non-interactive # publish an OTA update
```

Build profiles live in [`eas.json`](./eas.json).
