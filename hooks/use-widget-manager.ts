"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import type { UIMessage } from "ai"
import type { Widget } from "@/types/widget"
import { getWidgetConfig } from "@/lib/widgets/widget-registry"
import {
  processMessagesForWidgets,
  type CreateWidgetInput,
} from "@/lib/widgets/message-processor"

/**
 * Widget Manager Hook - Manages widget state with both reactive and imperative patterns.
 *
 * This hook provides a hybrid approach to widget management:
 * - **Reactive**: Automatically processes messages and creates widgets for server-side tools
 * - **Imperative**: Provides addWidget() API for client-side tools to create widgets manually
 *
 * @param messages - Array of UIMessage from @ai-sdk/react useChat hook
 * @returns Widget manager API with state and control methods
 *
 * @example
 * ```typescript
 * const { widgets, addWidget, activeTab, setActiveTab } = useWidgetManager(messages)
 *
 * // Client-side tool can create widget imperatively
 * addWidget({
 *   id: toolCallId,
 *   toolName: "confirmChangeSet",
 *   data: null,
 *   autoFocus: true
 * })
 * ```
 */
export function useWidgetManager(messages: UIMessage[]) {
  // Internal state: Map for O(1) lookups and efficient deduplication
  const [widgetMap, setWidgetMap] = useState<Map<string, Widget>>(new Map())
  const [activeTab, setActiveTab] = useState<string>("")

  // Use a ref to track the latest widgetMap without causing re-renders
  const widgetMapRef = useRef(widgetMap)
  useEffect(() => {
    widgetMapRef.current = widgetMap
  }, [widgetMap])

  // Derived state: Array for backward compatibility with consumers
  // Sorted by timestamp to maintain consistent order
  const widgets = useMemo(
    () =>
      Array.from(widgetMap.values()).sort((a, b) => a.timestamp - b.timestamp),
    [widgetMap]
  )

  /**
   * Add a widget imperatively.
   *
   * Creates a new widget if one with the given ID doesn't exist.
   * Uses the widget registry to look up configuration and create the widget.
   *
   * @param input - Widget creation parameters
   * @returns The widget ID (same as input.id)
   *
   * @example
   * ```typescript
   * // Create widget before tool output exists (client-side tool pattern)
   * addWidget({
   *   id: toolCall.toolCallId,
   *   toolName: "confirmChangeSet",
   *   toolArgs: toolCall.input,
   *   data: null,
   *   autoFocus: true
   * })
   * ```
   */
  const addWidget = useCallback((input: CreateWidgetInput) => {
    setWidgetMap((prev) => {
      // Check for duplicates - idempotent operation
      if (prev.has(input.id)) {
        console.log(`Widget ${input.id} already exists, skipping creation`)
        return prev
      }

      // Look up widget config from registry
      const config = getWidgetConfig(input.toolName, input.toolArgs)
      if (!config) {
        console.warn(`No widget config found for tool: ${input.toolName}`)
        return prev
      }

      // Create widget
      const widget: Widget = {
        id: input.id,
        type: config.widgetType,
        title: config.title,
        data: input.data ?? null,
        toolArgs: input.toolArgs, // Store tool arguments for filter display
        timestamp: Date.now(),
      }

      // Auto-focus if requested
      // Priority: explicit parameter > registry metadata > default (true)
      const shouldAutoFocus =
        input.autoFocus ?? config.metadata?.autoFocus ?? true
      if (shouldAutoFocus) {
        setActiveTab(config.widgetType)
      }

      // Add to map and return new map
      return new Map(prev).set(input.id, widget)
    })

    return input.id
  }, [])

  /**
   * Update an existing widget with partial data.
   *
   * Useful for updating widget data after it's been created imperatively
   * with null data, then the actual data arrives from messages.
   *
   * @param id - Widget ID (toolCallId)
   * @param updates - Partial widget data to merge
   *
   * @example
   * ```typescript
   * // Update widget data when message output arrives
   * updateWidget(toolCallId, { data: outputData })
   * ```
   */
  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgetMap((prev) => {
      const widget = prev.get(id)
      if (!widget) {
        console.warn(`Widget ${id} not found for update`)
        return prev
      }
      const newMap = new Map(prev)
      newMap.set(id, { ...widget, ...updates })
      return newMap
    })
  }, [])

  /**
   * Remove a specific widget by ID.
   *
   * @param id - Widget ID (toolCallId)
   */
  const removeWidget = useCallback((id: string) => {
    setWidgetMap((prev) => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
  }, [])

  /**
   * Clear all widgets and reset active tab.
   *
   * Typically called when starting a new chat session.
   */
  const clearWidgets = useCallback(() => {
    setWidgetMap(new Map())
    setActiveTab("")
  }, [])

  /**
   * Check if a widget with the given ID exists.
   *
   * Used for deduplication in both reactive and imperative flows.
   *
   * @param id - Widget ID (toolCallId)
   * @returns true if widget exists
   */
  const hasWidget = useCallback((id: string) => {
    return widgetMapRef.current.has(id)
  }, [])

  // Reactive processing: Scan messages for tool outputs
  // This maintains backward compatibility with server-side tools
  useEffect(() => {
    processMessagesForWidgets(messages, addWidget, updateWidget, hasWidget)
  }, [messages, addWidget, updateWidget, hasWidget])

  return {
    // State (read-only for consumers)
    widgets,
    activeTab,

    // Imperative API
    addWidget,
    updateWidget,
    removeWidget,
    clearWidgets,
    hasWidget,

    // UI controls
    setActiveTab,
  }
}
