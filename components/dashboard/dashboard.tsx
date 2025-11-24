"use client"

import type { Widget } from "@/types/widget"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionListWidget } from "@/components/widgets/transaction-list-widget"
import { SpendingAnalysisWidget } from "@/components/widgets/spending-analysis-widget"
import { SummaryChartWidget } from "@/components/widgets/summary-chart-widget"
import { LayoutDashboard, Activity } from "lucide-react"

interface DashboardProps {
  widgets: Widget[]
  activeTab: string
  onTabChange: (value: string) => void
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

  // Group widgets by type or just list them as tabs?
  // The user asked for "tabs for each widget".
  // If we have many tool calls, we might have too many tabs.
  // Let's create specific tabs for specific VIEWS, and put the latest widget of that type in there.

  // Strategy:
  // 1. "Overview" tab (always present if data exists) - Shows Summary Chart
  // 2. "Transactions" tab - Shows latest Transaction List
  // 3. "Analysis" tab - Shows latest Analysis
  // 4. "History" - List of all widgets?

  // Let's go with the user's "tabs for each widget" but simplified:
  // We will map available widget types to tabs.

  const hasTransactions = widgets.some((w) => w.type === "transaction-list")
  const hasAnalysis = widgets.some((w) => w.type === "spending-analysis")
  const hasSummary = widgets.some((w) => w.type === "summary-chart")

  // Find latest data for each
  const latestTransactions = widgets.filter((w) => w.type === "transaction-list").pop()
  const latestAnalysis = widgets.filter((w) => w.type === "spending-analysis").pop()
  const latestSummary = widgets.filter((w) => w.type === "summary-chart").pop()

  return (
    <div className="h-full flex flex-col border-l bg-muted/10">
      <div className="p-4 border-b bg-background">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Live Dashboard
        </h2>
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" disabled={!hasSummary && !hasTransactions && !hasAnalysis}>
              Overview
            </TabsTrigger>
            <TabsTrigger value="transactions" disabled={!hasTransactions}>
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!hasAnalysis}>
              Analysis
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto rounded-lg border bg-background shadow-sm">
            {/* Fallback for empty tabs if selected manually */}
            {!hasSummary && !hasTransactions && !hasAnalysis && (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data loaded yet</div>
            )}

            <TabsContent value="overview" className="h-full m-0 p-0">
              {latestSummary ? (
                <SummaryChartWidget data={latestSummary.data} />
              ) : latestTransactions ? (
                <TransactionListWidget data={latestTransactions.data} />
              ) : latestAnalysis ? (
                <SpendingAnalysisWidget data={latestAnalysis.data} />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Ask for a summary to see the overview chart.
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="h-full m-0 p-0">
              {latestTransactions ? (
                <TransactionListWidget data={latestTransactions.data} />
              ) : (
                <div className="p-8 text-center text-muted-foreground">No transaction lists loaded.</div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="h-full m-0 p-0">
              {latestAnalysis ? (
                <div className="p-6">
                  <SpendingAnalysisWidget data={latestAnalysis.data} />
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">No analysis loaded.</div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
