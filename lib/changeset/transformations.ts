import { EntityType, OperationType } from "./types"

/**
 * Transformation utilities for converting entity-specific tool inputs
 * into the standard ChangeRequest format.
 *
 * This module provides structural mapping only - no business logic validation.
 * Zod handles schema validation, backend handles business rules.
 */

// Type for entity ID field names
type EntityIdField = "transaction_id" | "account_id" | "category_id" | "budget_rule_id"

// Mapping from entity type to ID field name
const ENTITY_ID_FIELDS: Record<EntityType, EntityIdField> = {
  transaction: "transaction_id",
  account: "account_id",
  category: "category_id",
  budget_rule: "budget_rule_id",
}

/**
 * Extract recordId from tool input based on entity type
 * For create operations: returns undefined
 * For update/delete: extracts the entity-specific ID field
 */
export function extractRecordId(
  entity: EntityType,
  operation: OperationType,
  toolInput: Record<string, any>
): number | undefined {
  if (operation === "create") {
    return undefined
  }

  const idField = ENTITY_ID_FIELDS[entity]
  const recordId = toolInput[idField]

  if (typeof recordId !== "number") {
    throw new Error(`Missing required ${idField} for ${operation} ${entity} operation`)
  }

  return recordId
}

/**
 * Build proposedData from tool input
 * For create: all fields except entity_id
 * For update: only changed fields (exclude entity_id)
 * For delete: undefined (no data needed)
 */
export function buildProposedData(
  entity: EntityType,
  operation: OperationType,
  toolInput: Record<string, any>
): Record<string, any> | undefined {
  if (operation === "delete") {
    return undefined
  }

  // Clone input and remove the entity ID field
  const idField = ENTITY_ID_FIELDS[entity]
  const { [idField]: _removed, ...proposedData } = toolInput

  return proposedData
}

/**
 * Transform tool input into ChangeRequest format
 * This is the main entry point for all changeset tools
 */
export function transformToolInput(
  entity: EntityType,
  operation: OperationType,
  toolInput: Record<string, any>
): {
  entity: EntityType
  operation: OperationType
  recordId?: number
  proposedData?: Record<string, any>
} {
  const recordId = extractRecordId(entity, operation, toolInput)
  const proposedData = buildProposedData(entity, operation, toolInput)

  return {
    entity,
    operation,
    recordId,
    proposedData,
  }
}

/**
 * Convenience transformers for each entity type
 * These provide type-safe interfaces for specific entities
 */

export const transformTransactionToolInput = (
  operation: OperationType,
  toolInput: Record<string, any>
) => transformToolInput("transaction", operation, toolInput)

export const transformAccountToolInput = (
  operation: OperationType,
  toolInput: Record<string, any>
) => transformToolInput("account", operation, toolInput)

export const transformCategoryToolInput = (
  operation: OperationType,
  toolInput: Record<string, any>
) => transformToolInput("category", operation, toolInput)
