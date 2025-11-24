/**
 * Transaction-related AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { expenseDatabase, budgetData } from "@/lib/data"
import { getTransactions } from "@/lib/api/transactions"

export const addTransactionTool = tool({
  description: "Add a new transaction to the tracker. Returns the created transaction with an ID.",
  inputSchema: z.object({
    date: z.string().describe("Date of the transaction in YYYY-MM-DD format"),
    category: z
      .string()
      .describe("Category of the transaction (e.g., Food, Transportation, Entertainment, Shopping, Utilities)"),
    amount: z.number().describe("Amount of the transaction in dollars"),
    description: z.string().describe("Description of the transaction"),
  }),
  execute: async ({ date, category, amount, description }) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newTransaction = {
      id: Math.floor(Math.random() * 10000) + 9, // Simple random ID
      date,
      category,
      amount,
      description,
    }

    // In a real app, we would push to DB.
    // For this demo, we just return the object as if it was added.
    // We don't mutate the import to avoid state pollution across requests in serverless (unless we used a real DB)
    return newTransaction
  },
})

export const getTransactionsTool = tool({
  description: "Retrieve transactions from the tracker. Can filter by account, category, payee, transaction type, date range, and more.",
  inputSchema: z.object({
    account_id: z.number().optional().describe("Optional: Filter by account ID"),
    category_id: z.number().optional().describe("Optional: Filter by category ID"),
    payee_id: z.number().optional().describe("Optional: Filter by payee ID"),
    transaction_type: z.enum(["expense", "income"]).optional().describe("Optional: Filter by transaction type (debit or credit)"),
    status: z.string().optional().describe("Optional: Filter by transaction status"),
    start_date: z.string().optional().describe("Optional: Start date for date range filter (YYYY-MM-DD)"),
    end_date: z.string().optional().describe("Optional: End date for date range filter (YYYY-MM-DD)"),
    limit: z.number().optional().describe("Optional: Maximum number of transactions to return"),
    offset: z.number().optional().describe("Optional: Number of transactions to skip (for pagination)"),
  }),
  execute: async ({ account_id, category_id, payee_id, transaction_type, status, start_date, end_date, limit, offset }) => {
    try {
      // Call the real API with filters
      const response = await getTransactions({
        account_id,
        category_id,
        payee_id,
        transaction_type,
        status,
        start_date,
        end_date,
        limit,
        offset,
      })

      // Return the API response directly without transformation
      return response
    } catch (error) {
      console.error("Error fetching transactions:", error)
      throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const analyzeSpendingTool = tool({
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
})

export const getSpendingSummaryTool = tool({
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
})
