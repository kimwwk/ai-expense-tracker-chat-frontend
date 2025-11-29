"use client"

import type { Widget, WidgetType } from "@/types/widget"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionListWidget } from "@/components/widgets/transaction-list-widget"
import { SpendingAnalysisWidget } from "@/components/widgets/spending-analysis-widget"
import { SummaryChartWidget } from "@/components/widgets/summary-chart-widget"
import { AccountListWidget } from "@/components/widgets/account-list-widget"
import { CategoryListWidget } from "@/components/widgets/category-list-widget"
import { ChangeSetWidget } from "@/components/widgets/changeset-widget"
import { LayoutDashboard, Activity, Receipt, PieChart, BarChart3, Wallet, Tag, CheckSquare } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface DashboardProps {
  widgets: Widget[]
  activeTab: string
  onTabChange: (value: string) => void
}

// Map widget types to display labels and icons
const widgetTypeMap: Record<WidgetType, { label: string; icon: LucideIcon }> = {
  "transaction-list": { label: "Transactions", icon: Receipt },
  "spending-analysis": { label: "Analysis", icon: PieChart },
  "summary-chart": { label: "Summary", icon: BarChart3 },
  "account-list": { label: "Accounts", icon: Wallet },
  "category-list": { label: "Categories", icon: Tag },
  "changeset": { label: "Changes", icon: CheckSquare },
  "generic-json": { label: "Data", icon: LayoutDashboard },
}

// Helper function to render widgets based on type
function renderWidget(widget: Widget) {
  switch (widget.type) {
    case "transaction-list":
      return <TransactionListWidget data={widget.data} toolArgs={widget.toolArgs} />
    case "spending-analysis":
      return (
        <div className="p-6">
          <SpendingAnalysisWidget data={widget.data} />
        </div>
      )
    case "summary-chart":
      return <SummaryChartWidget data={widget.data} />
    case "account-list":
      return <AccountListWidget data={widget.data} toolArgs={widget.toolArgs} />
    case "category-list":
      return <CategoryListWidget data={widget.data} toolArgs={widget.toolArgs} />
    case "changeset":
      return (
        <div className="p-6">
          <ChangeSetWidget />
        </div>
      )
    default:
      return <div className="p-8 text-muted-foreground">Unknown widget type: {widget.type}</div>
  }
}

export function Dashboard({ widgets, activeTab, onTabChange }: DashboardProps) {
  // If no widgets, show empty state
  if (widgets.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-l bg-muted/10">
        <LayoutDashboard className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium">Dashboard Empty</h3>
        <p className="text-sm text-center max-w-xs mt-2">
          Ask the AI about your transactions to see live widgets appear here.
        </p>
      </div>
    )
  }

  // Get unique widget types present in widgets array
  const availableTypes = [...new Set(widgets.map((w) => w.type))]

  // For each type, get the latest widget
  const widgetsByType = availableTypes.map((type) => ({
    type,
    widget: widgets.filter((w) => w.type === type).pop()!,
    label: widgetTypeMap[type]?.label || type,
    icon: widgetTypeMap[type]?.icon || LayoutDashboard,
  }))

  // Default to first available widget type if activeTab doesn't exist
  const defaultTab = widgetsByType[0]?.type || ""

  return (
    <div className="h-full flex flex-col border-l bg-muted/10">
      <div className="p-4 border-b bg-background">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Dashboard
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
          <TabsList className="w-full mb-4">
            {widgetsByType.map(({ type, label, icon: Icon }) => (
              <TabsTrigger key={type} value={type} className="gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto rounded-lg border bg-background shadow-sm">
            {widgetsByType.map(({ type, widget }) => (
              <TabsContent key={type} value={type} className="h-full m-0 p-0">
                {renderWidget(widget)}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
