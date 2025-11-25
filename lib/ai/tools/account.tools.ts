/**
 * Account-related AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { createAccount, getAccounts, getAccount, updateAccount, deleteAccount } from "@/lib/api"

export const createAccountTool = tool({
  description: "Create a new financial account with specified type, name, and optional details like opening balance, account number, and institution.",
  inputSchema: z.object({
    account_type_id: z.number().describe("ID of the account type (checking, savings, credit card, etc.)"),
    account_name: z.string().describe("Name/label for the account (1-100 characters)"),
    currency_code: z.string().optional().describe("Optional: 3-letter ISO currency code (default: USD)"),
    opening_balance: z.number().optional().describe("Optional: Initial balance (default: 0.00)"),
    opening_balance_date: z.string().optional().describe("Optional: Date of opening balance in YYYY-MM-DD format"),
    account_number: z.string().optional().describe("Optional: Account number (max 50 characters)"),
    institution_name: z.string().optional().describe("Optional: Bank/institution name (max 100 characters)"),
    credit_limit: z.number().optional().describe("Optional: Credit limit for credit card accounts"),
    is_closed: z.boolean().optional().describe("Optional: Whether account is closed (default: false)"),
    notes: z.string().optional().describe("Optional: Additional notes about the account"),
  }),
  execute: async ({ account_type_id, account_name, currency_code, opening_balance, opening_balance_date, account_number, institution_name, credit_limit, is_closed, notes }) => {
    try {
      const account = await createAccount({
        account_type_id,
        account_name,
        currency_code,
        opening_balance,
        opening_balance_date,
        account_number,
        institution_name,
        credit_limit,
        is_closed,
        notes,
      })
      return account
    } catch (error) {
      console.error("Error creating account:", error)
      throw new Error(`Failed to create account: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getAccountsTool = tool({
  description: "Retrieve all accounts with optional filtering by account type, currency, or closed status. Supports pagination.",
  inputSchema: z.object({
    account_type_id: z.number().optional().describe("Optional: Filter by account type ID"),
    currency_code: z.string().optional().describe("Optional: Filter by 3-letter currency code"),
    is_closed: z.boolean().optional().describe("Optional: Filter by closed status (true/false)"),
    limit: z.number().optional().describe("Optional: Maximum number of accounts to return (1-100, default 50)"),
    offset: z.number().optional().describe("Optional: Number of accounts to skip for pagination (default 0)"),
  }),
  execute: async ({ account_type_id, currency_code, is_closed, limit, offset }) => {
    try {
      const response = await getAccounts({
        account_type_id,
        currency_code,
        is_closed,
        limit,
        offset,
      })
      return response
    } catch (error) {
      console.error("Error fetching accounts:", error)
      throw new Error(`Failed to fetch accounts: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getAccountTool = tool({
  description: "Get detailed information for a specific account by ID, including current balance and all account details.",
  inputSchema: z.object({
    account_id: z.number().describe("ID of the account to retrieve"),
  }),
  execute: async ({ account_id }) => {
    try {
      const account = await getAccount(account_id)
      return account
    } catch (error) {
      console.error(`Error fetching account ${account_id}:`, error)
      throw new Error(`Failed to fetch account: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const updateAccountTool = tool({
  description: "Update account details such as name, type, credit limit, or closure status. Only provided fields will be updated.",
  inputSchema: z.object({
    account_id: z.number().describe("ID of the account to update"),
    account_type_id: z.number().optional().describe("Optional: New account type ID"),
    account_name: z.string().optional().describe("Optional: New account name (1-100 characters)"),
    currency_code: z.string().optional().describe("Optional: New 3-letter ISO currency code"),
    account_number: z.string().optional().describe("Optional: New account number (max 50 characters)"),
    institution_name: z.string().optional().describe("Optional: New bank/institution name (max 100 characters)"),
    credit_limit: z.number().optional().describe("Optional: New credit limit"),
    is_closed: z.boolean().optional().describe("Optional: New closed status"),
    notes: z.string().optional().describe("Optional: New notes"),
  }),
  execute: async ({ account_id, account_type_id, account_name, currency_code, account_number, institution_name, credit_limit, is_closed, notes }) => {
    try {
      const account = await updateAccount(account_id, {
        account_type_id,
        account_name,
        currency_code,
        account_number,
        institution_name,
        credit_limit,
        is_closed,
        notes,
      })
      return account
    } catch (error) {
      console.error(`Error updating account ${account_id}:`, error)
      throw new Error(`Failed to update account: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const deleteAccountTool = tool({
  description: "Delete an account by ID. Note: Deletion will fail if the account has associated transactions.",
  inputSchema: z.object({
    account_id: z.number().describe("ID of the account to delete"),
  }),
  execute: async ({ account_id }) => {
    try {
      await deleteAccount(account_id)
      return { success: true, message: `Account ${account_id} deleted successfully` }
    } catch (error) {
      console.error(`Error deleting account ${account_id}:`, error)
      throw new Error(`Failed to delete account: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})
