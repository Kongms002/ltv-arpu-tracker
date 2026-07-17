from fastapi.testclient import TestClient

from app.main import app
from app.store import store


client = TestClient(app)


def setup_function():
    store.reset()


def test_dashboard_contract_and_reconciliation():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    body = response.json()
    assert body["metrics"]["installs"] > 0
    assert len(body["series"]) == 28
    assert body["data_health"]["attribution_coverage"] > 0.8


def test_growth_brief_has_safe_fallback_without_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.get("/api/ai/growth-brief")
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "deterministic-fallback"
    assert "human approval" in body["brief"]


def test_approving_recommendation_updates_campaign_and_activity():
    items = client.get("/api/recommendations").json()["items"]
    actionable = next(item for item in items if item["action"] != "hold")
    response = client.post(f"/api/recommendations/{actionable['id']}/approve", json={"approved_by": "Test operator"})
    assert response.status_code == 200
    assert response.json()["recommendation"]["status"] == "approved"
    activity = client.get("/api/activity").json()["items"]
    assert activity[0]["kind"] == "action"


def test_event_ingestion_is_idempotent_by_event_id():
    payload = {
        "event_id": "evt-test-001",
        "user_id": "user-1",
        "event_type": "purchase",
        "occurred_at": "2026-07-17T08:00:00Z",
        "campaign_id": "meta-pixel",
        "value_usd": 4.99,
        "platform": "ios",
    }
    assert client.post("/api/events", json=payload).status_code == 201
    assert client.post("/api/events", json=payload).status_code == 409
