/**
 * Category changeset tools - Type-safe tools for proposing category changes
 * that require user approval before execution.
 */

import { tool } from "ai"
import { z } from "zod"

export const createCategoryChangeRequestTool = tool({
  description:
    "Add a 'create category' request to the current change set. This proposes creating a new category " +
    "for organizing transactions that will be reviewed and approved by the user before execution.",
  inputSchema: z.object({
    // Required fields (matching createCategoryTool)
    category_name: z.string().describe("Name of the category (1-100 characters)"),
    category_type: z.enum(["income", "expense", "transfer"]).describe("Type: income, expense, or transfer"),

    // Optional fields
    category_group: z.string().optional().describe("Optional: Group name for organizing categories (max 50 characters)"),
    color_code: z.string().optional().describe("Optional: Hex color code in format #RRGGBB (e.g., #FF5733)"),
    icon_name: z.string().optional().describe("Optional: Icon identifier (max 50 characters)"),
    is_active: z.boolean().optional().describe("Optional: Whether category is active (default: true)"),
  }),
  // NO execute - client-side tool
})

export const updateCategoryChangeRequestTool = tool({
  description:
    "Add an 'update category' request to the current change set. This proposes modifying an existing category " +
    "that will be reviewed and approved by the user. Only the fields being changed need to be provided (partial update).",
  inputSchema: z.object({
    // Required: category to update
    category_id: z.number().describe("ID of the category to update"),

    // Optional: any fields being updated (matching updateCategoryTool)
    category_name: z.string().optional().describe("Optional: New category name (1-100 characters)"),
    category_type: z.enum(["income", "expense", "transfer"]).optional().describe("Optional: New type"),
    category_group: z.string().optional().describe("Optional: New category group (max 50 characters)"),
    color_code: z.string().optional().describe("Optional: New hex color code in format #RRGGBB"),
    icon_name: z.string().optional().describe("Optional: New icon identifier (max 50 characters)"),
    is_active: z.boolean().optional().describe("Optional: New active status"),
  }),
  // NO execute - client-side tool
})

export const deleteCategoryChangeRequestTool = tool({
  description:
    "Add a 'delete category' request to the current change set. This proposes removing an existing category " +
    "that will be reviewed and approved by the user. Only the category ID is required. " +
    "Note: Deletion will fail if the category is referenced by transactions.",
  inputSchema: z.object({
    category_id: z.number().describe("ID of the category to delete"),
  }),
  // NO execute - client-side tool
})
