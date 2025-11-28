/**
 * Types for AI-powered change set proposal system
 */

export type EntityType = "transaction" | "account" | "category" | "budget_rule"
export type OperationType = "create" | "update" | "delete"

export interface ChangeRequest {
  id: string // UUID
  entity: EntityType
  recordId?: number // null for creates
  operation: OperationType
  currentData?: Record<string, any> // snapshot before (null for creates)
  proposedData?: Record<string, any> // snapshot after (null for deletes)
  sequenceOrder: number
  createdAt: number // timestamp
}

export interface ChangeSet {
  id: string
  title?: string
  description?: string
  requests: ChangeRequest[]
  status: "building" | "pending_approval" | "approved" | "rejected"
  createdAt: number
  toolCallId?: string // Store toolCallId for addToolOutput after user approval
}
