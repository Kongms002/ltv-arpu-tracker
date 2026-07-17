import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { approveRecommendation, loadWorkspace, type WorkspaceData } from './api'
import type { Activity, Cohort, Dashboard, Recommendation, Source } from './types'

type View = 'overview' | 'cohorts' | 'automation' | 'sources' | 'activity'
type IconName = View | 'spark' | 'sync' | 'arrow' | 'shield' | 'close' | 'check' | 'chevron' | 'pulse'

const navItems: Array<{ id: View; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'cohorts', label: 'Cohorts' },
  { id: 'automation', label: 'Automation' },
  { id: 'sources', label: 'Data sources' },
  { id: 'activity', label: 'Activity' },
]

const iconPaths: Record<IconName, ReactNode> = {
  overview: <><path d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-13h6V4h-6v3Z" /></>,
  cohorts: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  automation: <><path d="m13 2-1.8 5.4a2 2 0 0 1-1.27 1.27L4.5 10.5l5.43 1.81a2 2 0 0 1 1.27 1.27L13 19l1.8-5.42a2 2 0 0 1 1.27-1.27l5.43-1.81-5.43-1.83a2 2 0 0 1-1.27-1.27L13 2Z" /><path d="M5 3v4M3 5h4M19 17v4M17 19h4" /></>,
  sources: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" /></>,
  activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
  spark: <><path d="m12 3-1.4 4.2a2 2 0 0 1-1.3 1.3L5 10l4.3 1.5a2 2 0 0 1 1.3 1.3L12 17l1.4-4.2a2 2 0 0 1 1.3-1.3L19 10l-4.3-1.5a2 2 0 0 1-1.3-1.3L12 3Z" /></>,
  sync: <><path d="M20 7h-5V2M4 17h5v5" /><path d="M5.1 9A8 8 0 0 1 18.7 5.3L20 7M4 17l1.3 1.7A8 8 0 0 0 18.9 15" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  pulse: <><path d="M3 12h4l2-5 4 10 2-5h6" /></>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  )
}

const currency = (value: number, digits = 0) => `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
const percent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`

function Delta({ value }: { value: number }) {
  const positive = value >= 0
  return <span className={`delta ${positive ? 'positive' : 'negative'}`}>{positive ? '↗' : '↘'} {Math.abs(value).toFixed(1)}%</span>
}

function MetricCard({ label, value, delta, detail, featured = false }: { label: string; value: string; delta: number; detail: string; featured?: boolean }) {
  return (
    <article className={`metric-card ${featured ? 'featured' : ''}`}>
      <div className="metric-label"><span>{label}</span><span className="info-dot" title={detail}>i</span></div>
      <div className="metric-value-row"><strong>{value}</strong><Delta value={delta} /></div>
      <p>{detail}</p>
    </article>
  )
}

