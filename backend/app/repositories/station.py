from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.station import Station
from app.schemas.station import StationSchema

_cache: list[StationSchema] | None = None


class StationRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self) -> list[StationSchema]:
        global _cache
        if _cache is None:
            rows = self._db.query(Station).order_by(Station.name).all()
            _cache = [StationSchema.model_validate(s) for s in rows]
        return _cache


def get_station_repo(db: Session = Depends(get_db)) -> StationRepository:
    return StationRepository(db)
