/**
 * Transaction-related AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { expenseDatabase, budgetData } from "@/lib/data"
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/lib/api/transactions"

export const addTransactionTool = tool({
  description: "Add a new transaction to the tracker. Creates an income or expense transaction with all required details.",
  inputSchema: z.object({
    account_id: z.number().describe("ID of the account for this transaction"),
    transaction_type: z.enum(["income", "expense"]).describe("Type of transaction: income or expense"),
    amount: z.number().describe("Transaction amount (must be positive)"),
    currency_code: z.string().describe("3-letter ISO currency code (e.g., USD, GBP, EUR)"),
    base_amount: z.number().describe("Amount in base currency for multi-currency support"),
    transaction_date: z.string().describe("Date of transaction in YYYY-MM-DD format"),
    status: z.enum(["pending", "cleared", "reconciled", "void"]).optional().describe("Optional: Transaction status - pending (not yet processed), cleared (processed, default), reconciled (verified against statement), or void (cancelled)"),
    exchange_rate: z.number().optional().describe("Optional: Exchange rate (default: 1.000000)"),
    payee_id: z.number().optional().describe("Optional: ID of the payee"),
    category_id: z.number().optional().describe("Optional: ID of the category"),
    description: z.string().optional().describe("Optional: Description of the transaction"),
    reference_number: z.string().optional().describe("Optional: Reference or check number"),
    location: z.string().optional().describe("Optional: Location of the transaction"),
    notes: z.string().optional().describe("Optional: Additional notes"),
  }),
  execute: async ({ account_id, transaction_type, amount, currency_code, base_amount, transaction_date, status, exchange_rate, payee_id, category_id, description, reference_number, location, notes }) => {
    try {
      const transaction = await createTransaction({
        account_id,
        transaction_type,
        amount,
        currency_code,
        base_amount,
        transaction_date,
        status,
        exchange_rate,
        payee_id,
        category_id,
        description,
        reference_number,
        location,
        notes,
      })
      return transaction
    } catch (error) {
      console.error("Error creating transaction:", error)
      throw new Error(`Failed to create transaction: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getTransactionsTool = tool({
  description: "Retrieve transactions from the tracker with comprehensive filtering, sorting, and pagination. Filter by account, category, payee, transaction type, status, and date range. Sort by transaction date, amount, or creation date.",
  inputSchema: z.object({
    account_id: z.number().optional().describe("Optional: Filter by specific account ID to show only transactions for that account"),
    category_id: z.number().optional().describe("Optional: Filter by specific category ID to show only transactions in that category"),
    payee_id: z.number().optional().describe("Optional: Filter by specific payee ID to show only transactions with that payee"),
    transaction_type: z.enum(["expense", "income"]).optional().describe("Optional: Filter by transaction type - 'income' for incoming money or 'expense' for outgoing money"),
    status: z.enum(["pending", "cleared", "reconciled", "void"]).optional().describe("Optional: Filter by transaction status - pending (not yet processed), cleared (processed), reconciled (verified against statement), or void (cancelled)"),
    start_date: z.string().optional().describe("Optional: Show transactions on or after this date in YYYY-MM-DD format"),
    end_date: z.string().optional().describe("Optional: Show transactions on or before this date in YYYY-MM-DD format"),
    sort: z.enum(["transaction_date", "amount", "created_at"]).optional().describe("Optional: Field to sort results by - transaction_date (default, date of transaction), amount (transaction amount), or created_at (when record was created)"),
    order: z.enum(["asc", "desc"]).optional().describe("Optional: Sort order - 'asc' for ascending (oldest/smallest first) or 'desc' for descending (newest/largest first, default)"),
    limit: z.number().optional().describe("Optional: Maximum number of transactions to return per page (1-100, default: 50)"),
    offset: z.number().optional().describe("Optional: Number of transactions to skip for pagination (default: 0). Use with limit for paging through results"),
  }),
  execute: async ({ account_id, category_id, payee_id, transaction_type, status, start_date, end_date, sort, order, limit, offset }) => {
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
        sort,
        order,
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

export const updateTransactionTool = tool({
  description: "Update transaction details such as amount, date, category, payee, or status. Only provided fields will be updated.",
  inputSchema: z.object({
    transaction_id: z.number().describe("ID of the transaction to update"),
    account_id: z.number().optional().describe("Optional: New account ID"),
    transaction_type: z.enum(["income", "expense"]).optional().describe("Optional: New transaction type"),
    amount: z.number().optional().describe("Optional: New transaction amount (must be positive)"),
    currency_code: z.string().optional().describe("Optional: New 3-letter ISO currency code"),
    base_amount: z.number().optional().describe("Optional: New amount in base currency"),
    transaction_date: z.string().optional().describe("Optional: New transaction date in YYYY-MM-DD format"),
    status: z.enum(["pending", "cleared", "reconciled", "void"]).optional().describe("Optional: New transaction status"),
    exchange_rate: z.number().optional().describe("Optional: New exchange rate"),
    payee_id: z.number().optional().describe("Optional: New payee ID (use null to remove)"),
    category_id: z.number().optional().describe("Optional: New category ID (use null to remove)"),
    description: z.string().optional().describe("Optional: New description"),
    reference_number: z.string().optional().describe("Optional: New reference or check number"),
    location: z.string().optional().describe("Optional: New location"),
    notes: z.string().optional().describe("Optional: New additional notes"),
  }),
  execute: async ({ transaction_id, ...updateData }) => {
    try {
      const transaction = await updateTransaction(transaction_id, updateData)
      return transaction
    } catch (error) {
      console.error(`Error updating transaction ${transaction_id}:`, error)
      throw new Error(`Failed to update transaction: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const deleteTransactionTool = tool({
  description: "Delete a transaction by ID. This is a destructive action that requires user confirmation and cannot be undone.",
  inputSchema: z.object({
    transaction_id: z.number().describe("ID of the transaction to delete"),
  }),
  // NO execute function - this makes it a client-side tool requiring user approval
})
