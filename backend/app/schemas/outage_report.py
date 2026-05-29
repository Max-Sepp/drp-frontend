from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.failure import FailureDetail, FailureInline


class OutageReportCreate(BaseModel):
    equipment_id: int
    breakdown_time: datetime
    description: str | None = None


class OutageReportSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    failure_id: int
    failure: FailureInline
    breakdown_time: datetime
    description: str | None = None
    image_content_type: str | None = None


# FailureDetail.reports references OutageReportSummary by string; resolve it now.
FailureDetail.model_rebuild()
