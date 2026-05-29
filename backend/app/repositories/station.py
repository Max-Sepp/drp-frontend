from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.station import Station
from app.schemas.station import StationSchema

# Process-wide cache: stations are treated as effectively static reference data.
# Restart the server if the stations table changes.
_cache: list[StationSchema] | None = None


class StationRepository:
    """Read-only access to the Station reference table, cached in-process."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self) -> list[StationSchema]:
        """Return all stations ordered by name (cached after the first call)."""
        global _cache
        if _cache is None:
            rows = self._db.query(Station).order_by(Station.name).all()
            _cache = [StationSchema.model_validate(s) for s in rows]
        return _cache


def get_station_repo(db: Session = Depends(get_db)) -> StationRepository:
    """FastAPI dependency that yields a session-scoped StationRepository."""
    return StationRepository(db)
