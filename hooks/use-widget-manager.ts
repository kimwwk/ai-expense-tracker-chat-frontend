"use client"

import { useState, useEffect } from "react"
import type { UIMessage } from "ai"
import type { Widget } from "@/types/widget"
import { getWidgetConfig } from "@/lib/widgets/widget-registry"

export function useWidgetManager(messages: UIMessage[]) {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [activeTab, setActiveTab] = useState<string>("")

  useEffect(() => {
    // Scan messages for tool invocations that have results
    const newWidgets: Widget[] = []
    let latestWidgetType: string | null = null

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

          // Look up widget configuration from registry
          const config = getWidgetConfig(toolName, tool.args)

          // Skip tools that don't have widget mappings
          if (!config) {
            return
          }

          const { widgetType, title, metadata } = config

          // Check if we already have this specific widget (deduplication based on toolCallId)
          const existingIndex = newWidgets.findIndex((w) => w.id === tool.toolCallId)

          if (existingIndex === -1) {
            const newWidget = {
              id: tool.toolCallId,
              type: widgetType,
              title,
              data: tool.output || tool.result, // Support both output and result properties
              timestamp: Date.now(), // You might want to use message createdAt if available
            }
            newWidgets.push(newWidget)

            // Track the latest widget type for auto-focus
            // Only auto-focus if metadata says autoFocus is true
            if (metadata?.autoFocus !== false) {
              latestWidgetType = widgetType
            }
          }
        })
      }
    })

    // If new widgets were found, update state
    if (newWidgets.length > 0) {
      setWidgets(newWidgets)

      // Auto-focus to the latest widget type if it's new
      if (latestWidgetType) {
        setActiveTab(latestWidgetType)
      }
    }
  }, [messages])

  const clearWidgets = () => {
    setWidgets([])
    setActiveTab("")
  }

  return {
    widgets,
    activeTab,
    setActiveTab,
    clearWidgets,
  }
}
