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


class OutageReportSummary(OutageReportBase):
    """Outage report returned by list and single-item endpoints.

    Image bytes are intentionally absent — use GET /outage-reports/{id}/image
    to retrieve them.  `image_content_type` is kept so callers can tell whether
    an image exists without downloading it.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    image_content_type: str | None = None


class OutageReport(OutageReportBase):
    """Full outage report including raw image bytes (internal / download use)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    image: bytes | None = None
    image_content_type: str | None = None
