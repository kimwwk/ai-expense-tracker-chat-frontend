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
  transaction_type: "expense" | "income"
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
  status?: "pending" | "cleared" | "reconciled" | "void"
  start_date?: string
  end_date?: string
  sort?: "transaction_date" | "amount" | "created_at"
  order?: "asc" | "desc"
  limit?: number
  offset?: number
}

export interface TransactionCreate {
  account_id: number
  transaction_type: "income" | "expense"
  amount: number
  currency_code: string
  base_amount: number
  transaction_date: string
  status?: "pending" | "cleared" | "reconciled" | "void"
  exchange_rate?: number
  payee_id?: number
  category_id?: number
  description?: string
  reference_number?: string
  location?: string
  notes?: string
}

export interface TransactionsResponse {
  data: Transaction[]
  total: number
  limit: number
  offset: number
}

export async function createTransaction(data: TransactionCreate): Promise<Transaction> {
  return apiClient<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  })
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
