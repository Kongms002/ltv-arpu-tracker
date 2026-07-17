import json
import os
from typing import List

from .models import Recommendation


def _fallback_brief(rows: List[dict], recommendations: List[Recommendation]) -> str:
    lead = next((item for item in recommendations if item.action == "scale"), recommendations[0])
    campaign = next(row for row in rows if row["id"] == lead.campaign_id)
    return (
        f"{campaign['name']} is the strongest current cohort at {campaign['ltv_cac']:.2f}× projected LTV:CAC. "
        f"The guarded next action is {lead.action.upper()} ({lead.adjustment_pct:+d}%) with {lead.confidence} confidence. "
        "Keep human approval enabled until the next cohort maturity check."
    )


def generate_growth_brief(rows: List[dict], recommendations: List[Recommendation]) -> dict:
    """Generate an operator brief with GPT-5.6 when configured, otherwise stay demo-safe."""
    fallback = _fallback_brief(rows, recommendations)
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "brief": fallback,
            "provider": "deterministic-fallback",
            "model": None,
            "note": "Set OPENAI_API_KEY to enable the GPT-5.6 narrative layer.",
        }

    from openai import OpenAI

    client = OpenAI()
    model = os.getenv("OPENAI_MODEL", "gpt-5.6")
    payload = {
        "cohorts": rows,
        "recommendations": [
            {
                "campaign_id": item.campaign_id,
                "action": item.action,
                "adjustment_pct": item.adjustment_pct,
                "confidence": item.confidence,
                "reason": item.reason,
            }
            for item in recommendations
        ],
    }
    response = client.responses.create(
        model=model,
        instructions=(
            "You are a cautious mobile growth operator. Write a three-sentence daily brief from the supplied metrics. "
            "Never claim causality, never change the recommended action, mention confidence, and explicitly keep human approval."
        ),
        input=json.dumps(payload),
        max_output_tokens=280,
    )
    return {
        "brief": response.output_text or fallback,
        "provider": "openai",
        "model": model,
        "note": "GPT-5.6 explains deterministic analytics; it does not invent or modify financial metrics.",
    }
