import { demoActivity, demoCohorts, demoDashboard, demoRecommendations, demoSources } from './demoData'
import type { Activity, Cohort, Dashboard, Recommendation, Source } from './types'

const json = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.json() as Promise<T>
}

export type WorkspaceData = {
  dashboard: Dashboard
  cohorts: Cohort[]
  recommendations: Recommendation[]
  sources: Source[]
  activity: Activity[]
  isDemoFallback: boolean
}

export async function loadWorkspace(): Promise<WorkspaceData> {
  try {
    const [dashboard, cohorts, recommendations, sources, activity] = await Promise.all([
      json<Dashboard>('/api/dashboard'),
      json<{ items: Cohort[] }>('/api/cohorts'),
      json<{ items: Recommendation[] }>('/api/recommendations'),
      json<{ items: Source[] }>('/api/sources'),
      json<{ items: Activity[] }>('/api/activity'),
    ])
    return {
      dashboard,
      cohorts: cohorts.items,
      recommendations: recommendations.items,
      sources: sources.items,
      activity: activity.items,
      isDemoFallback: false,
    }
  } catch {
    return {
      dashboard: demoDashboard,
      cohorts: demoCohorts,
      recommendations: demoRecommendations,
      sources: demoSources,
      activity: demoActivity,
      isDemoFallback: true,
    }
  }
}

export async function approveRecommendation(id: string): Promise<void> {
  await json(`/api/recommendations/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approved_by: 'Demo operator' }),
  })
}
