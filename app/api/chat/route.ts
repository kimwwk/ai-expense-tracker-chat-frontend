import { openai } from "@ai-sdk/openai"
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai"
import { z } from "zod"
import { expenseDatabase, budgetData } from "@/lib/data"

// Define tools separately to keep route clean
const tools = {
  addExpense: tool({
    description: "Add a new expense to the tracker. Returns the created expense with an ID.",
    inputSchema: z.object({
      date: z.string().describe("Date of the expense in YYYY-MM-DD format"),
      category: z
        .string()
        .describe("Category of the expense (e.g., Food, Transportation, Entertainment, Shopping, Utilities)"),
      amount: z.number().describe("Amount of the expense in dollars"),
      description: z.string().describe("Description of the expense"),
    }),
    execute: async ({ date, category, amount, description }) => {
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newExpense = {
        id: Math.floor(Math.random() * 10000) + 9, // Simple random ID
        date,
        category,
        amount,
        description,
      }

      // In a real app, we would push to DB.
      // For this demo, we just return the object as if it was added.
      // We don't mutate the import to avoid state pollution across requests in serverless (unless we used a real DB)
      return newExpense
    },
  }),

  getExpenses: tool({
    description: "Retrieve expenses from the tracker. Can filter by category, date range, or get all expenses.",
    inputSchema: z.object({
      category: z.string().optional().describe("Optional: Filter by category"),
      startDate: z.string().optional().describe("Optional: Start date for date range filter (YYYY-MM-DD)"),
      endDate: z.string().optional().describe("Optional: End date for date range filter (YYYY-MM-DD)"),
    }),
    execute: async ({ category, startDate, endDate }) => {
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate DB latency

      let filtered = [...expenseDatabase]

      if (category) {
        filtered = filtered.filter((e) => e.category.toLowerCase() === category.toLowerCase())
      }
      if (startDate) {
        filtered = filtered.filter((e) => e.date >= startDate)
      }
      if (endDate) {
        filtered = filtered.filter((e) => e.date <= endDate)
      }

      return filtered
    },
  }),

  analyzeSpending: tool({
    description: "Analyze spending against budget for a category. Shows how much of the budget has been used.",
    inputSchema: z.object({
      category: z.string().describe("Category to analyze"),
    }),
    execute: async ({ category }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const categoryExpenses = expenseDatabase.filter((e) => e.category.toLowerCase() === category.toLowerCase())

      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
      const budget = budgetData[category] || 0
      const remaining = budget - spent
      const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0

      return {
        category,
        spent,
        budget,
        remaining,
        percentageUsed,
        status: percentageUsed > 100 ? "over_budget" : percentageUsed > 80 ? "warning" : "good",
      }
    },
  }),

  getSpendingSummary: tool({
    description: "Get a comprehensive spending summary with totals by category.",
    inputSchema: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
    execute: async ({ startDate, endDate }) => {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      let filtered = [...expenseDatabase]
      if (startDate) filtered = filtered.filter((e) => e.date >= startDate)
      if (endDate) filtered = filtered.filter((e) => e.date <= endDate)

      const summary = filtered.reduce(
        (acc, expense) => {
          if (!acc[expense.category]) {
            acc[expense.category] = { total: 0, count: 0 }
          }
          acc[expense.category].total += expense.amount
          acc[expense.category].count++
          return acc
        },
        {} as Record<string, { total: number; count: number }>,
      )

      const grandTotal = Object.values(summary).reduce((sum, cat) => sum + cat.total, 0)

      return {
        summary,
        grandTotal,
        dateRange: { startDate: startDate || "beginning", endDate: endDate || "now" },
      }
    },
  }),
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Convert UIMessages to ModelMessages for compatibility with streamText
  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openai("gpt-5.1"),
    system: `You are an intelligent expense assistant. You have access to tools to manage and view expenses.

    CRITICAL INSTRUCTION:
    When the user asks for information, use the appropriate tools.
    You often need to use multiple tools to give a complete answer.
    For example, if asked for a "summary", use getSpendingSummary.
    If asked for "expenses", use getExpenses.

    The frontend is designed to render "Widgets" based on the data you return.
    So, prefer calling tools that return structured data (like getExpenses, analyzeSpending)
    over just summarizing it in text if the user wants to "see" the data.

    However, you MUST still provide a helpful text response summarizing the findings.
    `,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    toolChoice: 'auto'
  })

  return result.toUIMessageStreamResponse()
}
