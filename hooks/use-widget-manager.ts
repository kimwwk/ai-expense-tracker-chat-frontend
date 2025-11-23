"use client"

import { useState, useEffect } from "react"
import type { Message } from "ai"
import type { Widget } from "@/types/widget"

export function useWidgetManager(messages: Message[]) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    // Scan messages for tool invocations that have results
    const newWidgets: Widget[] = []

    // Reverse iterate to find latest tool calls, but we want to accumulate all unique ones
    messages.forEach((m) => {
      if (m.role === "assistant" && m.toolInvocations) {
        m.toolInvocations.forEach((tool) => {
          if ("result" in tool && tool.result) {
            // Map tool names to widget types
            let widgetType: Widget["type"] | null = null
            let title = "Widget"

            switch (tool.toolName) {
              case "getExpenses":
                widgetType = "expense-list"
                title = "Expenses"
                break
              case "analyzeSpending":
                widgetType = "spending-analysis"
                title = `Analysis: ${tool.args.category || "General"}`
                break
              case "getSpendingSummary":
                widgetType = "summary-chart"
                title = "Summary"
                break
              // Add more mappings as needed
            }

            if (widgetType) {
              // Check if we already have this specific widget (deduplication based on toolCallId)
              const existingIndex = newWidgets.findIndex((w) => w.id === tool.toolCallId)

              if (existingIndex === -1) {
                newWidgets.push({
                  id: tool.toolCallId,
                  type: widgetType,
                  title,
                  data: tool.result,
                  timestamp: Date.now(), // You might want to use message createdAt if available
                })
              }
            }
          }
        })
      }
    })

    // If new widgets were found, update state
    // We only update if the length changed or IDs changed to avoid loops,
    // but React's set state is smart enough usually.
    // For this demo, let's just set it if count matches.
    // Ideally we merge with existing to preserve local state if widgets were interactive.
    if (newWidgets.length > 0) {
      setWidgets(newWidgets)

      // Auto-switch to the newest widget if it's new
      const lastWidget = newWidgets[newWidgets.length - 1]
      // Only switch if we just added it (in a real app you'd compare vs previous ref)
    }
  }, [messages])

  const clearWidgets = () => {
    setWidgets([])
    setActiveTab("overview")
  }

  return {
    widgets,
    activeTab,
    setActiveTab,
    clearWidgets,
  }
}
