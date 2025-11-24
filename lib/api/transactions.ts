/**
 * Transaction API client
 */

import { apiClient } from "./client"

export interface Transaction {
  transaction_id?: number
  account_id: number
  category_id?: number | null
  payee_id?: number | null
  transaction_date: string
  amount: number
  transaction_type: "debit" | "credit"
  description?: string | null
  status?: string
  created_at?: string
  updated_at?: string
}

export interface TransactionFilters {
  account_id?: number
  category_id?: number
  payee_id?: number
  transaction_type?: "expense" | "income"
  status?: string
  start_date?: string
  end_date?: string
  sort?: string
  order?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
  limit: number
  offset: number
}

export async function getTransactions(filters?: TransactionFilters): Promise<TransactionsResponse> {
  const params = new URLSearchParams()

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
  }

  const queryString = params.toString()
  const endpoint = queryString ? `/transactions?${queryString}` : "/transactions"

  return apiClient<TransactionsResponse>(endpoint)
}
