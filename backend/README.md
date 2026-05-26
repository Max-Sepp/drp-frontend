# Backend

FastAPI backend for DRP-04.

## Requirements

- Python 3.10+ (uses PEP 604 `X | None` syntax)

## Setup

From the `backend/` directory:

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

The server starts on http://127.0.0.1:8000. Interactive docs at http://127.0.0.1:8000/docs.

## Tests

```bash
pytest
```

## Project layout

```
backend/
├── app/
│   ├── main.py          # FastAPI app + router registration
│   ├── database.py      # SQLAlchemy engine, session, Base, get_db dep
│   ├── routers/         # APIRouter modules (one per resource)
│   ├── models/          # SQLAlchemy ORM models
│   └── schemas/         # Pydantic request/response schemas
├── tests/               # pytest suite (conftest.py overrides DB)
├── requirements.txt
└── venv/
```

## Database

Development uses SQLite. The database file `dev.db` is created in the working
directory on first run and is gitignored. Tables are created from ORM
metadata at app startup (`Base.metadata.create_all`) — no migrations are
configured yet; if you need them, add Alembic.

## Adding a route

1. Create `app/routers/<name>.py` exposing a `router = APIRouter(...)`.
2. Register it in `app/main.py` with `app.include_router(<name>.router)`.

## Adding a model

1. Define the ORM model in `app/models/<name>.py` subclassing `Base`.
2. Import the module in `app/main.py` so the table is registered before
   `create_all` runs.
3. Define a matching Pydantic schema in `app/schemas/<name>.py` with
   `model_config = ConfigDict(from_attributes=True)` so it can be returned
   directly from ORM instances.
