from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import EquipmentType, Station


class OutageReportBase(BaseModel):
    """Fields shared by create and read schemas."""

    equipment_type: EquipmentType
    station: Station
    connection: str  # e.g. "street to platform 5"
    breakdown_time: datetime
    description: str | None = None


class OutageReportCreate(OutageReportBase):
    """Payload accepted when submitting a new outage report.

    `image` and `image_content_type` are handled separately via a multipart
    upload endpoint rather than JSON, so they are absent here.
    """

    pass


class OutageReport(OutageReportBase):
    """Full outage report as returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int

    # These are omitted from responses by default; expose them only in a
    # dedicated image-download endpoint to avoid bloating list responses.
    image: bytes | None = None
    image_content_type: str | None = None
