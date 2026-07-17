export type Dashboard = {
  as_of: string
  window: string
  metrics: {
    revenue: number
    spend: number
    installs: number
    arpu: number
    projected_ltv90: number
    cac: number
    roas: number
  }
  deltas: Record<string, number>
  series: Array<{ date: string; revenue: number; spend: number; installs: number; arpu: number }>
  data_health: { status: string; last_sync_minutes: number; attribution_coverage: number; events_processed: number }
}

export type Cohort = {
  id: string
  name: string
  network: string
  status: string
  daily_budget: number
  installs: number
  revenue: number
  spend: number
  arpu: number
  projected_ltv90: number
  cac: number
  roas: number
  ltv_cac: number
  d7_retention: number
  attribution_coverage: number
}

export type Recommendation = {
  id: string
  campaign_id: string
  action: 'scale' | 'hold' | 'reduce' | 'pause'
  adjustment_pct: number
  confidence: 'high' | 'medium' | 'low'
  reason: string
  expected_impact_usd: number
  status: 'proposed' | 'approved'
}

export type Source = {
  id: string
  name: string
  kind: string
  status: string
  freshness: string
  coverage: number
}

export type Activity = {
  id: string
  kind: string
  title: string
  detail: string
  occurred_at: string
}

