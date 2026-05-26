# DRP

Monorepo containing the DRP application.

## Layout

```
.
├── backend/    FastAPI service (Python)
└── frontend/   React + Vite + Tailwind + shadcn/ui (TypeScript)
```

## Getting started

Each subproject is self-contained. See its README for full instructions.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Serves on http://127.0.0.1:8000 (docs at `/docs`). See [`backend/README.md`](backend/README.md).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Serves on http://localhost:5173. See [`frontend/README.md`](frontend/README.md).
