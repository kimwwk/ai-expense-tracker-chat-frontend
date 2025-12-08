/**
 * Analytics API client
 */

import { apiClient } from "./client"

export interface AnalyticsSummaryResponse {
  total: number
  count: number
}

export interface AnalyticsBreakdownResponse {
  labels: string[]
  values: number[]
}

export interface AnalyticsTrendResponse {
  dates: string[]
  values: number[]
}

export interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  transaction_type?: "expense" | "income"
  category_id?: number
  account_id?: number
  payee_id?: number
}

export interface BreakdownFilters extends AnalyticsFilters {
  dimension: "category" | "payee" | "account"
  metric?: "sum" | "count"
}

export interface TrendFilters extends AnalyticsFilters {
  time_grain: "day" | "week" | "month"
}

/**
 * Get summary statistics for filtered transactions
 */
export async function getSummary(filters?: AnalyticsFilters): Promise<AnalyticsSummaryResponse> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/analytics/summary?${queryString}` : "/analytics/summary"

  return apiClient<AnalyticsSummaryResponse>(endpoint)
}

/**
 * Get breakdown of transactions by dimension (category, payee, or account)
 */
export async function getBreakdown(filters: BreakdownFilters): Promise<AnalyticsBreakdownResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const queryString = params.toString()
  const endpoint = `/analytics/breakdown?${queryString}`

  return apiClient<AnalyticsBreakdownResponse>(endpoint)
}

/**
 * Get time series trend of transactions
 */
export async function getTrend(filters: TrendFilters): Promise<AnalyticsTrendResponse> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })

  const queryString = params.toString()
  const endpoint = `/analytics/trend?${queryString}`

  return apiClient<AnalyticsTrendResponse>(endpoint)
}
