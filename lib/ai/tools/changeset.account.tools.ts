/**
 * Account changeset tools - Type-safe tools for proposing account changes
 * that require user approval before execution.
 */

import { tool } from "ai"
import { z } from "zod"

export const createAccountChangeRequestTool = tool({
  description:
    "Add a 'create account' request to the current change set. This proposes creating a new financial account " +
    "that will be reviewed and approved by the user before execution. All required account fields must be provided.",
  inputSchema: z.object({
    // Required fields (matching createAccountTool)
    account_type_id: z.number().describe("ID of the account type (checking, savings, credit card, etc.)"),
    account_name: z.string().describe("Name/label for the account (1-100 characters)"),

    // Optional fields
    currency_code: z.string().optional().describe("Optional: 3-letter ISO currency code (default: USD)"),
    opening_balance: z.number().optional().describe("Optional: Initial balance (default: 0.00)"),
    opening_balance_date: z
      .string()
      .optional()
      .describe("Optional: Date of opening balance in YYYY-MM-DD format"),
    account_number: z.string().optional().describe("Optional: Account number (max 50 characters)"),
    institution_name: z.string().optional().describe("Optional: Bank/institution name (max 100 characters)"),
    credit_limit: z.number().optional().describe("Optional: Credit limit for credit card accounts"),
    is_closed: z.boolean().optional().describe("Optional: Whether account is closed (default: false)"),
    notes: z.string().optional().describe("Optional: Additional notes about the account"),
  }),
  // NO execute - client-side tool
})

export const updateAccountChangeRequestTool = tool({
  description:
    "Add an 'update account' request to the current change set. This proposes modifying an existing account " +
    "that will be reviewed and approved by the user. Only the fields being changed need to be provided (partial update).",
  inputSchema: z.object({
    // Required: account to update
    account_id: z.number().describe("ID of the account to update"),

    // Optional: any fields being updated (matching updateAccountTool)
    account_type_id: z.number().optional().describe("Optional: New account type ID"),
    account_name: z.string().optional().describe("Optional: New account name (1-100 characters)"),
    currency_code: z.string().optional().describe("Optional: New 3-letter ISO currency code"),
    account_number: z.string().optional().describe("Optional: New account number (max 50 characters)"),
    institution_name: z.string().optional().describe("Optional: New bank/institution name (max 100 characters)"),
    credit_limit: z.number().optional().describe("Optional: New credit limit"),
    is_closed: z.boolean().optional().describe("Optional: New closed status"),
    notes: z.string().optional().describe("Optional: New notes"),
  }),
  // NO execute - client-side tool
})

export const deleteAccountChangeRequestTool = tool({
  description:
    "Add a 'delete account' request to the current change set. This proposes removing an existing account " +
    "that will be reviewed and approved by the user. Only the account ID is required. " +
    "Note: Deletion will fail if the account has associated transactions.",
  inputSchema: z.object({
    account_id: z.number().describe("ID of the account to delete"),
  }),
  // NO execute - client-side tool
})
