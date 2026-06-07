/**
 * Mock backend — request router
 * ----------------------------------------------------------------------------
 * Turns a parsed (method, path, query, body) request into the same JSON shape
 * the real service returns. It owns a small in-memory store seeded from
 * `./fixtures`, so reads are always consistent and writes (create / update /
 * delete) work within a session.
 *
 * ⚠️ Serverless note: on Vercel each function instance keeps its own copy of
 * this module-level store. Reads are always correct (re-seeded on cold start),
 * but a write only persists for the lifetime of that warm instance — it is not
 * shared across instances and resets on cold start. That's the expected
 * trade-off for a backend-less demo; swap `NEXT_PUBLIC_USE_MOCK_API=false` and
 * point at the real service for durable persistence.
 */

import {
  ACCOUNTS,
  ACCOUNT_TYPES,
  CATEGORIES,
  CURRENCIES,
  PAYEES,
  TABLE_NAMES,
  TABLE_SCHEMAS,
  seedTransactions,
} from "./fixtures"
import type { Account } from "../accounts"
import type { Category } from "../categories"
import type { Transaction } from "../transactions"

type Query = Record<string, string>
type Json = Record<string, unknown>

// --- in-memory store (seeded once per instance) ------------------------------

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

const store = {
  accounts: clone(ACCOUNTS) as Account[],
  categories: clone(CATEGORIES) as Category[],
  transactions: seedTransactions(),
}

const nextId = (rows: { [k: string]: unknown }[], key: string) =>
  rows.reduce((max, r) => Math.max(max, Number(r[key]) || 0), 0) + 1

// --- small helpers -----------------------------------------------------------

const num = (q: Query, k: string) => (q[k] != null ? Number(q[k]) : undefined)
const NOW_ISO = () => new Date().toISOString()

/** Analytics and summaries ignore transfers, mirroring the real service. */
const spendable = (t: Transaction) => t.transaction_type !== "transfer"

function paginate<T>(rows: T[], q: Query) {
  const limit = num(q, "limit") ?? 50
  const offset = num(q, "offset") ?? 0
  return { page: rows.slice(offset, offset + limit), limit, offset, total: rows.length }
}

// --- transactions ------------------------------------------------------------

function listTransactions(q: Query) {
  let rows = store.transactions.filter((t) => {
    if (q.account_id && t.account_id !== num(q, "account_id")) return false
    if (q.category_id && t.category_id !== num(q, "category_id")) return false
    if (q.payee_id && t.payee_id !== num(q, "payee_id")) return false
    if (q.transaction_type && t.transaction_type !== q.transaction_type) return false
    if (q.status && t.status !== q.status) return false
    if (q.start_date && t.transaction_date < q.start_date) return false
    if (q.end_date && t.transaction_date > q.end_date) return false
    return true
  })

  const sort = (q.sort as keyof Transaction) || "transaction_date"
  const dir = q.order === "asc" ? 1 : -1
  rows = [...rows].sort((a, b) => {
    const av = a[sort] as string | number
    const bv = b[sort] as string | number
    return av < bv ? -dir : av > bv ? dir : 0
  })

  const { page, limit, offset, total } = paginate(rows, q)
  return { data: page, total, limit, offset }
}

function createTransaction(body: Json): Transaction {
  const tx: Transaction = {
    transaction_id: nextId(store.transactions as unknown as Json[], "transaction_id"),
    account_id: Number(body.account_id),
    category_id: (body.category_id as number) ?? null,
    payee_id: (body.payee_id as number) ?? null,
    transaction_date: String(body.transaction_date),
    amount: Number(body.amount),
    transaction_type: (body.transaction_type as Transaction["transaction_type"]) ?? "expense",
    description: (body.description as string) ?? null,
    status: (body.status as string) ?? "cleared",
    created_at: NOW_ISO(),
    updated_at: NOW_ISO(),
  }
  store.transactions.unshift(tx)
  return tx
}

function updateTransaction(id: number, body: Json): Transaction {
  const tx = store.transactions.find((t) => t.transaction_id === id)
  if (!tx) throw notFound(`transaction ${id}`)
  Object.assign(tx, body, { transaction_id: id, updated_at: NOW_ISO() })
  return tx
}

