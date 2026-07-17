from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


@dataclass(frozen=True)
class Campaign:
    id: str
    name: str
    network: str
    daily_budget: float
    status: str = "active"


@dataclass(frozen=True)
class Event:
    event_id: str
    user_id: str
    event_type: str
    occurred_at: datetime
    campaign_id: Optional[str]
    value_usd: float = 0.0
    platform: str = "ios"


@dataclass(frozen=True)
class Spend:
    record_id: str
    campaign_id: str
    spend_date: date
    amount_usd: float


@dataclass
class Recommendation:
    id: str
    campaign_id: str
    action: str
    adjustment_pct: int
    confidence: str
    reason: str
    expected_impact_usd: float
    status: str = "proposed"

