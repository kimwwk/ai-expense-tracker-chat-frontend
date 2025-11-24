/**
 * Schema-related AI tools
 */

import { tool } from "ai"
import { z } from "zod"
import { getTableNames, getTableSchema } from "@/lib/api/schema"

export const getTableNamesTool = tool({
  description: "Get a list of all database table names. Useful for understanding the database structure.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const tableNames = await getTableNames()
      return {
        tables: tableNames,
        count: tableNames.length,
      }
    } catch (error) {
      console.error("Error fetching table names:", error)
      throw new Error(`Failed to fetch table names: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
})

export const getTableSchemaTool = tool({
  description:
    "Get detailed schema information for a specific table including columns, data types, and constraints.",
  inputSchema: z.object({
    tableName: z.string().describe("Name of the table to get schema information for"),
  }),
  execute: async ({ tableName }) => {
    try {
      const schema = await getTableSchema(tableName)
      return {
        tableName: schema.table_name,
        columns: schema.columns.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable,
          default: col.column_default,
          isPrimaryKey: col.primary_key,
          foreignKey: col.foreign_key,
          isUnique: col.unique,
        })),
        columnCount: schema.columns.length,
      }
    } catch (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error)
      throw new Error(
        `Failed to fetch schema for table ${tableName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  },
})
