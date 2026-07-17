import type { Activity, Cohort, Dashboard, Recommendation, Source } from './types'

const series = Array.from({ length: 28 }, (_, index) => {
  const date = new Date(2026, 6, index - 10)
  return {
    date: date.toISOString().slice(0, 10),
    revenue: 225 + index * 5.7 + Math.sin(index * 1.25) * 42,
    spend: 460 + Math.cos(index * 0.72) * 38,
    installs: 27 + (index % 5),
    arpu: 6.8 + index * 0.05,
  }
})

export const demoDashboard: Dashboard = {
  as_of: '2026-07-17',
  window: 'Last 14 days',
  metrics: { revenue: 5642.8, spend: 6018.4, installs: 924, arpu: 6.11, projected_ltv90: 12.84, cac: 6.51, roas: 0.938 },
  deltas: { revenue: 18.4, spend: 7.2, installs: 11.8, arpu: 9.1, projected_ltv90: 12.6, cac: -4.1, roas: 10.5 },
  series,
  data_health: { status: 'healthy', last_sync_minutes: 4, attribution_coverage: 0.91, events_processed: 1874 },
}

export const demoCohorts: Cohort[] = [
  { id: 'meta-pixel', name: 'Pixel Quest — US iOS', network: 'Meta Ads', status: 'active', daily_budget: 240, installs: 274, revenue: 2488, spend: 1954, arpu: 9.08, projected_ltv90: 20.12, cac: 7.13, roas: 1.273, ltv_cac: 2.82, d7_retention: 0.34, attribution_coverage: 0.94 },
  { id: 'google-zen', name: 'Zen Grid — KR Android', network: 'Google Ads', status: 'active', daily_budget: 180, installs: 318, revenue: 1830, spend: 2198, arpu: 5.75, projected_ltv90: 11.83, cac: 6.91, roas: 0.833, ltv_cac: 1.71, d7_retention: 0.28, attribution_coverage: 0.92 },
  { id: 'applovin-astro', name: 'Astro Dash — Global', network: 'AppLovin', status: 'active', daily_budget: 150, installs: 332, revenue: 1325, spend: 1866, arpu: 3.99, projected_ltv90: 7.82, cac: 5.62, roas: 0.71, ltv_cac: 0.73, d7_retention: 0.17, attribution_coverage: 0.86 },
]

export const demoRecommendations: Recommendation[] = [
  { id: 'rec-meta-pixel', campaign_id: 'meta-pixel', action: 'scale', adjustment_pct: 20, confidence: 'high', reason: 'Projected LTV90 is 2.82× CAC with 34% early retention.', expected_impact_usd: 1440, status: 'proposed' },
  { id: 'rec-google-zen', campaign_id: 'google-zen', action: 'hold', adjustment_pct: 0, confidence: 'high', reason: 'Efficiency is promising, but revenue maturity is still uneven across recent cohorts.', expected_impact_usd: 0, status: 'proposed' },
  { id: 'rec-applovin-astro', campaign_id: 'applovin-astro', action: 'reduce', adjustment_pct: -20, confidence: 'medium', reason: 'Projected LTV90 is below the efficiency floor with 17% early retention.', expected_impact_usd: 900, status: 'proposed' },
]

export const demoSources: Source[] = [
  { id: 'posthog', name: 'PostHog Events', kind: 'Product analytics', status: 'connected', freshness: '4 min ago', coverage: 0.96 },
  { id: 'ga4', name: 'Google Analytics 4', kind: 'Mobile analytics', status: 'connected', freshness: '11 min ago', coverage: 0.91 },
  { id: 'ad-spend', name: 'Ad Spend Import', kind: 'Meta · Google · AppLovin', status: 'demo', freshness: 'Seeded CSV', coverage: 1 },
]

export const demoActivity: Activity[] = [
  { id: '1', kind: 'sync', title: 'PostHog events normalized', detail: '428 new events matched to 96% of attributed installs.', occurred_at: new Date().toISOString() },
  { id: '2', kind: 'insight', title: 'ARPU lift detected', detail: 'Pixel Quest US iOS is 18.6% above its comparable 14-day baseline.', occurred_at: new Date(Date.now() - 3_600_000).toISOString() },
  { id: '3', kind: 'guardrail', title: 'Budget change held for review', detail: 'AppLovin recommendation requires operator approval before simulated execution.', occurred_at: new Date(Date.now() - 7_200_000).toISOString() },
]

