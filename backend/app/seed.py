from datetime import date, datetime, time, timedelta, timezone
from random import Random
from typing import Dict, List, Tuple

from .models import Campaign, Event, Spend


CAMPAIGN_BLUEPRINTS = (
    # budget is the controllable daily cap; spend ratio shapes three distinct demo outcomes.
    ("meta-pixel", "Pixel Quest — US iOS", "Meta Ads", 240.0, 1.55, 0.39, 0.15),
    ("google-zen", "Zen Grid — KR Android", "Google Ads", 180.0, 0.98, 0.29, 0.20),
    ("applovin-astro", "Astro Dash — Global", "AppLovin", 150.0, 0.61, 0.18, 0.24),
)


def build_demo_data(today: date = None) -> Tuple[Dict[str, Campaign], List[Event], List[Spend]]:
    today = today or date.today()
    rng = Random(27)
    campaigns: Dict[str, Campaign] = {}
    events: List[Event] = []
    spends: List[Spend] = []

    for campaign_index, (campaign_id, name, network, budget, revenue_factor, retention, spend_ratio) in enumerate(CAMPAIGN_BLUEPRINTS):
        campaigns[campaign_id] = Campaign(campaign_id, name, network, budget)

        for days_ago in range(27, -1, -1):
            day = today - timedelta(days=days_ago)
            spend_amount = round(budget * spend_ratio * (0.82 + rng.random() * 0.28), 2)
            spends.append(Spend(f"spend-{campaign_id}-{day}", campaign_id, day, spend_amount))

            installs = 7 + campaign_index * 2 + (day.toordinal() % 4)
            for install_index in range(installs):
                user_id = f"{campaign_id}-{day.isoformat()}-{install_index}"
                install_time = datetime.combine(day, time(10, install_index % 60), tzinfo=timezone.utc)
                platform = "android" if campaign_id == "google-zen" else "ios"
                events.append(Event(f"install-{user_id}", user_id, "install", install_time, campaign_id, platform=platform))

                # Deterministic retention signals through day 7.
                for age in (1, 3, 7):
                    if day + timedelta(days=age) <= today and rng.random() < retention * (1 - age * 0.045):
                        events.append(
                            Event(
                                f"session-{user_id}-{age}",
                                user_id,
                                "session",
                                install_time + timedelta(days=age, hours=2),
                                campaign_id,
                                platform=platform,
                            )
                        )

                payer_probability = 0.26 - campaign_index * 0.045
                if rng.random() < payer_probability and day + timedelta(days=1) <= today:
                    purchase_value = round((3.99 + rng.random() * 8.0) * revenue_factor, 2)
                    events.append(
                        Event(
                            f"purchase-{user_id}",
                            user_id,
                            "purchase",
                            install_time + timedelta(days=1, hours=5),
                            campaign_id,
                            purchase_value,
                            platform,
                        )
                    )
                    if rng.random() < 0.28 and day + timedelta(days=6) <= today:
                        events.append(
                            Event(
                                f"purchase-repeat-{user_id}",
                                user_id,
                                "purchase",
                                install_time + timedelta(days=6, hours=3),
                                campaign_id,
                                round(purchase_value * 0.72, 2),
                                platform,
                            )
                        )

    return campaigns, events, spends
