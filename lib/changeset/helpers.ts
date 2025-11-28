import { getTransactions } from "@/lib/api/transactions"
import { getAccount } from "@/lib/api/accounts"
import { getCategory } from "@/lib/api/categories"
import { EntityType } from "./types"

/**
 * Fetch current data for a record to populate currentData field
 * This is used to capture the "before" state when updating or deleting records
 */
export async function fetchCurrentData(
  entity: EntityType,
  recordId: number
): Promise<Record<string, any> | null> {
  try {
    switch (entity) {
      case "transaction": {
        const response = await getTransactions({})
        const transaction = response.data.find((t) => t.transaction_id === recordId)
        return transaction || null
      }

      case "account": {
        const account = await getAccount(recordId)
        return account || null
      }

      case "category": {
        const category = await getCategory(recordId)
        return category || null
      }

      case "budget_rule":
        // Budget rule API not yet implemented
        console.warn(`fetchCurrentData not implemented for ${entity}`)
        return null

      default:
        return null
    }
  } catch (error) {
    console.error(`Failed to fetch ${entity} ${recordId}:`, error)
    return null
  }
}
