from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment_type import EquipmentType
from app.schemas.equipment_type import EquipmentTypeSchema

# Process-wide cache: equipment types are effectively static reference data.
_cache: list[EquipmentTypeSchema] | None = None


class EquipmentTypeRepository:
    """Read-only access to the EquipmentType reference table, cached in-process."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def list_all(self) -> list[EquipmentTypeSchema]:
        """Return all equipment types ordered by name (cached after the first call)."""
        global _cache
        if _cache is None:
            rows = self._db.query(EquipmentType).order_by(EquipmentType.name).all()
            _cache = [EquipmentTypeSchema.model_validate(s) for s in rows]
        return _cache


def get_equipment_type_repo(db: Session = Depends(get_db)) -> EquipmentTypeRepository:
    """FastAPI dependency that yields a session-scoped EquipmentTypeRepository."""
    return EquipmentTypeRepository(db)
