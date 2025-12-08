/**
 * Analytics-related AI tools for visualizations and insights
 */

import { tool } from "ai"
import { z } from "zod"
import { getSummary, getBreakdown } from "@/lib/api/analytics"
import { getCategory } from "@/lib/api/categories"

export const analytics_breakdownByCategory = tool({
  description: "Display a visual breakdown of transactions by category with bar chart. Works for both expenses and income. Shows total amount per category.",
  inputSchema: z.object({
    transaction_type: z.enum(["expense", "income"]).describe("Type of transactions to analyze - 'expense' for spending or 'income' for earnings. Must be specified."),
    start_date: z.string().optional().describe("Filter by start date (YYYY-MM-DD format)"),
    end_date: z.string().optional().describe("Filter by end date (YYYY-MM-DD format)"),
    account_id: z.number().optional().describe("Filter by specific account ID"),
  }),
  execute: async ({ transaction_type, start_date, end_date, account_id }) => {
    try {
      // Call analytics API: getBreakdown()
      const breakdown = await getBreakdown({
        dimension: "category",
        metric: "sum",
        transaction_type,
        start_date,
        end_date,
        account_id,
      })

      // Transform API response: { labels: string[], values: number[] }
      // into widget format: { summary: Record<string, {total, count}>, grandTotal }
      const summary: Record<string, { total: number; count: number }> = {}
      let grandTotal = 0

      for (let i = 0; i < breakdown.labels.length; i++) {
        summary[breakdown.labels[i]] = {
          total: breakdown.values[i],
          count: 0, // Not fetched yet - can be enhanced later with second API call
        }
        grandTotal += breakdown.values[i]
      }

      return {
        summary,
        grandTotal,
        transactionType: transaction_type,
        dateRange: {
          startDate: start_date || "beginning",
          endDate: end_date || "now",
        },
      }
    } catch (error) {
      console.error("Error fetching category breakdown:", error)
      throw new Error(`Failed to fetch category breakdown: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const analytics_budgetVsActual = tool({
  description:
    "Display budget vs actual spending analysis for a specific category. Shows spending compared to budget with visual progress bar and status indicator. Budget defaults to $500 if not specified.",
  inputSchema: z.object({
    category_id: z.number().describe("ID of the category to analyze"),
    start_date: z.string().optional().describe("Filter by start date (YYYY-MM-DD format)"),
    end_date: z.string().optional().describe("Filter by end date (YYYY-MM-DD format)"),
    account_id: z.number().optional().describe("Filter by specific account ID"),
    budget: z.number().optional().describe("Budget amount for this category (defaults to 500 if not specified)"),
  }),
  execute: async ({ category_id, start_date, end_date, account_id, budget = 500 }) => {
    try {
      // Call analytics API: getSummary()
      const summary = await getSummary({
        category_id,
        transaction_type: "expense",
        start_date,
        end_date,
        account_id,
      })

      // Fetch category name
      const category = await getCategory(category_id)

      // Calculate budget metrics
      const spent = summary.total
      const transactionCount = summary.count
      const remaining = budget - spent
      const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0
      const status = percentageUsed > 100 ? "over_budget" : percentageUsed > 80 ? "warning" : "good"

      return {
        category: category.category_name,
        spent,
        budget,
        remaining,
        percentageUsed,
        status,
        transactionCount,
      }
    } catch (error) {
      console.error(`Error analyzing budget for category ${category_id}:`, error)
      throw new Error(
        `Failed to analyze category budget: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  },
})
