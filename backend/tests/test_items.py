from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.item import Item


def test_read_item_returns_existing(client: TestClient, db_session: Session) -> None:
    item = Item(name="widget")
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)

    response = client.get(f"/items/{item.id}")

    assert response.status_code == 200
    assert response.json() == {"id": item.id, "name": "widget"}


def test_read_item_missing_returns_404(client: TestClient) -> None:
    response = client.get("/items/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Item not found"}
