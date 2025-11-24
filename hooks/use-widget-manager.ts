"use client"

import { useState, useEffect } from "react"
import type { UIMessage } from "ai"
import type { Widget } from "@/types/widget"

export function useWidgetManager(messages: UIMessage[]) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    // Scan messages for tool invocations that have results
    const newWidgets: Widget[] = []

    // Iterate through messages to find tool calls with results
    // @ai-sdk/react v2 uses parts array instead of toolInvocations
    messages.forEach((m: any) => {
      if (m.role === "assistant" && m.parts) {
        // Filter parts for tool invocations with results
        // Tool parts have typed names like "tool-getExpenses", "tool-analyzeSpending", etc.
        const toolParts = m.parts.filter(
          (part: any) =>
            part.type?.startsWith("tool-") &&
            (part.state === "output-available" || part.state === "result" || part.state === "done") &&
            (part.output || part.result)
        )

        toolParts.forEach((tool: any) => {
          // Extract tool name from typed part (e.g., "tool-getExpenses" -> "getExpenses")
          const toolName = tool.type?.startsWith("tool-") ? tool.type.substring(5) : tool.toolName

          // Map tool names to widget types
          let widgetType: Widget["type"] | null = null
          let title = "Widget"

          switch (toolName) {
            case "getTransactions":
              widgetType = "transaction-list"
              title = "Transactions"
              break
            case "analyzeSpending":
              widgetType = "spending-analysis"
              title = `Analysis: ${tool.args?.category || "General"}`
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
                data: tool.output || tool.result, // Support both output and result properties
                timestamp: Date.now(), // You might want to use message createdAt if available
              })
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
