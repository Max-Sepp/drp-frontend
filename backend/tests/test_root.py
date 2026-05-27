from fastapi.testclient import TestClient


def test_read_root(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "There is nothing here yet, but you can check out the /docs for API documentation!"}
