from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[int] = mapped_column(primary_key=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    equipment_type_id: Mapped[int] = mapped_column(ForeignKey("equipment_types.id"), index=True)
    connection: Mapped[str] = mapped_column()

    __table_args__ = (UniqueConstraint("station_id", "equipment_type_id", "connection"),)

    station: Mapped["Station"] = relationship("Station")
    equipment_type: Mapped["EquipmentType"] = relationship("EquipmentType")
    failures: Mapped[list["Failure"]] = relationship("Failure", back_populates="equipment")