function TrendChart({ dashboard }: { dashboard: Dashboard }) {
  const points = dashboard.series
  const max = Math.max(...points.flatMap((point) => [point.revenue, point.spend]), 1) * 1.12
  const toPath = (key: 'revenue' | 'spend') => points.map((point, index) => {
    const x = 18 + (index / Math.max(points.length - 1, 1)) * 664
    const y = 198 - (point[key] / max) * 158
    return `${index ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const areaPath = `${toPath('revenue')} L 682 198 L 18 198 Z`

  return (
    <div className="chart-wrap" role="img" aria-label="Revenue and ad spend trend over 28 days">
      <div className="chart-header">
        <div>
          <span className="eyebrow">Growth signal</span>
          <h2>Revenue is catching spend</h2>
          <p>Attributed revenue and acquisition spend, daily</p>
        </div>
        <div className="chart-legend"><span><i className="legend-revenue" />Revenue</span><span><i className="legend-spend" />Ad spend</span></div>
      </div>
      <svg viewBox="0 0 700 220" className="trend-chart" preserveAspectRatio="none">
        {[40, 92, 145, 198].map((y) => <line key={y} x1="18" y1={y} x2="682" y2={y} className="grid-line" />)}
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6c5ce7" stopOpacity=".23" /><stop offset="1" stopColor="#6c5ce7" stopOpacity="0" /></linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaFill)" />
        <path d={toPath('revenue')} className="line revenue-line" />
        <path d={toPath('spend')} className="line spend-line" />
      </svg>
      <div className="chart-axis"><span>{points[0]?.date.slice(5)}</span><span>{points[Math.floor(points.length / 2)]?.date.slice(5)}</span><span>{points.at(-1)?.date.slice(5)}</span></div>
    </div>
  )
}

function ActionBadge({ action }: { action: Recommendation['action'] }) {
  return <span className={`action-badge ${action}`}><span className="status-dot" />{action}</span>
}

function CampaignTable({ cohorts }: { cohorts: Cohort[] }) {
  return (
    <div className="table-card">
      <div className="section-heading"><div><span className="eyebrow">Cohort evidence</span><h2>Campaign performance</h2></div><button className="text-button">View all cohorts <Icon name="arrow" size={15} /></button></div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Campaign</th><th>Installs</th><th>ARPU</th><th>LTV90</th><th>CAC</th><th>ROAS</th><th>D7 retention</th></tr></thead>
          <tbody>{cohorts.map((row) => (
            <tr key={row.id}>
              <td><div className="campaign-name"><span className={`network-mark ${row.id.split('-')[0]}`}>{row.network.charAt(0)}</span><span><strong>{row.name}</strong><small>{row.network}</small></span></div></td>
              <td>{row.installs.toLocaleString()}</td><td>{currency(row.arpu, 2)}</td><td className="strong-cell">{currency(row.projected_ltv90, 2)}</td><td>{currency(row.cac, 2)}</td><td><span className={row.roas >= 1 ? 'value-good' : row.roas < .75 ? 'value-bad' : ''}>{row.roas.toFixed(2)}×</span></td><td>{percent(row.d7_retention)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}

function RecommendationCard({ item, campaign, onReview, compact = false }: { item: Recommendation; campaign?: Cohort; onReview: (item: Recommendation) => void; compact?: boolean }) {
  const disabled = item.status === 'approved' || item.action === 'hold'
  const budgetMove = item.action === 'pause' ? 'Pause' : `${item.adjustment_pct > 0 ? '+' : ''}${item.adjustment_pct}%`
  return (
    <article className={`recommendation-card ${compact ? 'compact' : ''}`}>
      <div className="recommendation-top"><ActionBadge action={item.action} /><span className={`confidence ${item.confidence}`}>{item.confidence} confidence</span></div>
      <h3>{campaign?.name ?? item.campaign_id}</h3>
      <p>{item.reason}</p>
      <div className="recommendation-stats">
        <span><small>Budget move</small><strong>{budgetMove}</strong></span>
        <span><small>30-day impact</small><strong>{item.expected_impact_usd ? currency(item.expected_impact_usd) : 'Observe'}</strong></span>
      </div>
      <button className={`action-button ${disabled ? 'disabled' : ''}`} disabled={disabled} onClick={() => onReview(item)}>
        {item.status === 'approved' ? <><Icon name="check" size={16} /> Applied</> : item.action === 'hold' ? 'Monitoring' : <>Review & apply <Icon name="chevron" size={16} /></>}
      </button>
    </article>
  )
}

function Overview({ data, campaignFilter, onReview }: { data: WorkspaceData; campaignFilter: string; onReview: (item: Recommendation) => void }) {
  const cohorts = campaignFilter === 'all' ? data.cohorts : data.cohorts.filter((item) => item.id === campaignFilter)
  const lead = data.recommendations.find((item) => item.action === 'scale') ?? data.recommendations[0]
  const leadCampaign = data.cohorts.find((item) => item.id === lead?.campaign_id)
  const { dashboard } = data
  return (
    <>
      <section className="hero-strip">
        <div className="health-icon"><Icon name="pulse" size={24} /></div>
        <div><span className="eyebrow">Today’s growth brief</span><h1>Your best cohort can absorb more budget.</h1><p><strong>{leadCampaign?.name ?? 'Top campaign'}</strong> shows an observed ARPU lift with healthy retention. GrossHacker recommends a guarded scale action.</p></div>
        {lead && <button className="hero-action" onClick={() => onReview(lead)}>Review action <Icon name="arrow" /></button>}
      </section>

      <section className="metrics-grid">
        <MetricCard label="Attributed revenue" value={currency(dashboard.metrics.revenue)} delta={dashboard.deltas.revenue} detail="Revenue tied to acquired users" />
        <MetricCard label="Cohort ARPU" value={currency(dashboard.metrics.arpu, 2)} delta={dashboard.deltas.arpu} detail="Cumulative revenue ÷ attributed installs" featured />
        <MetricCard label="Projected LTV90" value={currency(dashboard.metrics.projected_ltv90, 2)} delta={dashboard.deltas.projected_ltv90} detail="Observed revenue plus conservative forecast" />
        <MetricCard label="Blended ROAS" value={`${dashboard.metrics.roas.toFixed(2)}×`} delta={dashboard.deltas.roas} detail="Attributed revenue ÷ ad spend" />
      </section>

      <section className="overview-grid">
        <TrendChart dashboard={dashboard} />
        {lead && <RecommendationCard item={lead} campaign={leadCampaign} onReview={onReview} compact />}
      </section>
      <CampaignTable cohorts={cohorts} />
    </>
  )
}

function CohortsPage({ cohorts }: { cohorts: Cohort[] }) {
  return (
    <section>
      <div className="page-intro"><span className="eyebrow">Acquisition intelligence</span><h1>Cohorts, not vanity averages.</h1><p>Compare revenue quality against the cost of each acquired user. Lift is observational until validated with an experiment.</p></div>
      <div className="cohort-summary">
        <div><span>Best LTV:CAC</span><strong>{Math.max(...cohorts.map((item) => item.ltv_cac)).toFixed(2)}×</strong><small>Pixel Quest · Meta Ads</small></div>
        <div><span>Average coverage</span><strong>{percent(cohorts.reduce((sum, item) => sum + item.attribution_coverage, 0) / cohorts.length)}</strong><small>Healthy for recommendations</small></div>
        <div><span>Observed users</span><strong>{cohorts.reduce((sum, item) => sum + item.installs, 0).toLocaleString()}</strong><small>Across active cohorts</small></div>
      </div>
      <CampaignTable cohorts={cohorts} />
      <div className="formula-note"><Icon name="spark" /><div><strong>Metric contract</strong><p>Cohort ARPU = cumulative attributed cohort revenue ÷ attributed installs. Projected LTV90 is a forecast, not realized revenue.</p></div></div>
    </section>
  )
}

function AutomationPage({ recommendations, cohorts, onReview }: { recommendations: Recommendation[]; cohorts: Cohort[]; onReview: (item: Recommendation) => void }) {
  return (
    <section>
      <div className="page-intro split-intro"><div><span className="eyebrow">Automation center</span><h1>From signal to safe action.</h1><p>GrossHacker turns mobile revenue and retention signals into explainable ad-side actions—then applies guardrails before any budget moves.</p></div><div className="automation-mode"><span className="live-dot" /> Approval mode <strong>ON</strong></div></div>
      <div className="workflow-strip" aria-label="Automation workflow">
        <div><span>01</span><Icon name="sources" /><strong>Ingest</strong><small>GA4 · PostHog · spend</small></div><Icon name="chevron" />
        <div><span>02</span><Icon name="pulse" /><strong>Analyze</strong><small>ARPU · LTV · ROAS</small></div><Icon name="chevron" />
        <div><span>03</span><Icon name="shield" /><strong>Guardrail</strong><small>Confidence · budget caps</small></div><Icon name="chevron" />
        <div><span>04</span><Icon name="automation" /><strong>Activate</strong><small>Meta · Google · AppLovin</small></div>
      </div>
      <div className="automation-layout">
        <div className="recommendation-list">
          <div className="section-heading"><div><span className="eyebrow">Decision queue</span><h2>{recommendations.filter((item) => item.status !== 'approved' && item.action !== 'hold').length} recommendations to review</h2></div></div>
          {recommendations.map((item) => <RecommendationCard key={item.id} item={item} campaign={cohorts.find((campaign) => campaign.id === item.campaign_id)} onReview={onReview} />)}
        </div>
        <aside className="guardrail-panel">
          <div className="guardrail-icon"><Icon name="shield" size={24} /></div>
          <span className="eyebrow">Operator guardrails</span><h2>Autopilot, with brakes.</h2>
          <ul>
            <li><Icon name="check" /> Human approval by default</li>
            <li><Icon name="check" /> Budget adjustments capped at ±20%</li>
            <li><Icon name="check" /> 24-hour action cooldown</li>
            <li><Icon name="check" /> Sample and coverage checks</li>
            <li><Icon name="check" /> Every action is auditable</li>
          </ul>
          <div className="connector-ready"><span>Connector-ready</span><strong>Webhook + REST action adapters</strong><small>Production writes require platform OAuth.</small></div>
        </aside>
      </div>
    </section>
  )
}

function SourcesPage({ sources }: { sources: Source[] }) {
  return (
    <section>
      <div className="page-intro"><span className="eyebrow">Data foundation</span><h1>One clean growth signal.</h1><p>Normalize product events and ad spend into a shared attribution model before calculating unit economics.</p></div>
      <div className="source-grid">
        {sources.map((source) => <article className="source-card" key={source.id}>
          <div className={`source-logo ${source.id}`}>{source.name.charAt(0)}</div>
          <div className="source-main"><div><span className="source-status"><i />{source.status}</span><h2>{source.name}</h2><p>{source.kind}</p></div><button aria-label={`Configure ${source.name}`}>•••</button></div>
          <div className="coverage-bar"><span style={{ width: `${source.coverage * 100}%` }} /></div>
          <div className="source-meta"><span><small>Coverage</small><strong>{percent(source.coverage)}</strong></span><span><small>Freshness</small><strong>{source.freshness}</strong></span></div>
        </article>)}
        <article className="source-card add-source"><div className="plus">+</div><h2>Add a connector</h2><p>Bring your attribution provider or ad network.</p><button className="secondary-button">Browse connectors</button></article>
      </div>
      <div className="sdk-card"><div><span className="eyebrow">React Native instrumentation</span><h2>Ship one normalized event contract.</h2><p>Forward purchase, subscription, session, and attribution events from the mobile app. The FastAPI ingestion endpoint is idempotent by event ID.</p></div><pre><code>{`trackGrowthEvent({\n  event_type: 'purchase',\n  value_usd: 4.99,\n  campaign_id: attribution.campaignId\n})`}</code></pre></div>
    </section>
  )
}

function ActivityPage({ activity }: { activity: Activity[] }) {
  return (
    <section>
      <div className="page-intro"><span className="eyebrow">Audit trail</span><h1>Every insight. Every action.</h1><p>A clear record of data syncs, model decisions, guardrail checks, and operator approvals.</p></div>
      <div className="activity-list">
        {activity.map((item, index) => <article key={item.id} className="activity-item">
          <div className={`activity-icon ${item.kind}`}><Icon name={item.kind === 'action' ? 'automation' : item.kind === 'sync' ? 'sync' : item.kind === 'guardrail' ? 'shield' : 'pulse'} /></div>
          <div><div className="activity-title"><h3>{item.title}</h3><time>{index === 0 ? 'Just now' : `${index}h ago`}</time></div><p>{item.detail}</p></div>
        </article>)}
      </div>
    </section>
  )
}

function ReviewModal({ recommendation, campaign, onClose, onApprove }: { recommendation: Recommendation; campaign?: Cohort; onClose: () => void; onApprove: () => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className="modal-mark"><Icon name="spark" size={28} /></div>
        <span className="eyebrow">Review automation</span><h2 id="review-title">{recommendation.action === 'scale' ? 'Scale a winning cohort' : recommendation.action === 'pause' ? 'Pause and protect spend' : 'Reduce inefficient spend'}</h2>
        <p className="modal-lead">{recommendation.reason}</p>
        <div className="review-campaign"><div><small>Campaign</small><strong>{campaign?.name}</strong><span>{campaign?.network}</span></div><ActionBadge action={recommendation.action} /></div>
        <div className="review-grid"><div><small>Current daily budget</small><strong>{currency(campaign?.daily_budget ?? 0)}</strong></div><div><small>Proposed change</small><strong className={recommendation.adjustment_pct > 0 ? 'value-good' : 'value-bad'}>{recommendation.action === 'pause' ? 'Pause' : `${recommendation.adjustment_pct > 0 ? '+' : ''}${recommendation.adjustment_pct}%`}</strong></div><div><small>Projected LTV:CAC</small><strong>{campaign?.ltv_cac.toFixed(2)}×</strong></div><div><small>Confidence</small><strong>{recommendation.confidence}</strong></div></div>
        <div className="safety-note"><Icon name="shield" /><p><strong>Safe demo execution</strong><br />This updates the simulated campaign budget and audit trail. No real ad account will be charged.</p></div>
        <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy} onClick={async () => { setBusy(true); await onApprove(); setBusy(false) }}>{busy ? 'Applying…' : 'Approve simulated action'}</button></div>
      </div>
    </div>
  )
}

function LoadingState() {
  return <div className="loading-state"><div className="loader-mark"><Icon name="spark" size={30} /></div><strong>Connecting your growth signals…</strong><span>Normalizing events, spend, and attribution</span></div>
}

export default function App() {
  const [view, setView] = useState<View>('overview')
  const [data, setData] = useState<WorkspaceData | null>(null)
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [review, setReview] = useState<Recommendation | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => { loadWorkspace().then(setData) }, [])
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timeout) }, [toast])

  const filteredRecommendations = useMemo(() => !data || campaignFilter === 'all' ? data?.recommendations ?? [] : data.recommendations.filter((item) => item.campaign_id === campaignFilter), [data, campaignFilter])
  if (!data) return <LoadingState />

  const applyAction = async () => {
    if (!review) return
    if (!data.isDemoFallback) await approveRecommendation(review.id)
    const campaign = data.cohorts.find((item) => item.id === review.campaign_id)
    setData((current) => current ? {
      ...current,
      recommendations: current.recommendations.map((item) => item.id === review.id ? { ...item, status: 'approved' } : item),
      cohorts: current.cohorts.map((item) => item.id === review.campaign_id ? { ...item, daily_budget: review.action === 'pause' ? 0 : Math.max(20, item.daily_budget * (1 + review.adjustment_pct / 100)), status: review.action === 'pause' ? 'paused' : item.status } : item),
      activity: [{ id: `local-${Date.now()}`, kind: 'action', title: `${review.action[0].toUpperCase()}${review.action.slice(1)} approved for ${campaign?.name}`, detail: `Demo operator applied a simulated ${review.adjustment_pct > 0 ? '+' : ''}${review.adjustment_pct}% budget change.`, occurred_at: new Date().toISOString() }, ...current.activity],
    } : current)
    setReview(null)
    setToast('Simulated budget action applied and logged.')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView('overview')}><span className="brand-mark"><Icon name="spark" size={21} /></span><span><strong>GrossHacker</strong><small>AI growth operator</small></span></button>
        <nav aria-label="Primary navigation">{navItems.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><Icon name={item.id} /><span>{item.label}</span>{item.id === 'automation' && <i className="nav-count">{data.recommendations.filter((recommendation) => recommendation.status === 'proposed' && recommendation.action !== 'hold').length}</i>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="health-pill"><span className="live-dot" /><div><strong>Data health</strong><small>{percent(data.dashboard.data_health.attribution_coverage)} attributed</small></div></div><button className="workspace"><span>MK</span><div><strong>Minsoo’s Studio</strong><small>Hackathon workspace</small></div><Icon name="chevron" size={15} /></button></div>
      </aside>

      <main>
        <header className="topbar">
          <div><span className="mobile-brand"><Icon name="spark" /> GrossHacker</span><h2>{navItems.find((item) => item.id === view)?.label}</h2></div>
          <div className="topbar-actions">
            {data.isDemoFallback && <span className="demo-pill">Sample data</span>}
            <label className="select-wrap"><span className="sr-only">Campaign filter</span><select value={campaignFilter} onChange={(event) => setCampaignFilter(event.target.value)}><option value="all">All campaigns</option>{data.cohorts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Icon name="chevron" size={14} /></label>
            <label className="select-wrap range-select"><span className="sr-only">Date range</span><select defaultValue="14"><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="28">Last 28 days</option></select><Icon name="chevron" size={14} /></label>
            <button className="sync-button" title="Data is synchronized"><Icon name="sync" /><span>Synced {data.dashboard.data_health.last_sync_minutes}m ago</span></button>
          </div>
        </header>
        <div className="content">
          {view === 'overview' && <Overview data={data} campaignFilter={campaignFilter} onReview={setReview} />}
          {view === 'cohorts' && <CohortsPage cohorts={campaignFilter === 'all' ? data.cohorts : data.cohorts.filter((item) => item.id === campaignFilter)} />}
          {view === 'automation' && <AutomationPage recommendations={filteredRecommendations} cohorts={data.cohorts} onReview={setReview} />}
          {view === 'sources' && <SourcesPage sources={data.sources} />}
          {view === 'activity' && <ActivityPage activity={data.activity} />}
        </div>
      </main>
      {review && <ReviewModal recommendation={review} campaign={data.cohorts.find((item) => item.id === review.campaign_id)} onClose={() => setReview(null)} onApprove={applyAction} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status"><Icon name="check" />{toast}</div>
    </div>
  )
}
