/**
 * Consolidated AI tools export
 */

import { addTransactionTool, getTransactionsTool, updateTransactionTool, deleteTransactionTool, analyzeSpendingTool, getSpendingSummaryTool } from "./transaction.tools"
import { getTableNamesTool, getTableSchemaTool } from "./schema.tools"
import { createAccountTool, getAccountsTool, getAccountTool, updateAccountTool, deleteAccountTool } from "./account.tools"
import { createCategoryTool, getCategoriesTool, getCategoryTool, updateCategoryTool, deleteCategoryTool } from "./category.tools"
import { getAccountTypesTool, getCurrenciesTool } from "./reference.tools"

export const tools = {
  addTransaction: addTransactionTool,
  getTransactions: getTransactionsTool,
  updateTransaction: updateTransactionTool,
  deleteTransaction: deleteTransactionTool,
  analyzeSpending: analyzeSpendingTool,
  getSpendingSummary: getSpendingSummaryTool,
  getTableNames: getTableNamesTool,
  getTableSchema: getTableSchemaTool,
  createAccount: createAccountTool,
  getAccounts: getAccountsTool,
  getAccount: getAccountTool,
  updateAccount: updateAccountTool,
  deleteAccount: deleteAccountTool,
  createCategory: createCategoryTool,
  getCategories: getCategoriesTool,
  getCategory: getCategoryTool,
  updateCategory: updateCategoryTool,
  deleteCategory: deleteCategoryTool,
  getAccountTypes: getAccountTypesTool,
  getCurrencies: getCurrenciesTool,
}
