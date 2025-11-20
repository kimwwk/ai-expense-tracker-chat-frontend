export interface WidgetData {
  id: string
  type: "get_recent_expenses" | "analyze_spending" | "get_budget_status" | "get_category_breakdown" | string
  data: any
  timestamp: number
}