function deleteTransaction(id: number): void {
  store.transactions = store.transactions.filter((t) => t.transaction_id !== id)
}

// --- accounts & categories (generic CRUD) ------------------------------------

function listAccounts(q: Query) {
  let rows = store.accounts
  if (q.account_type_id) rows = rows.filter((a) => a.account_type_id === num(q, "account_type_id"))
  if (q.currency_code) rows = rows.filter((a) => a.currency_code === q.currency_code)
  if (q.is_closed) rows = rows.filter((a) => a.is_closed === (q.is_closed === "true"))
  const { page, limit, offset, total } = paginate(rows, q)
  return { data: page, pagination: { limit, offset, total } }
}

function listCategories(q: Query) {
  let rows = store.categories
  if (q.category_type) rows = rows.filter((c) => c.category_type === q.category_type)
  if (q.category_group) rows = rows.filter((c) => c.category_group === q.category_group)
  if (q.is_active) rows = rows.filter((c) => c.is_active === (q.is_active === "true"))
  const { page, limit, offset, total } = paginate(rows, q)
  return { data: page, pagination: { limit, offset, total } }
}

// --- analytics ---------------------------------------------------------------

function analyticsFilter(q: Query) {
  return store.transactions.filter((t) => {
    if (!spendable(t)) return false
    if (q.transaction_type && t.transaction_type !== q.transaction_type) return false
    if (q.category_id && t.category_id !== num(q, "category_id")) return false
    if (q.account_id && t.account_id !== num(q, "account_id")) return false
    if (q.payee_id && t.payee_id !== num(q, "payee_id")) return false
    if (q.start_date && t.transaction_date < q.start_date) return false
    if (q.end_date && t.transaction_date > q.end_date) return false
    return true
  })
}

function summary(q: Query) {
  const rows = analyticsFilter(q)
  const total = Math.round(rows.reduce((s, t) => s + t.amount, 0) * 100) / 100
  return { total, count: rows.length }
}

function breakdown(q: Query) {
  const rows = analyticsFilter(q)
  const dimension = q.dimension || "category"
  const metric = q.metric || "sum"

  const label = (t: Transaction): string => {
    if (dimension === "payee") return PAYEES[t.payee_id ?? -1] ?? "Uncategorized"
    if (dimension === "account")
      return store.accounts.find((a) => a.account_id === t.account_id)?.account_name ?? "Unknown"
    return store.categories.find((c) => c.category_id === t.category_id)?.category_name ?? "Uncategorized"
  }

  const groups = new Map<string, number>()
  for (const t of rows) {
    const key = label(t)
    groups.set(key, (groups.get(key) ?? 0) + (metric === "count" ? 1 : t.amount))
  }

  const sorted = [...groups.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(([l]) => l),
    values: sorted.map(([, v]) => Math.round(v * 100) / 100),
  }
}

