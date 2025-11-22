from fastapi.testclient import TestClient
from app.core.config import settings
from unittest.mock import patch

# Mock Supabase response
class MockResponse:
    def __init__(self, data):
        self.data = data

    def execute(self):
        return self

def test_read_events(client: TestClient) -> None:
    with patch("app.api.api_v1.endpoints.events.supabase") as mock_supabase:
        mock_supabase.table.return_value.select.return_value.range.return_value.execute.return_value = MockResponse(
            [{"id": "123e4567-e89b-12d3-a456-426614174000", "event_name": "Test Event", "created_at": "2023-01-01T00:00:00"}]
        )
        
        response = client.get(f"{settings.API_V1_STR}/events/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["event_name"] == "Test Event"
