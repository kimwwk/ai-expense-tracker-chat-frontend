/**
 * Consolidated AI tools export
 */

import { addTransactionTool, getTransactionsTool, updateTransactionTool, deleteTransactionTool, analyzeSpendingTool, getSpendingSummaryTool } from "./transaction.tools"
import { getTableNamesTool, getTableSchemaTool } from "./schema.tools"
import { createAccountTool, getAccountsTool, getAccountTool, updateAccountTool, deleteAccountTool } from "./account.tools"
import { createCategoryTool, getCategoriesTool, getCategoryTool, updateCategoryTool, deleteCategoryTool } from "./category.tools"
import { getAccountTypesTool, getCurrenciesTool } from "./reference.tools"
import { confirmChangeSetTool, resetChangeSetTool } from "./changeset.tools"

// Import new entity-specific changeset tools
import {
  createTransactionChangeRequestTool,
  updateTransactionChangeRequestTool,
  deleteTransactionChangeRequestTool,
} from "./changeset.transaction.tools"
import {
  createAccountChangeRequestTool,
  updateAccountChangeRequestTool,
  deleteAccountChangeRequestTool,
} from "./changeset.account.tools"
import {
  createCategoryChangeRequestTool,
  updateCategoryChangeRequestTool,
  deleteCategoryChangeRequestTool,
} from "./changeset.category.tools"

export const tools = {
  // Transaction CRUD
  // addTransaction: addTransactionTool,  // Commented out - use direct tool or changeset
  getTransactions: getTransactionsTool,
  updateTransaction: updateTransactionTool,
  deleteTransaction: deleteTransactionTool,
  analyzeSpending: analyzeSpendingTool,
  getSpendingSummary: getSpendingSummaryTool,

  // Account CRUD
  createAccount: createAccountTool,
  getAccounts: getAccountsTool,
  getAccount: getAccountTool,
  updateAccount: updateAccountTool,
  deleteAccount: deleteAccountTool,

  // Category CRUD
  createCategory: createCategoryTool,
  getCategories: getCategoriesTool,
  getCategory: getCategoryTool,
  updateCategory: updateCategoryTool,
  deleteCategory: deleteCategoryTool,

  // Reference data
  getAccountTypes: getAccountTypesTool,
  getCurrencies: getCurrenciesTool,

  // Schema introspection
  getTableNames: getTableNamesTool,
  getTableSchema: getTableSchemaTool,

  // Changeset tools - Entity-specific (type-safe)
  createTransactionChangeRequest: createTransactionChangeRequestTool,
  updateTransactionChangeRequest: updateTransactionChangeRequestTool,
  deleteTransactionChangeRequest: deleteTransactionChangeRequestTool,

  createAccountChangeRequest: createAccountChangeRequestTool,
  updateAccountChangeRequest: updateAccountChangeRequestTool,
  deleteAccountChangeRequest: deleteAccountChangeRequestTool,

  createCategoryChangeRequest: createCategoryChangeRequestTool,
  updateCategoryChangeRequest: updateCategoryChangeRequestTool,
  deleteCategoryChangeRequest: deleteCategoryChangeRequestTool,

  // Changeset management
  confirmChangeSet: confirmChangeSetTool,
  resetChangeSet: resetChangeSetTool,
  // addChangeRequest: addChangeRequestTool,  // DEPRECATED - replaced by entity-specific tools above
}
