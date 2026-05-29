from datetime import datetime, timezone

from fastapi import Depends
from sqlalchemy import exists
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.equipment import Equipment
from app.models.failure import Failure
from app.models.outage_report import OutageReport
from app.models.outage_report_deletion import OutageReportDeletion
from app.schemas.outage_report import OutageReportCreate

_ACTIVE_FILTER = ~exists().where(OutageReportDeletion.report_id == OutageReport.id)

_REPORT_JOINEDLOAD = [
    joinedload(OutageReport.failure)
    .joinedload(Failure.equipment)
    .joinedload(Equipment.station),
    joinedload(OutageReport.failure)
    .joinedload(Failure.equipment)
    .joinedload(Equipment.equipment_type),
]


class OutageReportRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get(self, report_id: int) -> OutageReport | None:
        return self._db.get(OutageReport, report_id)

    def get_active(self, report_id: int) -> OutageReport | None:
        return (
            self._db.query(OutageReport)
            .options(*_REPORT_JOINEDLOAD)
            .filter(OutageReport.id == report_id, _ACTIVE_FILTER)
            .one_or_none()
        )

    def list_all(self) -> list[OutageReport]:
        return (
            self._db.query(OutageReport)
            .options(*_REPORT_JOINEDLOAD)
            .filter(_ACTIVE_FILTER)
            .order_by(OutageReport.breakdown_time.desc())
            .all()
        )

    def is_deleted(self, report_id: int) -> bool:
        return self._db.query(
            exists().where(OutageReportDeletion.report_id == report_id)
        ).scalar()

    # ------------------------------------------------------------------
    # Mutations
    # ------------------------------------------------------------------

    def create(self, payload: OutageReportCreate) -> OutageReport:
        if self._db.get(Equipment, payload.equipment_id) is None:
            raise ValueError(f"equipment_id {payload.equipment_id} not found")

        failure = self._find_or_create_failure(payload.equipment_id)

        report = OutageReport(
            failure_id=failure.id,
            breakdown_time=payload.breakdown_time,
            description=payload.description,
        )
        self._db.add(report)
        self._db.commit()
        return self.get_active(report.id)

    def soft_delete(self, report: OutageReport, reason: str | None = None) -> None:
        deletion = OutageReportDeletion(
            report_id=report.id,
            deleted_at=datetime.now(tz=timezone.utc),
            reason=reason,
        )
        self._db.add(deletion)
        self._db.commit()

    def set_image(self, report: OutageReport, image: bytes, content_type: str) -> OutageReport:
        report.image = image
        report.image_content_type = content_type
        self._db.commit()
        self._db.refresh(report)
        return self.get_active(report.id)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _find_or_create_failure(self, equipment_id: int) -> Failure:
        failure = (
            self._db.query(Failure)
            .filter_by(equipment_id=equipment_id, resolved=False)
            .first()
        )
        if failure is None:
            failure = Failure(equipment_id=equipment_id)
            self._db.add(failure)
            self._db.flush()
        return failure


def get_repo(db: Session = Depends(get_db)) -> OutageReportRepository:
    return OutageReportRepository(db)
