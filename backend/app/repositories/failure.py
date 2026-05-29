from fastapi import Depends
from sqlalchemy import exists, func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.equipment import Equipment
from app.models.equipment_type import EquipmentType
from app.models.failure import Failure
from app.models.outage_report import OutageReport
from app.models.outage_report_deletion import OutageReportDeletion
from app.models.station import Station

_ACTIVE_FILTER = ~exists().where(OutageReportDeletion.report_id == OutageReport.id)

_EQUIPMENT_JOINEDLOAD = [
    joinedload(Failure.equipment).joinedload(Equipment.station),
    joinedload(Failure.equipment).joinedload(Equipment.equipment_type),
]

_REPORT_JOINEDLOAD = [
    joinedload(OutageReport.failure).joinedload(Failure.equipment).joinedload(Equipment.station),
    joinedload(OutageReport.failure).joinedload(Failure.equipment).joinedload(Equipment.equipment_type),
]


class FailureRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get(self, failure_id: int) -> Failure | None:
        return (
            self._db.query(Failure)
            .options(*_EQUIPMENT_JOINEDLOAD)
            .filter(Failure.id == failure_id)
            .one_or_none()
        )

    def list_all_with_stats(self) -> list[tuple]:
        """Return (Failure, first_reported, report_count) for every failure."""
        first_reported_sq = (
            select(func.min(OutageReport.breakdown_time))
            .where(
                OutageReport.failure_id == Failure.id,
                _ACTIVE_FILTER,
            )
            .correlate(Failure)
            .scalar_subquery()
        )

        report_count_sq = (
            select(func.count(OutageReport.id))
            .where(
                OutageReport.failure_id == Failure.id,
                _ACTIVE_FILTER,
            )
            .correlate(Failure)
            .scalar_subquery()
        )

        return (
            self._db.query(
                Failure,
                first_reported_sq.label("first_reported"),
                report_count_sq.label("report_count"),
            )
            .options(*_EQUIPMENT_JOINEDLOAD)
            .order_by(first_reported_sq.desc())
            .all()
        )

    def list_active_reports(self, failure_id: int) -> list[OutageReport]:
        """Return active (non-deleted) reports for a failure, newest first."""
        return (
            self._db.query(OutageReport)
            .options(*_REPORT_JOINEDLOAD)
            .filter(OutageReport.failure_id == failure_id, _ACTIVE_FILTER)
            .order_by(OutageReport.breakdown_time.desc())
            .all()
        )

    def resolve(self, failure: Failure) -> Failure:
        failure.resolved = True
        self._db.commit()
        self._db.refresh(failure)
        return failure


def get_failure_repo(db: Session = Depends(get_db)) -> FailureRepository:
    return FailureRepository(db)
