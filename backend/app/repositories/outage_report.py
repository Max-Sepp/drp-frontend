from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.outage_report import OutageReport
from app.schemas.outage_report import OutageReportCreate


class OutageReportRepository:
    """Data-access layer for outage reports.

    All SQLAlchemy queries live here so that routers stay free of
    database concerns and this class can be substituted in tests.
    """

    def __init__(self, db: Session) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get(self, report_id: int) -> OutageReport | None:
        """Return the report with *report_id*, or ``None`` if absent."""
        return self._db.get(OutageReport, report_id)

    def list_all(self) -> list[OutageReport]:
        """Return every report ordered newest breakdown first."""
        return (
            self._db.query(OutageReport)
            .order_by(OutageReport.breakdown_time.desc())
            .all()
        )

    # ------------------------------------------------------------------
    # Mutations
    # ------------------------------------------------------------------

    def create(self, payload: OutageReportCreate) -> OutageReport:
        """Persist a new report and return the saved instance."""
        report = OutageReport(**payload.model_dump())
        self._db.add(report)
        self._db.commit()
        self._db.refresh(report)
        return report

    def delete(self, report: OutageReport) -> None:
        """Delete *report* from the database."""
        self._db.delete(report)
        self._db.commit()

    def set_image(
        self, report: OutageReport, image: bytes, content_type: str
    ) -> OutageReport:
        """Attach (or replace) the image on *report* and return it."""
        report.image = image
        report.image_content_type = content_type
        self._db.commit()
        self._db.refresh(report)
        return report


def get_repo(db: Session = Depends(get_db)) -> OutageReportRepository:
    """FastAPI dependency that provides an ``OutageReportRepository``."""
    return OutageReportRepository(db)
