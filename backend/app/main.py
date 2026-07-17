from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .analytics import build_dashboard, generate_recommendations, summarize_campaigns
from .ai_brief import generate_growth_brief
from .models import Event, Spend
from .schemas import ApprovalIn, EventIn, SpendIn
from .store import store


app = FastAPI(title="GrossHacker AI", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/dashboard")
def dashboard() -> dict:
    payload, _ = build_dashboard(store.campaigns, store.events, store.spends)
    return payload


@app.get("/api/cohorts")
def cohorts() -> dict:
    rows = summarize_campaigns(store.campaigns, store.events, store.spends)
    return {"items": rows, "metric_note": "ARPU is cumulative attributed revenue divided by attributed installs."}


@app.get("/api/recommendations")
def recommendations() -> dict:
    _, rows = build_dashboard(store.campaigns, store.events, store.spends)
    items = generate_recommendations(rows, store.recommendations)
    return {"items": [asdict(item) for item in items], "guardrail": "Demo mode · human approval · budget adjustments capped at ±20%"}


@app.get("/api/ai/growth-brief")
def ai_growth_brief() -> dict:
    _, rows = build_dashboard(store.campaigns, store.events, store.spends)
    items = generate_recommendations(rows, store.recommendations)
    return generate_growth_brief(rows, items)


@app.post("/api/recommendations/{recommendation_id}/approve")
def approve_recommendation(recommendation_id: str, payload: ApprovalIn) -> dict:
    _, rows = build_dashboard(store.campaigns, store.events, store.spends)
    generate_recommendations(rows, store.recommendations)
    recommendation = store.recommendations.get(recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail="recommendation not found")
    approved = store.apply_recommendation(recommendation, payload.approved_by)
    return {"recommendation": asdict(approved), "campaign": asdict(store.campaigns[approved.campaign_id])}


@app.get("/api/sources")
def sources() -> dict:
    return {
        "items": [
            {"id": "posthog", "name": "PostHog Events", "kind": "Product analytics", "status": "connected", "freshness": "4 min ago", "coverage": 0.96},
            {"id": "ga4", "name": "Google Analytics 4", "kind": "Mobile analytics", "status": "connected", "freshness": "11 min ago", "coverage": 0.91},
            {"id": "ad-spend", "name": "Ad Spend Import", "kind": "Meta · Google · AppLovin", "status": "demo", "freshness": "Seeded CSV", "coverage": 1.0},
        ]
    }


@app.get("/api/activity")
def activity() -> dict:
    return {"items": store.activity}


@app.post("/api/events", status_code=201)
def ingest_event(payload: EventIn) -> dict:
    try:
        store.add_event(Event(**payload.model_dump()))
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return {"accepted": True, "event_id": payload.event_id}


@app.post("/api/spend", status_code=201)
def ingest_spend(payload: SpendIn) -> dict:
    try:
        store.add_spend(Spend(**payload.model_dump()))
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    return {"accepted": True, "record_id": payload.record_id}


@app.post("/api/demo/reset")
def reset_demo() -> dict:
    store.reset()
    return {"reset": True}
