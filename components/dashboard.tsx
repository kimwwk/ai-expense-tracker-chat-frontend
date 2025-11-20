"use client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WidgetRenderer } from "@/components/widget-renderer"
import type { WidgetData } from "@/types/widget"

interface DashboardProps {
  widgets: WidgetData[]
}

export function Dashboard({ widgets }: DashboardProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">Live Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time insights from your expense data</p>
      </div>

      {/* Widgets */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 py-6">
          {widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="rounded-full bg-muted p-4">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground">No data yet</h3>
                <p className="text-sm text-muted-foreground">Ask a question to see insights appear here</p>
              </div>
            </div>
          )}

          {widgets.map((widget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
