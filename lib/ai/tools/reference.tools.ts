/**
 * Reference data AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { getAccountTypes, getCurrencies } from "@/lib/api"

export const getAccountTypesTool = tool({
  description: "Get all available account types such as checking, savings, credit card, etc. This is read-only reference data.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const accountTypes = await getAccountTypes()
      return {
        accountTypes,
        count: accountTypes.length,
      }
    } catch (error) {
      console.error("Error fetching account types:", error)
      throw new Error(`Failed to fetch account types: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getCurrenciesTool = tool({
  description: "Get supported currencies with optional filtering for active currencies only. Returns currency codes, names, symbols, and decimal places.",
  inputSchema: z.object({
    active_only: z.boolean().optional().describe("Optional: Return only active currencies (default: true)"),
  }),
  execute: async ({ active_only }) => {
    try {
      const currencies = await getCurrencies({
        active_only,
      })
      return {
        currencies,
        count: currencies.length,
      }
    } catch (error) {
      console.error("Error fetching currencies:", error)
      throw new Error(`Failed to fetch currencies: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})
