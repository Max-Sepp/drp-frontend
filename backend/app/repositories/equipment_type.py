from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment_type import EquipmentType
from app.schemas.equipment_type import EquipmentTypeSchema

_cache: list[EquipmentTypeSchema] | None = None


class EquipmentTypeRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self) -> list[EquipmentTypeSchema]:
        global _cache
        if _cache is None:
            rows = self._db.query(EquipmentType).order_by(EquipmentType.name).all()
            _cache = [EquipmentTypeSchema.model_validate(s) for s in rows]
        return _cache


def get_equipment_type_repo(db: Session = Depends(get_db)) -> EquipmentTypeRepository:
    return EquipmentTypeRepository(db)
