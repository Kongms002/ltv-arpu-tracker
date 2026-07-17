from app.analytics import build_recommendation, safe_divide


BASE_ROW = {
    "id": "campaign-a",
    "installs": 220,
    "attribution_coverage": 0.94,
    "ltv_cac": 1.5,
    "d7_retention": 0.31,
    "daily_budget": 100.0,
}


def test_safe_divide_handles_empty_denominator():
    assert safe_divide(10, 0) == 0


def test_recommendation_scales_profitable_cohort():
    recommendation = build_recommendation(BASE_ROW)
    assert recommendation.action == "scale"
    assert recommendation.adjustment_pct == 20
    assert recommendation.confidence == "high"


def test_recommendation_pauses_deeply_unprofitable_cohort():
    row = {**BASE_ROW, "ltv_cac": 0.62}
    recommendation = build_recommendation(row)
    assert recommendation.action == "pause"
    assert recommendation.adjustment_pct == -100


def test_recommendation_holds_when_sample_is_too_small():
    row = {**BASE_ROW, "installs": 42}
    recommendation = build_recommendation(row)
    assert recommendation.action == "hold"
    assert recommendation.confidence == "low"
