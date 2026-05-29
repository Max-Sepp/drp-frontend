from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.equipment_type import EquipmentType
from app.repositories.cache import cached_list
from app.schemas.equipment_type import EquipmentTypeSchema


class EquipmentTypeRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    @cached_list
    def list_all(self) -> list[EquipmentTypeSchema]:
        rows = self._db.query(EquipmentType).order_by(EquipmentType.name).all()
        return [EquipmentTypeSchema.model_validate(s) for s in rows]


def get_equipment_type_repo(db: Session = Depends(get_db)) -> EquipmentTypeRepository:
    return EquipmentTypeRepository(db)
