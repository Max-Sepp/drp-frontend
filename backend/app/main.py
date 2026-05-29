from fastapi import FastAPI

from app.database import Base, SessionLocal, engine
from app.models import equipment as _equipment  # noqa: F401
from app.models import equipment_type as _equipment_type  # noqa: F401
from app.models import failure as _failure  # noqa: F401
from app.models import outage_report as _outage_report  # noqa: F401
from app.models import outage_report_deletion as _outage_report_deletion  # noqa: F401
from app.models import station as _station  # noqa: F401
from app.routers import equipment, equipment_types, failures, outage_reports, stations
from app.seed import seed_defaults

Base.metadata.create_all(bind=engine)
with SessionLocal() as session:
    seed_defaults(session)

app = FastAPI()

app.include_router(outage_reports.router)
app.include_router(failures.router)
app.include_router(stations.router)
app.include_router(equipment_types.router)
app.include_router(equipment.router)
