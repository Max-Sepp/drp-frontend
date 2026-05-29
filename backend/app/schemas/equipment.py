from pydantic import BaseModel, ConfigDict

from app.schemas.equipment_type import EquipmentTypeSchema
from app.schemas.station import StationSchema


class EquipmentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    station: StationSchema
    equipment_type: EquipmentTypeSchema
    connection: str
