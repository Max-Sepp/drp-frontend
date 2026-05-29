# Deployment Pipeline

This document describes how the DRP Mobility monorepo is built, tested, and shipped.
Everything is driven by GitHub Actions in [`.github/workflows/`](.github/workflows/); there is no
manual deploy step.

## Overview

| Workflow | File | Triggers on | What it does |
|---|---|---|---|
| Frontend CI | `frontend-ci.yml` | PRs touching `frontend/**` | TypeScript type-check (no build) |
| EAS Update (OTA) | `eas-update.yml` | Push to `main` touching `frontend/**` | Ships JS-only over-the-air update |
| EAS Build (Release) | `eas-build.yml` | Push of a `v*` tag, or manual dispatch | Native build + GitHub release with APK/IPA |
| Backend | `publish-images.yml` | Push to any branch / `v*` tag touching `backend/**` | Compile, test, build Docker image, deploy |

The frontend and backend ship independently, on different triggers.

---

## Frontend

The React Native app (Expo SDK 54, distributed via EAS) has three stages.

### 1. Pull request — `frontend-ci.yml`
On any PR that changes `frontend/**`, runs `tsc --noEmit` to type-check the code.
This is the only gate before merge; there are no unit tests in the frontend pipeline.

### 2. Merge to `main` — `eas-update.yml` (OTA)
Every push to `main` that touches `frontend/**` publishes an **over-the-air update** to the
`production` channel (`eas update`). This patches the JavaScript bundle inside apps that are
**already installed** — no new download, no app-store step, no GitHub release.

- ✅ Works for JS-only changes (UI, logic, screens).
- ❌ Does **not** apply native changes (new native modules, permissions, SDK bumps). Those need a
  fresh native build — see below.

### 3. Tagging a version — `eas-build.yml` (Release)
Pushing a `v*` tag (e.g. `git tag v1.2.0 && git push origin v1.2.0`) — or manually running the
workflow via `workflow_dispatch` — produces fresh **native builds** and a **GitHub release**.

1. **build** job: `eas build --profile production --platform all` builds both the Android `.apk`
   and the iOS `.ipa`. Both build IDs are captured as job outputs.
2. **release** job: looks up each build's artifact URL on EAS and creates a GitHub release titled
   `Release <tag>` whose notes link both downloads:

   ```
   ### Downloads
   **Android APK:** <url>
   **iOS IPA:** <url>
   ```

#### About the download links
- **Android APK** — directly downloadable and installable on any Android device. ✅
- **iOS IPA** — the link is present and downloadable, but a store-signed `.ipa` **cannot be
  sideloaded or loaded into TestFlight by downloading it**. Apple distributes iOS test builds only
  through TestFlight (the `.ipa` must be uploaded to App Store Connect, after which it appears
  automatically inside the TestFlight app for invited testers). The release link is provided for
  completeness/archival, not for installation. ⚠️

### When does a new release get created?
Only when you **push a `v*` tag**. Ordinary commits to `main` ship via OTA and do **not** create a
release or a new download.

| You do | Result |
|---|---|
| Open a PR (frontend) | Type-check runs |
| Merge to `main` (frontend) | OTA update; no new download |
| Push a `v*` tag | Native build + new GitHub release (APK + IPA links) |

---

## Backend — `publish-images.yml`

The FastAPI service deploys through a four-stage pipeline.

1. **compile** — `python -m compileall app/` to catch syntax errors.
2. **test-backend** — runs `pytest` (needs `compile`).
3. **build-and-push** — on `main` or any `v*` tag, builds the Docker image and pushes it to GitHub
   Container Registry (`ghcr.io`). Tags include the branch/tag name, the commit SHA, and `latest`
   (the latter only on `main`).
4. **deploy** — on `main` only, redeploys the `drp-mobility-backend` service on **Railway** via the
   Railway CLI, which pulls the freshly pushed image.

| You do | Result |
|---|---|
| Push to a branch (backend) | Compile + test + image build/push |
| Merge to `main` (backend) | Above + redeploy on Railway |
| Push a `v*` tag | Image built/pushed with the tag (no Railway deploy) |

---

## Required secrets

| Secret | Used by | Purpose |
|---|---|---|
| `EXPO_TOKEN` | `eas-update.yml`, `eas-build.yml` | Authenticate with EAS |
| `GITHUB_TOKEN` | `eas-build.yml`, `publish-images.yml` | Create releases / push to GHCR (auto-provided) |
| `RAILWAY_TOKEN` | `publish-images.yml` | Redeploy backend on Railway |

## EAS project reference

- Slug: `drp-mobility`
- EAS project ID: `fa941353-94dc-490c-a5b0-209e52e4ee56`
- iOS bundle ID / Android package: `com.drpmobility.app`
- Build profiles live in [`frontend/eas.json`](frontend/eas.json); the `production` profile builds
  an Android APK and a store-distribution iOS build on the `production` update channel.
