/**
 * Category-related AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from "@/lib/api"

export const createCategoryTool = tool({
  description: "Create a new category for organizing transactions with optional group, color code, and icon.",
  inputSchema: z.object({
    category_name: z.string().describe("Name of the category (1-100 characters)"),
    category_type: z.enum(["income", "expense", "transfer"]).describe("Type of category: income, expense, or transfer"),
    category_group: z.string().optional().describe("Optional: Group name for organizing categories (max 50 characters)"),
    color_code: z.string().optional().describe("Optional: Hex color code in format #RRGGBB (e.g., #FF5733)"),
    icon_name: z.string().optional().describe("Optional: Icon identifier (max 50 characters)"),
    is_active: z.boolean().optional().describe("Optional: Whether category is active (default: true)"),
  }),
  execute: async ({ category_name, category_type, category_group, color_code, icon_name, is_active }) => {
    try {
      const category = await createCategory({
        category_name,
        category_type,
        category_group,
        color_code,
        icon_name,
        is_active,
      })
      return category
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getCategoriesTool = tool({
  description: "Retrieve all categories with optional filtering by type, group, or active status. Supports pagination.",
  inputSchema: z.object({
    category_type: z.string().optional().describe("Optional: Filter by category type (income, expense, transfer)"),
    category_group: z.string().optional().describe("Optional: Filter by category group"),
    is_active: z.boolean().optional().describe("Optional: Filter by active status (true/false)"),
    limit: z.number().optional().describe("Optional: Maximum number of categories to return (1-200, default 100)"),
    offset: z.number().optional().describe("Optional: Number of categories to skip for pagination (default 0)"),
  }),
  execute: async ({ category_type, category_group, is_active, limit, offset }) => {
    try {
      const response = await getCategories({
        category_type,
        category_group,
        is_active,
        limit,
        offset,
      })
      return response
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getCategoryTool = tool({
  description: "Get detailed information for a specific category by ID.",
  inputSchema: z.object({
    category_id: z.number().describe("ID of the category to retrieve"),
  }),
  execute: async ({ category_id }) => {
    try {
      const category = await getCategory(category_id)
      return category
    } catch (error) {
      console.error(`Error fetching category ${category_id}:`, error)
      throw new Error(`Failed to fetch category: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const updateCategoryTool = tool({
  description: "Update category details such as name, type, group, color, or active status. Only provided fields will be updated.",
  inputSchema: z.object({
    category_id: z.number().describe("ID of the category to update"),
    category_name: z.string().optional().describe("Optional: New category name (1-100 characters)"),
    category_type: z.enum(["income", "expense", "transfer"]).optional().describe("Optional: New category type"),
    category_group: z.string().optional().describe("Optional: New category group (max 50 characters)"),
    color_code: z.string().optional().describe("Optional: New hex color code in format #RRGGBB"),
    icon_name: z.string().optional().describe("Optional: New icon identifier (max 50 characters)"),
    is_active: z.boolean().optional().describe("Optional: New active status"),
  }),
  execute: async ({ category_id, category_name, category_type, category_group, color_code, icon_name, is_active }) => {
    try {
      const category = await updateCategory(category_id, {
        category_name,
        category_type,
        category_group,
        color_code,
        icon_name,
        is_active,
      })
      return category
    } catch (error) {
      console.error(`Error updating category ${category_id}:`, error)
      throw new Error(`Failed to update category: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const deleteCategoryTool = tool({
  description: "Delete a category by ID. Note: Deletion will fail if the category is referenced by any transactions.",
  inputSchema: z.object({
    category_id: z.number().describe("ID of the category to delete"),
  }),
  execute: async ({ category_id }) => {
    try {
      await deleteCategory(category_id)
      return { success: true, message: `Category ${category_id} deleted successfully` }
    } catch (error) {
      console.error(`Error deleting category ${category_id}:`, error)
      throw new Error(`Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})
