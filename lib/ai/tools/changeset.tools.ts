import { tool } from "ai"
import { z } from "zod"

export const addChangeRequestTool = tool({
  description:
    "Add a single change request to the current change set. Call this multiple times to build up related changes before calling confirmChangeSet. " +
    "IMPORTANT: For 'create' operations, proposedData MUST contain all required fields for the entity. " +
    "For 'update' operations, proposedData should contain only the fields being changed. " +
    "For 'delete' operations, only recordId is needed. " +
    "Example for create transaction: proposedData must include {account_id, transaction_type, amount, currency_code, base_amount, transaction_date, etc.}",
  inputSchema: z.object({
    entity: z
      .enum(["transaction", "account", "category", "budget_rule"])
      .describe("Entity type: transaction, account, category, or budget_rule"),
    operation: z
      .enum(["create", "update", "delete"])
      .describe("Operation type: create (new record), update (modify existing), or delete (remove existing)"),
    recordId: z
      .number()
      .optional()
      .describe("Record ID: REQUIRED for update/delete operations, OMIT for create operations"),
    proposedData: z
      .record(z.any())
      .optional()
      .describe(
        "Data payload: " +
        "For CREATE - REQUIRED, must include ALL required fields for the entity (e.g., for transaction: account_id, transaction_type, amount, currency_code, base_amount, transaction_date). " +
        "For UPDATE - REQUIRED, include only the fields being changed. " +
        "For DELETE - OPTIONAL/not needed, recordId is sufficient."
      ),
  }),
  // NO execute - client-side tool
})

export const confirmChangeSetTool = tool({
  description:
    "Present the accumulated change set to the user for review and approval. Call this after all changes have been added via addChangeRequest.",
  inputSchema: z.object({
    title: z.string().optional().describe("Optional title for the change set"),
    description: z.string().optional().describe("Optional description explaining the changes"),
  }),
  // NO execute - client-side tool, triggers approval widget
})

export const resetChangeSetTool = tool({
  description:
    "Clear all accumulated changes and start a fresh change set. Use this if the user wants to discard the current proposal.",
  inputSchema: z.object({}),
  // NO execute - client-side tool
})
