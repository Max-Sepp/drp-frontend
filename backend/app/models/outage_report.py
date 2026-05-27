from datetime import datetime

from sqlalchemy import Enum, LargeBinary, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.enums import EquipmentType, Station


class OutageReport(Base):
    """A report of a broken-down accessibility aid (lift, escalator, etc.)."""

    __tablename__ = "outage_reports"

    id: Mapped[int] = mapped_column(primary_key=True)

    # What kind of equipment broke down
    equipment_type: Mapped[EquipmentType] = mapped_column(Enum(EquipmentType))

    # Which station the equipment is at
    station: Mapped[Station] = mapped_column(Enum(Station))

    # Description of what the equipment connects, e.g. "street to platform 5"
    connection: Mapped[str] = mapped_column()

    # When the breakdown was reported / occurred
    breakdown_time: Mapped[datetime] = mapped_column()

    # Optional free-text description of the fault
    description: Mapped[str | None] = mapped_column(Text, default=None)

    # Optional image stored as raw bytes (BYTEA in Postgres)
    image: Mapped[bytes | None] = mapped_column(LargeBinary, default=None)

    # MIME type of the stored image (e.g. "image/jpeg"), required when image is present
    image_content_type: Mapped[str | None] = mapped_column(default=None)
