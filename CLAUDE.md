# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Monorepo with two self-contained subprojects:

- `backend/` — FastAPI service (Python 3.10+, SQLAlchemy 2.x, Pydantic v2).
- `frontend/` — React Native app on Expo SDK 54 + TypeScript, distributed via EAS.

There is no top-level package manager or build script; commands are run from inside each subproject.

## Backend (`backend/`)

### Commands

```bash
# from backend/, with venv activated and requirements installed
uvicorn app.main:app --reload      # dev server on :8000, docs at /docs
pytest                              # full test suite
pytest tests/test_outage_reports.py::test_name   # single test
```

### Architecture

- `app/main.py` is the composition root: it imports each model module (so its table is registered on `Base.metadata`), runs `Base.metadata.create_all(bind=engine)` at import time, then mounts routers. **There is no Alembic / migration story** — schema changes happen via `create_all` against a fresh SQLite file. If you add a new model, you must also import the module in `main.py` or its table will not be created.
- `app/database.py` picks the engine from `DATABASE_URL` (normalizing the legacy `postgres://` scheme to `postgresql://`) and falls back to `sqlite:///./dev.db`. `get_db` is the FastAPI dependency that yields a `Session`.
- Per-resource layering: `routers/<x>.py` (HTTP) → `repositories/<x>.py` (data access, exposed via a `get_repo` dependency) → `models/<x>.py` (ORM) with `schemas/<x>.py` for request/response Pydantic models. Routers should stay thin and delegate persistence to the repository.
- Pydantic response schemas use `model_config = ConfigDict(from_attributes=True)` so ORM instances can be returned directly.
- Image uploads on outage reports are stored as bytes on the row itself (`image`, `image_content_type`) and served back via a separate `GET /{id}/image` endpoint — they are not on the JSON summary.
- Tests (`tests/conftest.py`) override `get_db` with an in-memory SQLite engine using `StaticPool` so each test gets an isolated schema; use the `client` fixture for HTTP tests.

## Frontend (`frontend/`)

### Commands

```bash
npm install
npm run start            # Expo dev server + QR for Expo Go
npm run android          # open on Android emulator/device
npm run ios              # open on iOS simulator (macOS only)
npm run generate:api     # regenerate src/api/schema.d.ts from a backend running on :8000
```

### Architecture

- Entry is `App.tsx` → `src/navigation/RootNavigator.tsx`, a `@react-navigation/native-stack` with screens in `src/screens/`. Route params are typed in `src/navigation/types.ts` (`RootStackParamList`) — keep this in sync when adding screens.
- UI is built with **Tamagui** (`tamagui.config.ts`, `@tamagui/babel-plugin` in `babel.config.js`, `@tamagui/metro-plugin` in `metro.config.js`). New components should use Tamagui primitives rather than raw RN `View`/`Text` where possible.
- API access goes through `src/api/client.ts`, which wraps `openapi-fetch` with the types from `src/api/schema.d.ts`. **`schema.d.ts` is generated** — don't hand-edit it; rerun `npm run generate:api` against a local backend after changing FastAPI routes/schemas. Base URL comes from `EXPO_PUBLIC_API_URL` and defaults to `http://localhost:8000`.
- Distribution is EAS-only (slug `drp-mobility`, project `fa941353-94dc-490c-a5b0-209e52e4ee56`); there is no web deploy.
  - Pushing a `v*` tag triggers a production build (`.github/workflows/eas-build.yml`); a GitHub Release with the Android `.apk` is created automatically.
  - Pushes to `main` touching `frontend/**` publish an OTA update to the `production` channel (`.github/workflows/eas-update.yml`). JS-only changes ship via OTA; native changes require a fresh build.
