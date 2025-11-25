/**
 * Valid widget types that can be rendered in the dashboard.
 * Add new types here when creating new widget components.
 */
export type WidgetType = "transaction-list" | "spending-analysis" | "summary-chart" | "generic-json"

/**
 * Widget instance data structure.
 * Represents a single widget displayed in the dashboard.
 */
export interface Widget {
  id: string
  type: WidgetType
  title: string
  data: any
  timestamp: number
}

/**
 * Function that generates a widget title dynamically based on tool arguments.
 *
 * @example
 * // Static title
 * const title: TitleGenerator = () => "Transactions"
 *
 * @example
 * // Dynamic title based on args
 * const title: TitleGenerator<{ category?: string }> = (args) =>
 *   `Analysis: ${args?.category || "General"}`
 *
 * @param args - The arguments passed to the tool
 * @returns The display title for the widget
 */
export type TitleGenerator<TArgs = any> = (args?: TArgs) => string

/**
 * Metadata for widget configuration.
 * These fields enable future features without breaking changes.
 */
export interface WidgetMetadata {
  /**
   * Description of what this tool does.
   * Useful for documentation and UI tooltips.
   */
  description?: string

  /**
   * Icon identifier for the widget.
   * Can be used for future UI enhancements (e.g., tab icons, widget headers).
   */
  icon?: string

  /**
   * Category for grouping related widgets.
   * Examples: "transactions", "analysis", "external-data", "schema"
   */
  category?: string

  /**
   * Whether this widget should auto-focus when the tool completes.
   * If true, the dashboard should automatically switch to show this widget.
   */
  autoFocus?: boolean
}

/**
 * Configuration for mapping a single tool to a widget.
 *
 * @example
 * // Simple configuration with static title
 * const config: WidgetMappingConfig = {
 *   widgetType: "transaction-list",
 *   title: "Transactions",
 *   metadata: {
 *     description: "Display list of transactions",
 *     category: "transactions",
 *     autoFocus: true,
 *   }
 * }
 *
 * @example
 * // Configuration with dynamic title
 * const config: WidgetMappingConfig = {
 *   widgetType: "spending-analysis",
 *   title: (args) => `Analysis: ${args?.category || "General"}`,
 *   metadata: {
 *     category: "analysis",
 *   }
 * }
 */
export interface WidgetMappingConfig {
  /**
   * The widget type to render.
   * Must match one of the WidgetType values.
   */
  widgetType: WidgetType

  /**
   * Widget title - can be static string or dynamic function.
   * If a function is provided, it receives the tool arguments
   * and should return the computed title string.
   */
  title: string | TitleGenerator

  /**
   * Optional metadata for future features.
   * Fields include: description, icon, category, autoFocus
   */
  metadata?: WidgetMetadata
}

/**
 * Registry mapping tool names to widget configurations.
 *
 * @example
 * const registry: WidgetRegistry = {
 *   getTransactions: {
 *     widgetType: "transaction-list",
 *     title: "Transactions",
 *   },
 *   analyzeSpending: {
 *     widgetType: "spending-analysis",
 *     title: (args) => `Analysis: ${args?.category || "General"}`,
 *   }
 * }
 */
export type WidgetRegistry = Record<string, WidgetMappingConfig>
