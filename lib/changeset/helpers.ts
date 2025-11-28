import { getTransactions } from "@/lib/api/transactions"
import { EntityType } from "./types"

/**
 * Fetch current data for a record to populate currentData field
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
      case "account":
      case "category":
      case "budget_rule":
        // For now, return null (no API implemented)
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