function trend(q: Query) {
  const rows = analyticsFilter(q)
  const grain = q.time_grain || "month"

  // Bucket key per grain: month -> YYYY-MM, week -> ISO-ish YYYY-Www, day -> YYYY-MM-DD.
  const bucket = (date: string): string => {
    if (grain === "day") return date
    if (grain === "week") {
      const d = new Date(date)
      const onejan = new Date(d.getFullYear(), 0, 1)
      const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7)
      return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`
    }
    return date.slice(0, 7)
  }

  const groups = new Map<string, number>()
  for (const t of rows) {
    const key = bucket(t.transaction_date)
    groups.set(key, (groups.get(key) ?? 0) + t.amount)
  }

  const sorted = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  return {
    dates: sorted.map(([d]) => d),
    values: sorted.map(([, v]) => Math.round(v * 100) / 100),
  }
}

// --- dispatch ----------------------------------------------------------------

function notFound(what: string): Error {
  return new Error(`API request failed: Not Found (mock: ${what})`)
}

/**
 * Route a single request to its handler. `path` is the endpoint without query
 * string (e.g. "/transactions/42"); `query` is the parsed search params.
 * Returns the response payload, or `undefined` for 204-style (delete) replies.
 */
export function dispatch(method: string, path: string, query: Query, body: Json): unknown {
  const segments = path.split("/").filter(Boolean) // ["transactions", "42"]
  const [root, id, sub] = segments
  const idNum = id ? Number(id) : undefined

  switch (root) {
    case "transactions":
      if (method === "GET" && idNum == null) return listTransactions(query)
      if (method === "POST") return createTransaction(body)
      if (method === "PATCH" && idNum != null) return updateTransaction(idNum, body)
      if (method === "DELETE" && idNum != null) return deleteTransaction(idNum)
      break

    case "accounts":
      if (method === "GET" && idNum == null) return listAccounts(query)
      if (method === "GET" && idNum != null) {
        const acc = store.accounts.find((a) => a.account_id === idNum)
        if (!acc) throw notFound(`account ${idNum}`)
        return acc
      }
      if (method === "POST") {
        const acc = makeAccount(body)
        store.accounts.push(acc)
        return acc
      }
      if (method === "PATCH" && idNum != null) {
        const acc = store.accounts.find((a) => a.account_id === idNum)
        if (!acc) throw notFound(`account ${idNum}`)
        Object.assign(acc, body, { account_id: idNum, updated_at: NOW_ISO() })
        return acc
      }
      if (method === "DELETE" && idNum != null) {
        store.accounts = store.accounts.filter((a) => a.account_id !== idNum)
        return undefined
      }
      break

    case "categories":
      if (method === "GET" && idNum == null) return listCategories(query)
      if (method === "GET" && idNum != null) {
        const cat = store.categories.find((c) => c.category_id === idNum)
        if (!cat) throw notFound(`category ${idNum}`)
        return cat
      }
      if (method === "POST") {
        const cat = makeCategory(body)
        store.categories.push(cat)
        return cat
      }
      if (method === "PATCH" && idNum != null) {
        const cat = store.categories.find((c) => c.category_id === idNum)
        if (!cat) throw notFound(`category ${idNum}`)
        Object.assign(cat, body, { category_id: idNum })
        return cat
      }
      if (method === "DELETE" && idNum != null) {
        store.categories = store.categories.filter((c) => c.category_id !== idNum)
        return undefined
      }
      break

    case "analytics":
      if (id === "summary") return summary(query)
      if (id === "breakdown") return breakdown(query)
      if (id === "trend") return trend(query)
      break

    case "reference":
      if (id === "account-types") return ACCOUNT_TYPES
      if (id === "currencies")
        return query.active_only === "true" ? CURRENCIES.filter((c) => c.is_active) : CURRENCIES
      break

    case "schema":
      if (id === "tables" && !sub) return TABLE_NAMES
      if (id === "tables" && sub) {
        const schema = TABLE_SCHEMAS[sub]
        if (!schema) throw notFound(`schema for table ${sub}`)
        return schema
      }
      break
  }

  throw notFound(`${method} ${path}`)
}

// --- create helpers ----------------------------------------------------------

function makeAccount(body: Json): Account {
  const opening = String(body.opening_balance ?? "0.00")
  return {
    account_id: nextId(store.accounts as unknown as Json[], "account_id"),
    account_type_id: Number(body.account_type_id),
    account_name: String(body.account_name),
    account_number: (body.account_number as string) ?? null,
    institution_name: (body.institution_name as string) ?? null,
    currency_code: (body.currency_code as string) ?? "USD",
    opening_balance: opening,
    current_balance: opening,
    credit_limit: body.credit_limit != null ? String(body.credit_limit) : null,
    is_closed: Boolean(body.is_closed ?? false),
    notes: (body.notes as string) ?? null,
    opening_balance_date: (body.opening_balance_date as string) ?? new Date().toISOString().slice(0, 10),
    created_at: NOW_ISO(),
    updated_at: NOW_ISO(),
  }
}

function makeCategory(body: Json): Category {
  return {
    category_id: nextId(store.categories as unknown as Json[], "category_id"),
    category_name: String(body.category_name),
    category_type: String(body.category_type),
    category_group: (body.category_group as string) ?? null,
    color_code: (body.color_code as string) ?? null,
    icon_name: (body.icon_name as string) ?? null,
    is_active: Boolean(body.is_active ?? true),
    created_at: NOW_ISO(),
  }
}
