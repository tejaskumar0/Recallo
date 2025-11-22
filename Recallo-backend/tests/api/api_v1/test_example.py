from fastapi.testclient import TestClient
from app.core.config import settings

def test_read_example(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/example/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_health_check(client: TestClient) -> None:
    response = client.get(f"{settings.API_V1_STR}/example/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
