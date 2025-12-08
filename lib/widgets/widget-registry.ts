import type { WidgetType, WidgetRegistry, WidgetMappingConfig } from "@/types/widget"

/**
 * Central registry mapping AI tool names to widget configurations.
 *
 * ## How to Add a New Tool-Widget Mapping
 *
 * 1. Add an entry to this object with the tool name as the key
 * 2. Specify the widget type to render
 * 3. Provide either a static title string or a title generator function
 * 4. Optionally add metadata for future features
 *
 * @example
 * ```typescript
 * // Example: Add a new MCP tool mapping
 * mcpGetWeather: {
 *   widgetType: "weather-widget",
 *   title: (args) => `Weather: ${args?.city || "Current Location"}`,
 *   metadata: {
 *     description: "Current weather conditions",
 *     category: "external-data",
 *     icon: "cloud",
 *     autoFocus: true,
 *   }
 * }
 * ```
 *
 * ## Current Mappings
 *
 * Only tools with explicit widget mappings will create widgets.
 * Tools not listed here will NOT create widgets (they'll be skipped).
 */
export const widgetRegistry: WidgetRegistry = {
  /**
   * Transaction list tool
   * Displays all transactions with optional filters
   */
  getTransactions: {
    widgetType: "transaction-list",
    title: "Transactions",
    metadata: {
      description: "Display list of transactions with filters",
      category: "transactions",
      icon: "list",
      autoFocus: true,
    },
  },

  /**
   * Category breakdown analytics tool
   * Shows transactions grouped by category with bar chart (supports both income and expenses)
   */
  analytics_breakdownByCategory: {
    widgetType: "summary-chart",
    title: (args) => {
      const type = args?.transaction_type === "income" ? "Income" : "Spending"
      return `${type} by Category`
    },
    metadata: {
      description: "Transaction breakdown by category",
      category: "analysis",
      icon: "pie-chart",
      autoFocus: true,
    },
  },

  /**
   * Budget vs actual analytics tool
   * Compares actual spending against budget for a category with progress bar
   */
  analytics_budgetVsActual: {
    widgetType: "spending-analysis",
    title: (args) => `Budget vs Actual: ${args?.category_id ? `Category ${args.category_id}` : "General"}`,
    metadata: {
      description: "Budget vs actual spending analysis",
      category: "analysis",
      icon: "chart-bar",
      autoFocus: true,
    },
  },

  /**
   * Account list tool
   * Displays all accounts with balances and details
   */
  getAccounts: {
    widgetType: "account-list",
    title: "Accounts",
    metadata: {
      description: "Display list of accounts with balances",
      category: "accounts",
      icon: "wallet",
      autoFocus: true,
    },
  },

  /**
   * Category list tool
   * Displays all transaction categories organized by type
   */
  getCategories: {
    widgetType: "category-list",
    title: "Categories",
    metadata: {
      description: "Display list of transaction categories",
      category: "categories",
      icon: "tag",
      autoFocus: true,
    },
  },

  /**
   * Change set confirmation tool
   * Displays pending changes for user review and approval
   */
  confirmChangeSet: {
    widgetType: "changeset",
    title: "Change Set Review",
    metadata: {
      description: "Review and approve pending changes",
      category: "operations",
      icon: "check-square",
      autoFocus: true,
    },
  },

  // Note: The following tools do NOT have widget mappings (by design):
  // - addTransaction: Just adds a transaction, no visualization needed
  // - getTableNames: Schema inspection tool, no widget needed
  // - getTableSchema: Schema inspection tool, no widget needed
  // - createAccount, updateAccount, deleteAccount: CRUD operations, no visualization needed
  // - createCategory, updateCategory, deleteCategory: CRUD operations, no visualization needed

  // Future MCP tools can be added here following the same pattern
  // Example (commented out):
  // mcpGetStockPrice: {
  //   widgetType: "stock-widget",
  //   title: (args) => `Stock: ${args?.symbol || "Unknown"}`,
  //   metadata: {
  //     description: "Real-time stock price information",
  //     category: "external-data",
  //     icon: "trending-up",
  //     autoFocus: false,
  //   }
  // },
}

/**
 * Get widget configuration for a tool name.
 *
 * @param toolName - The name of the tool (e.g., "getTransactions")
 * @param args - Optional tool arguments for dynamic title generation
 * @returns Widget configuration with resolved title, or null if tool is not mapped
 *
 * @example
 * ```typescript
 * const config = getWidgetConfig("getTransactions")
 * // Returns: { widgetType: "transaction-list", title: "Transactions", metadata: {...} }
 *
 * const config = getWidgetConfig("analyzeSpending", { category: "Food" })
 * // Returns: { widgetType: "spending-analysis", title: "Analysis: Food", metadata: {...} }
 *
 * const config = getWidgetConfig("addTransaction")
 * // Returns: null (not mapped)
 * ```
 */
export function getWidgetConfig(
  toolName: string,
  args?: any
): { widgetType: WidgetType; title: string; metadata?: WidgetMappingConfig["metadata"] } | null {
  const config = widgetRegistry[toolName]

  if (!config) {
    return null
  }

  // Resolve title - either use static string or call generator function
  const title = typeof config.title === "function" ? config.title(args) : config.title

  return {
    widgetType: config.widgetType,
    title,
    metadata: config.metadata,
  }
}

/**
 * Check if a tool is registered in the widget registry.
 *
 * @param toolName - The name of the tool to check
 * @returns True if the tool has a widget mapping, false otherwise
 *
 * @example
 * ```typescript
 * isToolRegistered("getTransactions") // true
 * isToolRegistered("addTransaction")  // false
 * ```
 */
export function isToolRegistered(toolName: string): boolean {
  return toolName in widgetRegistry
}

/**
 * Get all registered tool names.
 * Useful for debugging or building tool selection UIs.
 *
 * @returns Array of tool names that have widget mappings
 *
 * @example
 * ```typescript
 * const tools = getRegisteredTools()
 * // Returns: ["getTransactions", "analyzeSpending", "getSpendingSummary"]
 * ```
 */
export function getRegisteredTools(): string[] {
  return Object.keys(widgetRegistry)
}
