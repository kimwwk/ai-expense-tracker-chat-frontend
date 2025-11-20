// MCP Tools for Expense Tracking
// This module is decoupled for easy maintenance and modification

export const mcpTools = {
  get_recent_expenses: {
    description: "Get recent expenses with optional filters for date range and category",
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of expenses to retrieve",
        },
        category: {
          type: "string",
          description: "Filter by category (e.g., food, transport, entertainment)",
        },
      },
    },
    execute: async (args: any) => {
      // Mock data - replace with actual database queries
      const mockExpenses = [
        { date: "2025-01-15", description: "Grocery Shopping", category: "Food", amount: 125.5 },
        { date: "2025-01-14", description: "Uber Ride", category: "Transport", amount: 18.75 },
        { date: "2025-01-14", description: "Netflix Subscription", category: "Entertainment", amount: 15.99 },
        { date: "2025-01-13", description: "Restaurant Dinner", category: "Food", amount: 68.4 },
        { date: "2025-01-12", description: "Gas Station", category: "Transport", amount: 45.0 },
      ]

      return {
        expenses: mockExpenses.slice(0, args.limit || 10),
        total: mockExpenses.reduce((sum, e) => sum + e.amount, 0),
      }
    },
  },

  analyze_spending: {
    description: "Analyze spending patterns and trends over a time period",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period to analyze (week, month, year)",
        },
      },
    },
    execute: async (args: any) => {
      // Mock analysis - replace with actual calculations
      return {
        total: 2450.75,
        average: 81.69,
        trend: "increasing",
        comparison: "up 12% from last month",
      }
    },
  },

  get_budget_status: {
    description: "Get current budget status across all categories",
    parameters: {
      type: "object",
      properties: {},
    },
    execute: async (args: any) => {
      // Mock budget data - replace with actual budget tracking
      return {
        budgets: [
          { category: "Food", limit: 500, spent: 425.8, percentage: 85 },
          { category: "Transport", limit: 200, spent: 145.25, percentage: 73 },
          { category: "Entertainment", limit: 150, spent: 98.5, percentage: 66 },
          { category: "Shopping", limit: 300, spent: 345.2, percentage: 115 },
        ],
      }
    },
  },

  get_category_breakdown: {
    description: "Get spending breakdown by category",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          description: "Time period for breakdown (week, month, year)",
        },
      },
    },
    execute: async (args: any) => {
      // Mock category data - replace with actual aggregation
      return {
        categories: [
          { name: "Food", amount: 425.8 },
          { name: "Transport", amount: 145.25 },
          { name: "Shopping", amount: 345.2 },
          { name: "Entertainment", amount: 98.5 },
          { name: "Utilities", amount: 220.0 },
        ],
      }
    },
  },
}

// Helper to convert MCP tools to AI SDK format
export function getMCPToolsForAI() {
  return Object.entries(mcpTools).reduce(
    (acc, [name, tool]) => {
      acc[name] = {
        description: tool.description,
        parameters: tool.parameters,
      }
      return acc
    },
    {} as Record<string, any>,
  )
}

// Execute a tool by name
export async function executeMCPTool(toolName: string, args: any) {
  const tool = mcpTools[toolName as keyof typeof mcpTools]
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`)
  }
  return await tool.execute(args)
}
