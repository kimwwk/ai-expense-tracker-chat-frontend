/**
 * Mock backend — seed fixtures
 * ----------------------------------------------------------------------------
 * Realistic, deterministic seed data that mirrors the shapes returned by the
 * real `ai-expense-tracker-service` API. Everything here is pure data: no
 * state, no side effects. The mutable in-memory store (see `./router`) clones
 * these on startup so a demo session can create/update/delete freely without
 * mutating the seed itself.
 *
 * Dates are generated relative to "today" so the demo always looks current —
 * salary lands on the 1st, rent on the 3rd, groceries weekly, etc. Future-
 * dated entries (later this month) are pruned so the ledger never shows
 * transactions that "haven't happened yet".
 */

import type { Account } from "../accounts"
import type { Category } from "../categories"
import type { Transaction } from "../transactions"
import type { AccountType, Currency } from "../reference"
import type { TableSchema } from "../schema"

// --- date helpers (timezone-safe, no UTC drift) ------------------------------

/** Format a Date as a local `YYYY-MM-DD` string (avoids toISOString TZ shifts). */
function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** A calendar date `monthsAgo` months back, on the given day-of-month. */
function monthDay(monthsAgo: number, day: number): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - monthsAgo, day)
}

/** Deterministic ±n% nudge so recurring amounts don't look copy-pasted. */
function vary(base: number, seed: number): number {
  const pct = (((seed * 37) % 11) - 5) / 100 // stable in [-5%, +5%]
  return Math.round(base * (1 + pct) * 100) / 100
}

const NOW_ISO = new Date().toISOString()

// --- reference data ----------------------------------------------------------

export const CURRENCIES: Currency[] = [
  { currency_code: "USD", currency_name: "US Dollar", currency_symbol: "$", decimal_places: 2, is_active: true },
  { currency_code: "EUR", currency_name: "Euro", currency_symbol: "€", decimal_places: 2, is_active: true },
  { currency_code: "GBP", currency_name: "British Pound", currency_symbol: "£", decimal_places: 2, is_active: true },
  { currency_code: "CAD", currency_name: "Canadian Dollar", currency_symbol: "$", decimal_places: 2, is_active: true },
  { currency_code: "JPY", currency_name: "Japanese Yen", currency_symbol: "¥", decimal_places: 0, is_active: false },
]

export const ACCOUNT_TYPES: AccountType[] = [
  { account_type_id: 1, type_name: "Checking", description: "Everyday spending account", is_asset: true },
  { account_type_id: 2, type_name: "Savings", description: "Interest-bearing savings", is_asset: true },
  { account_type_id: 3, type_name: "Credit Card", description: "Revolving credit line", is_asset: false },
  { account_type_id: 4, type_name: "Cash", description: "Physical cash on hand", is_asset: true },
  { account_type_id: 5, type_name: "Investment", description: "Brokerage / investment account", is_asset: true },
]

export const ACCOUNTS: Account[] = [
  account(1, 1, "Everyday Checking", "Northwind Bank", "4820.55", "0.00", null),
  account(2, 2, "Emergency Savings", "Northwind Bank", "15200.00", "15000.00", null),
  account(3, 3, "Travel Rewards Card", "Aurora Financial", "-1243.67", "0.00", "8000.00"),
  account(4, 4, "Cash Wallet", null, "180.00", "200.00", null),
]

function account(
  id: number,
  typeId: number,
  name: string,
  institution: string | null,
  current: string,
  opening: string,
  creditLimit: string | null,
): Account {
  return {
    account_id: id,
    account_type_id: typeId,
    account_name: name,
    account_number: institution ? `****${1000 + id}` : null,
    institution_name: institution,
    currency_code: "USD",
    opening_balance: opening,
    current_balance: current,
    credit_limit: creditLimit,
    is_closed: false,
    notes: null,
    opening_balance_date: ymd(monthDay(6, 1)),
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  }
}

export const CATEGORIES: Category[] = [
  category(1, "Salary", "income", "Income", "#16a34a", "wallet"),
  category(2, "Freelance", "income", "Income", "#22c55e", "briefcase"),
  category(3, "Groceries", "expense", "Food & Drink", "#f97316", "shopping-cart"),
  category(4, "Dining Out", "expense", "Food & Drink", "#fb923c", "utensils"),
  category(5, "Rent", "expense", "Housing", "#ef4444", "home"),
  category(6, "Utilities", "expense", "Housing", "#f43f5e", "zap"),
  category(7, "Transport", "expense", "Transport", "#3b82f6", "car"),
  category(8, "Entertainment", "expense", "Lifestyle", "#a855f7", "film"),
  category(9, "Shopping", "expense", "Lifestyle", "#ec4899", "shopping-bag"),
  category(10, "Health", "expense", "Health", "#14b8a6", "heart-pulse"),
  category(11, "Subscriptions", "expense", "Lifestyle", "#8b5cf6", "repeat"),
]

function category(
  id: number,
  name: string,
  type: string,
  group: string,
  color: string,
  icon: string,
): Category {
  return {
    category_id: id,
    category_name: name,
    category_type: type,
    category_group: group,
    color_code: color,
    icon_name: icon,
    is_active: true,
    created_at: NOW_ISO,
  }
}

/**
 * Payees aren't exposed by a dedicated endpoint, but transactions reference
 * them and the analytics "breakdown by payee" needs human-readable labels.
 */
export const PAYEES: Record<number, string> = {
  1: "Acme Corp (Payroll)",
  2: "Whole Foods Market",
  3: "Blue Bottle Coffee",
  4: "Maple Grove Properties",
  5: "City Power & Water",
  6: "Uber",
  7: "Netflix",
  8: "Amazon",
  9: "Shell",
  10: "The Corner Bistro",
  11: "Pharmacy Plus",
  12: "Freelance Client",
}

