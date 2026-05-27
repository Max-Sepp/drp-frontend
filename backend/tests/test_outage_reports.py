from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.outage_report import OutageReport

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_BREAKDOWN_TIME = datetime(2024, 6, 1, 9, 0, 0, tzinfo=timezone.utc)
_BREAKDOWN_TIME_STR = "2024-06-01T09:00:00Z"

_VALID_PAYLOAD: dict = {
    "equipment_type": "lift",
    "station": "Victoria",
    "connection": "street to platform 1",
    "breakdown_time": _BREAKDOWN_TIME_STR,
    "description": "Doors not closing",
}


def _create_report(db: Session, **overrides) -> OutageReport:
    """Insert an OutageReport directly via the ORM and return it."""
    fields = dict(
        equipment_type="lift",
        station="Victoria",
        connection="street to platform 1",
        breakdown_time=_BREAKDOWN_TIME,
        description="Test report",
    )
    fields.update(overrides)
    report = OutageReport(**fields)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ---------------------------------------------------------------------------
# POST /outage-reports
# ---------------------------------------------------------------------------


def test_create_outage_report_returns_201(client: TestClient) -> None:
    response = client.post("/outage-reports", json=_VALID_PAYLOAD)

    assert response.status_code == 201
    body = response.json()
    assert body["id"] is not None
    assert body["equipment_type"] == "lift"
    assert body["station"] == "Victoria"
    assert body["connection"] == "street to platform 1"
    assert body["description"] == "Doors not closing"
    assert body["image_content_type"] is None


def test_create_outage_report_description_optional(client: TestClient) -> None:
    payload = {k: v for k, v in _VALID_PAYLOAD.items() if k != "description"}
    response = client.post("/outage-reports", json=payload)

    assert response.status_code == 201
    assert response.json()["description"] is None


def test_create_outage_report_invalid_equipment_type_returns_422(
    client: TestClient,
) -> None:
    payload = {**_VALID_PAYLOAD, "equipment_type": "helicopter"}
    response = client.post("/outage-reports", json=payload)

    assert response.status_code == 422


def test_create_outage_report_invalid_station_returns_422(client: TestClient) -> None:
    payload = {**_VALID_PAYLOAD, "station": "Hogwarts"}
    response = client.post("/outage-reports", json=payload)

    assert response.status_code == 422


def test_create_outage_report_missing_required_field_returns_422(
    client: TestClient,
) -> None:
    payload = {k: v for k, v in _VALID_PAYLOAD.items() if k != "connection"}
    response = client.post("/outage-reports", json=payload)

    assert response.status_code == 422


# ---------------------------------------------------------------------------
# GET /outage-reports
# ---------------------------------------------------------------------------


def test_list_outage_reports_empty(client: TestClient) -> None:
    response = client.get("/outage-reports")

    assert response.status_code == 200
    assert response.json() == []


def test_list_outage_reports_returns_all(
    client: TestClient, db_session: Session
) -> None:
    _create_report(db_session)
    _create_report(db_session, station="Waterloo")

    response = client.get("/outage-reports")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_list_outage_reports_ordered_newest_first(
    client: TestClient, db_session: Session
) -> None:
    older = _create_report(
        db_session,
        breakdown_time=datetime(2024, 1, 1, tzinfo=timezone.utc),
    )
    newer = _create_report(
        db_session,
        breakdown_time=datetime(2024, 6, 1, tzinfo=timezone.utc),
    )

    response = client.get("/outage-reports")
    ids = [r["id"] for r in response.json()]

    assert ids == [newer.id, older.id]


# ---------------------------------------------------------------------------
# GET /outage-reports/{report_id}
# ---------------------------------------------------------------------------


def test_get_outage_report_returns_report(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)

    response = client.get(f"/outage-reports/{report.id}")

    assert response.status_code == 200
    assert response.json()["id"] == report.id


def test_get_outage_report_missing_returns_404(client: TestClient) -> None:
    response = client.get("/outage-reports/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Outage report not found"}


# ---------------------------------------------------------------------------
# DELETE /outage-reports/{report_id}
# ---------------------------------------------------------------------------


def test_delete_outage_report_returns_204(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)

    response = client.delete(f"/outage-reports/{report.id}")

    assert response.status_code == 204


def test_delete_outage_report_removes_from_db(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)

    client.delete(f"/outage-reports/{report.id}")

    assert db_session.get(OutageReport, report.id) is None


def test_delete_outage_report_missing_returns_404(client: TestClient) -> None:
    response = client.delete("/outage-reports/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Outage report not found"}


# ---------------------------------------------------------------------------
# POST /outage-reports/{report_id}/image
# ---------------------------------------------------------------------------

_TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00"
    b"\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18"
    b"\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


def test_upload_image_returns_updated_report(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)

    response = client.post(
        f"/outage-reports/{report.id}/image",
        files={"file": ("photo.png", _TINY_PNG, "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["image_content_type"] == "image/png"


def test_upload_image_replaces_existing_image(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)
    # Upload a first image
    client.post(
        f"/outage-reports/{report.id}/image",
        files={"file": ("old.png", _TINY_PNG, "image/png")},
    )

    # Replace it with a JPEG
    tiny_jpeg = b"\xff\xd8\xff\xd9"  # minimal valid-enough JPEG bytes
    response = client.post(
        f"/outage-reports/{report.id}/image",
        files={"file": ("new.jpg", tiny_jpeg, "image/jpeg")},
    )

    assert response.status_code == 200
    assert response.json()["image_content_type"] == "image/jpeg"


def test_upload_image_missing_report_returns_404(client: TestClient) -> None:
    response = client.post(
        "/outage-reports/999/image",
        files={"file": ("photo.png", _TINY_PNG, "image/png")},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Outage report not found"}


@pytest.mark.parametrize("content_type", ["image/tiff", "application/pdf", "text/plain"])
def test_upload_image_unsupported_type_returns_415(
    client: TestClient, db_session: Session, content_type: str
) -> None:
    report = _create_report(db_session)

    response = client.post(
        f"/outage-reports/{report.id}/image",
        files={"file": ("file", b"data", content_type)},
    )

    assert response.status_code == 415


# ---------------------------------------------------------------------------
# GET /outage-reports/{report_id}/image
# ---------------------------------------------------------------------------


def test_download_image_returns_bytes(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)
    client.post(
        f"/outage-reports/{report.id}/image",
        files={"file": ("photo.png", _TINY_PNG, "image/png")},
    )

    response = client.get(f"/outage-reports/{report.id}/image")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content == _TINY_PNG


def test_download_image_missing_report_returns_404(client: TestClient) -> None:
    response = client.get("/outage-reports/999/image")

    assert response.status_code == 404
    assert response.json() == {"detail": "Outage report not found"}


def test_download_image_no_image_attached_returns_404(
    client: TestClient, db_session: Session
) -> None:
    report = _create_report(db_session)

    response = client.get(f"/outage-reports/{report.id}/image")

    assert response.status_code == 404
    assert response.json() == {"detail": "No image attached to this outage report"}
