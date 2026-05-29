from fastapi import Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.equipment import Equipment
from app.models.equipment_type import EquipmentType
from app.models.station import Station
from app.schemas.equipment import EquipmentSummary

_cache: list[EquipmentSummary] | None = None


class EquipmentRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self, station_id: int | None = None) -> list[EquipmentSummary]:
        global _cache
        if _cache is None:
            rows = (
                self._db.query(Equipment)
                .options(
                    joinedload(Equipment.station),
                    joinedload(Equipment.equipment_type),
                )
                .join(Equipment.station)
                .join(Equipment.equipment_type)
                .order_by(Station.name, EquipmentType.name, Equipment.connection)
                .all()
            )
            _cache = [EquipmentSummary.model_validate(e) for e in rows]
        if station_id is not None:
            return [e for e in _cache if e.station.id == station_id]
        return _cache


def get_equipment_repo(db: Session = Depends(get_db)) -> EquipmentRepository:
    return EquipmentRepository(db)
