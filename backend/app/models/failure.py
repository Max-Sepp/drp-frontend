from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Failure(Base):
    """A single outage of a piece of equipment, aggregating one or more user reports until resolved."""

    __tablename__ = "failures"

    id: Mapped[int] = mapped_column(primary_key=True)
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), index=True)
    resolved: Mapped[bool] = mapped_column(default=False)

    equipment: Mapped["Equipment"] = relationship("Equipment", back_populates="failures")
    reports: Mapped[list["OutageReport"]] = relationship("OutageReport", back_populates="failure")
