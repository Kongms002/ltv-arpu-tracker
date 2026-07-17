from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class EventIn(BaseModel):
    event_id: str = Field(min_length=3)
    user_id: str = Field(min_length=1)
    event_type: Literal["install", "session", "purchase", "subscription_renewal", "ad_revenue"]
    occurred_at: datetime
    campaign_id: Optional[str] = None
    value_usd: float = Field(default=0, ge=0)
    platform: Literal["ios", "android"] = "ios"


class SpendIn(BaseModel):
    record_id: str = Field(min_length=3)
    campaign_id: str
    spend_date: date
    amount_usd: float = Field(gt=0)


class ApprovalIn(BaseModel):
    approved_by: str = Field(default="Demo operator", min_length=2)

