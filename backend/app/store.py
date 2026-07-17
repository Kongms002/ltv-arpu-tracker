from dataclasses import replace
from datetime import datetime, timezone
from threading import RLock
from typing import Dict, List

from .models import Campaign, Event, Recommendation, Spend
from .seed import build_demo_data


class DemoStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self.reset()

    def reset(self) -> None:
        with self._lock:
            self.campaigns, self.events, self.spends = build_demo_data()
            self.recommendations: Dict[str, Recommendation] = {}
            self.activity: List[dict] = [
                {
                    "id": "activity-seed",
                    "kind": "sync",
                    "title": "Demo workspace synced",
                    "detail": "28 days of app events and ad spend were normalized.",
                    "occurred_at": datetime.now(timezone.utc).isoformat(),
                }
            ]

    def add_event(self, event: Event) -> None:
        with self._lock:
            if any(item.event_id == event.event_id for item in self.events):
                raise ValueError("event_id already exists")
            self.events.append(event)

    def add_spend(self, spend: Spend) -> None:
        with self._lock:
            if spend.campaign_id not in self.campaigns:
                raise KeyError("unknown campaign_id")
            if any(item.record_id == spend.record_id for item in self.spends):
                raise ValueError("record_id already exists")
            self.spends.append(spend)

    def apply_recommendation(self, recommendation: Recommendation, approved_by: str) -> Recommendation:
        with self._lock:
            campaign = self.campaigns[recommendation.campaign_id]
            if recommendation.status == "approved":
                return recommendation

            factor = 1 + recommendation.adjustment_pct / 100
            next_status = "paused" if recommendation.action == "pause" else campaign.status
            next_budget = 0.0 if next_status == "paused" else round(max(20.0, campaign.daily_budget * factor), 2)
            self.campaigns[campaign.id] = replace(campaign, daily_budget=next_budget, status=next_status)
            recommendation.status = "approved"
            self.activity.insert(
                0,
                {
                    "id": f"activity-{recommendation.id}",
                    "kind": "action",
                    "title": f"{recommendation.action.title()} approved for {campaign.name}",
                    "detail": f"{approved_by} applied a simulated {recommendation.adjustment_pct:+d}% change. Daily budget is now ${next_budget:,.0f}.",
                    "occurred_at": datetime.now(timezone.utc).isoformat(),
                },
            )
            return recommendation


store = DemoStore()
