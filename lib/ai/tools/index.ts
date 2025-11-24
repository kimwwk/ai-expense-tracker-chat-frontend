/**
 * Consolidated AI tools export
 */

import { addTransactionTool, getTransactionsTool, analyzeSpendingTool, getSpendingSummaryTool } from "./transaction.tools"
import { getTableNamesTool, getTableSchemaTool } from "./schema.tools"

export const tools = {
  addTransaction: addTransactionTool,
  getTransactions: getTransactionsTool,
  analyzeSpending: analyzeSpendingTool,
  getSpendingSummary: getSpendingSummaryTool,
  getTableNames: getTableNamesTool,
  getTableSchema: getTableSchemaTool,
}
