from fastapi import FastAPI

from app.database import Base, engine
from app.models import item as _item  # noqa: F401  (register ORM models)
from app.models import outage_report as _outage_report  # noqa: F401  (register ORM models)
from app.routers import items, root

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(root.router)
app.include_router(items.router)
