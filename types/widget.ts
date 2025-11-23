export type WidgetType = "expense-list" | "spending-analysis" | "summary-chart" | "generic-json"

export interface Widget {
  id: string
  type: WidgetType
  title: string
  data: any
  timestamp: number
}
