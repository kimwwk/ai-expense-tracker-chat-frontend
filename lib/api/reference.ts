/**
 * Reference data API client
 */

import { apiClient } from "./client"

export interface AccountType {
  account_type_id: number
  type_name: string
  description: string | null
  is_asset: boolean
}

export interface Currency {
  currency_code: string
  currency_name: string
  currency_symbol: string | null
  decimal_places: number
  is_active: boolean
}

export interface CurrencyFilters {
  active_only?: boolean
}

export async function getAccountTypes(): Promise<AccountType[]> {
  return apiClient<AccountType[]>("/reference/account-types")
}

export async function getCurrencies(filters?: CurrencyFilters): Promise<Currency[]> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/reference/currencies?${queryString}` : "/reference/currencies"

  return apiClient<Currency[]>(endpoint)
}
