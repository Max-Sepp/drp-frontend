from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class EquipmentType(Base):
    __tablename__ = "equipment_types"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
