/**
 * Message processor utility for extracting widget data from AI SDK messages.
 *
 * This module provides pure functions for parsing messages and extracting
 * tool results that should be displayed as widgets. It decouples the widget
 * manager from the AI SDK message structure.
 */

import { getWidgetConfig } from "./widget-registry"
import { getCategories } from "@/lib/api/categories"

/**
 * Extracted widget data from a message part.
 * This is a normalized representation of tool results.
 */
export interface ExtractedWidgetData {
  toolCallId: string
  toolName: string
  toolArgs: any
  data: any
  timestamp?: number
}

/**
 * Input type for creating a widget imperatively.
 * Used by both message processor and direct addWidget calls.
 */
export interface CreateWidgetInput {
  id: string            // toolCallId for deduplication
  toolName: string      // for registry lookup
  toolArgs?: any        // for dynamic title generation
  data?: any            // optional initial data
  autoFocus?: boolean   // override registry default
}

/**
 * Extract widget data from AI SDK messages.
 *
 * This is a pure function that scans messages for tool parts with outputs
 * and returns normalized widget data. It does not create widgets or have
 * any side effects.
 *
 * @param messages - Array of UIMessage from @ai-sdk/react
 * @returns Array of extracted widget data
 *
 * @example
 * ```typescript
 * const extracted = extractWidgetsFromMessages(messages)
 * extracted.forEach(widget => {
 *   console.log(`Tool ${widget.toolName} returned:`, widget.data)
 * })
 * ```
 */
export function extractWidgetsFromMessages(
  messages: any[]
): ExtractedWidgetData[] {
  const extracted: ExtractedWidgetData[] = []

  messages.forEach((message) => {
    // Only process assistant messages with parts
    if (message.role !== "assistant" || !message.parts) {
      return
    }

    // Filter for tool parts with outputs available
    const toolParts = message.parts.filter(
      (part: any) =>
        part.type?.startsWith("tool-") &&
        (part.state === "output-available" ||
          part.state === "result" ||
          part.state === "done") &&
        (part.output || part.result)
    )

    toolParts.forEach((part: any) => {
      // Extract tool name from part.type (e.g., "tool-getTransactions" → "getTransactions")
      const toolName = part.type?.startsWith("tool-")
        ? part.type.substring(5)
        : part.toolName

      if (!toolName) {
        console.warn("Tool part missing name:", part)
        return
      }

      extracted.push({
        toolCallId: part.toolCallId,
        toolName,
        toolArgs: part.input || part.args,
        data: part.output || part.result,
        timestamp: message.createdAt,
      })
    })
  })

  return extracted
}

/**
 * Enrich transaction data with category information.
 *
 * @param data - Widget data (can be single transaction list or paginated response)
 * @returns Enriched data with category_name and category_color added to transactions
 */
async function enrichTransactionData(data: any): Promise<any> {
  if (!data) return data

  // Extract transactions array (handle both formats)
  let transactions = Array.isArray(data) ? data : data.data
  if (!transactions || !Array.isArray(transactions)) return data

  // Get all categories
  try {
    const categoriesResponse = await getCategories({ limit: 200 })
    const categories = categoriesResponse.data

    // Create a lookup map
    const categoryMap = new Map(
      categories.map((cat) => [
        cat.category_id,
        { name: cat.category_name, color: cat.color_code },
      ])
    )

    // Enrich transactions
    const enriched = transactions.map((tx) => {
      if (tx.category_id && categoryMap.has(tx.category_id)) {
        const catInfo = categoryMap.get(tx.category_id)!
        return {
          ...tx,
          category_name: catInfo.name,
          category_color: catInfo.color,
        }
      }
      return tx
    })

    // Return in same format as input
    return Array.isArray(data) ? enriched : { ...data, data: enriched }
  } catch (error) {
    console.error("Failed to enrich transaction data:", error)
    return data
  }
}

/**
 * Process messages and create/update widgets using the imperative API.
 *
 * This function bridges the reactive (messages) and imperative (addWidget)
 * patterns. It extracts widget data from messages and creates widgets that
 * don't already exist, or updates existing widgets with new data.
 *
 * @param messages - Array of UIMessage from @ai-sdk/react
 * @param addWidget - Function to create a widget imperatively
 * @param updateWidget - Function to update an existing widget
 * @param hasWidget - Function to check if widget exists
 *
 * @example
 * ```typescript
 * useEffect(() => {
 *   processMessagesForWidgets(messages, addWidget, updateWidget, hasWidget)
 * }, [messages, addWidget, updateWidget, hasWidget])
 * ```
 */
export function processMessagesForWidgets(
  messages: any[],
  addWidget: (input: CreateWidgetInput) => string,
  updateWidget: (id: string, updates: any) => void,
  hasWidget: (id: string) => boolean
): void {
  const extracted = extractWidgetsFromMessages(messages)

  extracted.forEach(async (widgetData) => {
    // Check if widget already exists
    const exists = hasWidget(widgetData.toolCallId)

    // Check if tool is registered in widget registry
    const config = getWidgetConfig(widgetData.toolName, widgetData.toolArgs)
    if (!config) {
      // Tool not registered for widgets, skip
      return
    }

    // Enrich transaction data with category names if this is a transaction widget
    let enrichedData = widgetData.data
    if (widgetData.toolName === "getTransactions" && widgetData.data) {
      enrichedData = await enrichTransactionData(widgetData.data)
    }

    if (exists) {
      // Widget exists - update it with new data if it has data
      // This handles the case where widget was created imperatively with null data
      // and now the message output has arrived
      updateWidget(widgetData.toolCallId, { data: enrichedData })
    } else {
      // Widget doesn't exist - create it
      addWidget({
        id: widgetData.toolCallId,
        toolName: widgetData.toolName,
        toolArgs: widgetData.toolArgs,
        data: enrichedData,
        // Use registry default for autoFocus
      })
    }
  })
}