// --- transactions ------------------------------------------------------------

/**
 * One recurring transaction template. `seedTransactions()` expands each across
 * the last few months, pruning anything dated in the future.
 */
interface Recurring {
  day: number
  accountId: number
  categoryId: number
  payeeId: number
  type: "income" | "expense"
  amount: number
  description: string
  monthsBack?: number[] // default: [2, 1, 0]
}

const RECURRING: Recurring[] = [
  { day: 1, accountId: 1, categoryId: 1, payeeId: 1, type: "income", amount: 5500, description: "Monthly salary" },
  { day: 3, accountId: 1, categoryId: 5, payeeId: 4, type: "expense", amount: 1800, description: "Rent payment" },
  { day: 8, accountId: 1, categoryId: 6, payeeId: 5, type: "expense", amount: 135, description: "Electricity & water" },
  { day: 12, accountId: 3, categoryId: 11, payeeId: 7, type: "expense", amount: 15.49, description: "Netflix subscription" },
  { day: 5, accountId: 1, categoryId: 3, payeeId: 2, type: "expense", amount: 92.4, description: "Weekly groceries" },
  { day: 12, accountId: 1, categoryId: 3, payeeId: 2, type: "expense", amount: 78.15, description: "Weekly groceries" },
  { day: 19, accountId: 1, categoryId: 3, payeeId: 2, type: "expense", amount: 110.3, description: "Weekly groceries" },
  { day: 26, accountId: 1, categoryId: 3, payeeId: 2, type: "expense", amount: 64.5, description: "Weekly groceries" },
  { day: 6, accountId: 3, categoryId: 4, payeeId: 3, type: "expense", amount: 5.75, description: "Morning coffee" },
  { day: 14, accountId: 3, categoryId: 4, payeeId: 3, type: "expense", amount: 6.25, description: "Morning coffee" },
  { day: 10, accountId: 3, categoryId: 4, payeeId: 10, type: "expense", amount: 48.2, description: "Dinner out" },
  { day: 24, accountId: 3, categoryId: 4, payeeId: 10, type: "expense", amount: 63.9, description: "Dinner out" },
  { day: 7, accountId: 3, categoryId: 7, payeeId: 6, type: "expense", amount: 22.5, description: "Ride share" },
  { day: 18, accountId: 1, categoryId: 7, payeeId: 9, type: "expense", amount: 54.1, description: "Fuel" },
  { day: 16, accountId: 3, categoryId: 9, payeeId: 8, type: "expense", amount: 129.99, description: "Online order" },
  { day: 20, accountId: 4, categoryId: 10, payeeId: 11, type: "expense", amount: 34.2, description: "Pharmacy" },
  { day: 22, accountId: 3, categoryId: 8, payeeId: 8, type: "expense", amount: 27.0, description: "Streaming rental" },
  // Freelance income only in the two most recent months.
  { day: 15, accountId: 1, categoryId: 2, payeeId: 12, type: "income", amount: 950, description: "Freelance invoice", monthsBack: [1, 0] },
]

/** Expand the recurring templates into a concrete, dated transaction ledger. */
export function seedTransactions(): Transaction[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const out: Transaction[] = []
  let id = 1

  for (const r of RECURRING) {
    for (const m of r.monthsBack ?? [2, 1, 0]) {
      const date = monthDay(m, r.day)
      if (date > today) continue // skip transactions that "haven't happened yet"

      out.push({
        transaction_id: id++,
        account_id: r.accountId,
        category_id: r.categoryId,
        payee_id: r.payeeId,
        transaction_date: ymd(date),
        amount: vary(r.amount, r.day + m + r.categoryId),
        transaction_type: r.type,
        description: r.description,
        status: "cleared",
        created_at: NOW_ISO,
        updated_at: NOW_ISO,
      })
    }
  }

  // Newest first — matches the API's default sort (transaction_date desc).
  return out.sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
}

// --- schema introspection ----------------------------------------------------

export const TABLE_NAMES = ["transactions", "accounts", "categories", "payees", "account_types", "currencies"]

export const TABLE_SCHEMAS: Record<string, TableSchema> = {
  transactions: {
    table_name: "transactions",
    columns: [
      col("transaction_id", "integer", false, true),
      col("account_id", "integer", false, false, "accounts.account_id"),
      col("category_id", "integer", true, false, "categories.category_id"),
      col("payee_id", "integer", true, false, "payees.payee_id"),
      col("transaction_date", "date", false),
      col("amount", "numeric", false),
      col("transaction_type", "varchar", false),
      col("status", "varchar", true),
      col("description", "text", true),
    ],
  },
  accounts: {
    table_name: "accounts",
    columns: [
      col("account_id", "integer", false, true),
      col("account_type_id", "integer", false, false, "account_types.account_type_id"),
      col("account_name", "varchar", false),
      col("currency_code", "varchar", false, false, "currencies.currency_code"),
      col("current_balance", "numeric", false),
    ],
  },
  categories: {
    table_name: "categories",
    columns: [
      col("category_id", "integer", false, true),
      col("category_name", "varchar", false),
      col("category_type", "varchar", false),
      col("category_group", "varchar", true),
    ],
  },
}

function col(
  name: string,
  type: string,
  nullable: boolean,
  pk = false,
  fk: string | null = null,
): TableSchema["columns"][number] {
  return {
    column_name: name,
    data_type: type,
    is_nullable: nullable,
    column_default: null,
    primary_key: pk,
    foreign_key: fk,
    unique: pk,
  }
}
