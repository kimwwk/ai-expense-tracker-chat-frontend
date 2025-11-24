/**
 * Schema API client
 */

import { apiClient } from "./client"

export interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default: string | null
  primary_key: boolean
  foreign_key: string | null
  unique: boolean
}

export interface TableSchema {
  table_name: string
  columns: TableColumn[]
}

export async function getTableNames(): Promise<string[]> {
  return apiClient<string[]>("/schema/tables")
}

export async function getTableSchema(tableName: string): Promise<TableSchema> {
  return apiClient<TableSchema>(`/schema/tables/${tableName}`)
}
