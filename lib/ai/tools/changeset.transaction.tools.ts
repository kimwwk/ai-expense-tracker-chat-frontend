/**
 * Transaction changeset tools - Type-safe tools for proposing transaction changes
 * that require user approval before execution.
 */

import { tool } from "ai"
import { z } from "zod"

export const createTransactionChangeRequestTool = tool({
  description:
    "Add a 'create transaction' request to the current change set. This proposes creating a new transaction " +
    "that will be reviewed and approved by the user before execution. All required transaction fields must be provided.",
  inputSchema: z.object({
    // Required fields (matching addTransactionTool exactly)
    account_id: z.number().describe("ID of the account for this transaction"),
    transaction_type: z.enum(["income", "expense"]).describe("Type of transaction: income or expense"),
    amount: z.number().describe("Transaction amount (must be positive)"),
    currency_code: z.string().describe("3-letter ISO currency code (e.g., USD, GBP, EUR)"),
    base_amount: z.number().describe("Amount in base currency for multi-currency support"),
    transaction_date: z.string().describe("Date of transaction in YYYY-MM-DD format"),

    // Optional fields
    status: z
      .enum(["pending", "cleared", "reconciled", "void"])
      .optional()
      .describe("Optional: Transaction status (default: cleared)"),
    exchange_rate: z.number().optional().describe("Optional: Exchange rate (default: 1.000000)"),
    payee_id: z.number().optional().describe("Optional: ID of the payee"),
    category_id: z.number().optional().describe("Optional: ID of the category"),
    description: z.string().optional().describe("Optional: Description of the transaction"),
    reference_number: z.string().optional().describe("Optional: Reference or check number"),
    location: z.string().optional().describe("Optional: Location of the transaction"),
    notes: z.string().optional().describe("Optional: Additional notes"),
  }),
  // NO execute - client-side tool
})

export const updateTransactionChangeRequestTool = tool({
  description:
    "Add an 'update transaction' request to the current change set. This proposes modifying an existing transaction " +
    "that will be reviewed and approved by the user. Only the fields being changed need to be provided (partial update).",
  inputSchema: z.object({
    // Required: transaction to update
    transaction_id: z.number().describe("ID of the transaction to update"),

    // Optional: any fields being updated (matching updateTransactionTool)
    account_id: z.number().optional().describe("Optional: New account ID"),
    transaction_type: z.enum(["income", "expense"]).optional().describe("Optional: New transaction type"),
    amount: z.number().optional().describe("Optional: New transaction amount"),
    currency_code: z.string().optional().describe("Optional: New currency code"),
    base_amount: z.number().optional().describe("Optional: New base amount"),
    transaction_date: z.string().optional().describe("Optional: New transaction date in YYYY-MM-DD format"),
    status: z.enum(["pending", "cleared", "reconciled", "void"]).optional().describe("Optional: New status"),
    exchange_rate: z.number().optional().describe("Optional: New exchange rate"),
    payee_id: z.number().optional().describe("Optional: New payee ID (use null to remove)"),
    category_id: z.number().optional().describe("Optional: New category ID (use null to remove)"),
    description: z.string().optional().describe("Optional: New description"),
    reference_number: z.string().optional().describe("Optional: New reference number"),
    location: z.string().optional().describe("Optional: New location"),
    notes: z.string().optional().describe("Optional: New notes"),
  }),
  // NO execute - client-side tool
})

export const deleteTransactionChangeRequestTool = tool({
  description:
    "Add a 'delete transaction' request to the current change set. This proposes removing an existing transaction " +
    "that will be reviewed and approved by the user. Only the transaction ID is required. " +
    "This is a destructive action that cannot be undone once approved.",
  inputSchema: z.object({
    transaction_id: z.number().describe("ID of the transaction to delete"),
  }),
  // NO execute - client-side tool
})
