/**
 * Accounts API client
 */

import { apiClient } from "./client"

export interface Account {
  account_id: number
  account_type_id: number
  account_name: string
  account_number: string | null
  institution_name: string | null
  currency_code: string
  opening_balance: string
  current_balance: string
  credit_limit: string | null
  is_closed: boolean
  notes: string | null
  opening_balance_date: string
  created_at: string
  updated_at: string
}

export interface AccountCreate {
  account_type_id: number
  account_name: string
  currency_code?: string
  opening_balance?: number | string
  opening_balance_date?: string
  account_number?: string
  institution_name?: string
  credit_limit?: number | string
  is_closed?: boolean
  notes?: string
}

export interface AccountUpdate {
  account_type_id?: number
  account_name?: string
  currency_code?: string
  account_number?: string
  institution_name?: string
  credit_limit?: number | string
  is_closed?: boolean
  notes?: string
}

export interface AccountFilters {
  account_type_id?: number
  currency_code?: string
  is_closed?: boolean
  limit?: number
  offset?: number
}

export interface AccountsResponse {
  data: Account[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export async function createAccount(data: AccountCreate): Promise<Account> {
  return apiClient<Account>("/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getAccounts(filters?: AccountFilters): Promise<AccountsResponse> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/accounts?${queryString}` : "/accounts"

  return apiClient<AccountsResponse>(endpoint)
}

export async function getAccount(accountId: number): Promise<Account> {
  return apiClient<Account>(`/accounts/${accountId}`)
}

export async function updateAccount(accountId: number, data: AccountUpdate): Promise<Account> {
  return apiClient<Account>(`/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteAccount(accountId: number): Promise<void> {
  await apiClient<void>(`/accounts/${accountId}`, {
    method: "DELETE",
  })
}
