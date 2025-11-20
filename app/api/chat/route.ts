import { convertToModelMessages, streamText, tool, type UIMessage } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

export const maxDuration = 30

const tools = {
  get_recent_expenses: tool({
    description: "Get recent expenses with optional filters for date range and category",
    inputSchema: z.object({
      limit: z.number().optional().describe("Number of expenses to retrieve"),
      category: z.string().optional().describe("Filter by category (e.g., food, transport, entertainment)"),
    }),
    execute: async ({ limit = 10, category }) => {
      console.log("[v0] Executing get_recent_expenses", { limit, category })

      // Mock data - replace with actual database queries
      const mockExpenses = [
        { date: "2025-01-15", description: "Grocery Shopping", category: "Food", amount: 125.5 },
        { date: "2025-01-14", description: "Uber Ride", category: "Transport", amount: 18.75 },
        { date: "2025-01-14", description: "Netflix Subscription", category: "Entertainment", amount: 15.99 },
        { date: "2025-01-13", description: "Restaurant Dinner", category: "Food", amount: 68.4 },
        { date: "2025-01-12", description: "Gas Station", category: "Transport", amount: 45.0 },
        { date: "2025-01-11", description: "Movie Tickets", category: "Entertainment", amount: 32.0 },
      ]

      const filtered = category
        ? mockExpenses.filter((e) => e.category.toLowerCase() === category.toLowerCase())
        : mockExpenses

      return {
        expenses: filtered.slice(0, limit),
        total: filtered.reduce((sum, e) => sum + e.amount, 0),
      }
    },
  }),

  analyze_spending: tool({
    description: "Analyze spending patterns and trends over a time period",
    inputSchema: z.object({
      period: z.string().optional().describe("Time period to analyze (week, month, year)"),
    }),
    execute: async ({ period = "month" }) => {
      console.log("[v0] Executing analyze_spending", { period })

      // Mock analysis - replace with actual calculations
      return {
        total: 2450.75,
        average: 81.69,
        trend: "increasing",
        comparison: "up 12% from last month",
        period,
      }
    },
  }),

  get_budget_status: tool({
    description: "Get current budget status across all categories",
    inputSchema: z.object({}),
    execute: async () => {
      console.log("[v0] Executing get_budget_status")

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
  }),

  get_category_breakdown: tool({
    description: "Get spending breakdown by category",
    inputSchema: z.object({
      period: z.string().optional().describe("Time period for breakdown (week, month, year)"),
    }),
    execute: async ({ period = "month" }) => {
      console.log("[v0] Executing get_category_breakdown", { period })

      // Mock category data - replace with actual aggregation
      return {
        categories: [
          { name: "Food", amount: 425.8 },
          { name: "Transport", amount: 145.25 },
          { name: "Shopping", amount: 345.2 },
          { name: "Entertainment", amount: 98.5 },
          { name: "Utilities", amount: 220.0 },
        ],
        period,
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    prompt,
    system: `You are an expense tracking AI assistant. You help users understand their spending patterns, manage budgets, and make financial decisions.

You have access to several tools to query expense data:
- get_recent_expenses: Show recent transactions
- analyze_spending: Analyze spending trends and patterns
- get_budget_status: Check budget status across categories
- get_category_breakdown: Show spending by category

When users ask about their expenses, you should:
1. Use the appropriate tools to gather data
2. Call multiple tools in sequence if needed to provide comprehensive insights
3. Provide clear, actionable insights based on the data

For example, if a user asks "How am I doing with my spending?", you should:
1. Call get_recent_expenses to show recent transactions
2. Call analyze_spending to show trends
3. Call get_budget_status to check if they're over budget

Always be helpful, concise, and focus on actionable insights.`,
    tools,
    maxOutputTokens: 2000,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
