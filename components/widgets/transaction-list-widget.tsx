import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, ArrowUpDown, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  transaction_id: number
  transaction_date: string
  description?: string | null
  amount: number
  transaction_type: "expense" | "income" | "transfer"
  category_id?: number | null
  category_name?: string | null
  category_color?: string | null
  payee_id?: number | null
  status?: string
  currency_code?: string
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

interface TransactionListWidgetProps {
  data: Transaction[] | { data: Transaction[]; total: number; limit: number; offset: number }
  toolArgs?: {
    account_id?: number
    category_id?: number
    payee_id?: number
    transaction_type?: "expense" | "income"
    status?: string
    start_date?: string
    end_date?: string
    sort?: string
    order?: "asc" | "desc"
    limit?: number
    offset?: number
  }
}

export function TransactionListWidget({ data, toolArgs }: TransactionListWidgetProps) {
  // Handle both array format and paginated response format
  const transactions = Array.isArray(data) ? data : data.data
  const pagination = Array.isArray(data) ? null : { total: data.total, limit: data.limit, offset: data.offset }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">No transactions available</p>
      </div>
    )
  }

  // Check if any parameters were used
  const hasParameters = !!toolArgs

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Transactions ({transactions.length})</CardTitle>
        </div>

        {/* Query Parameters */}
        {hasParameters && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Query Parameters:</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Filters */}
                {toolArgs.account_id !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Account ID: {toolArgs.account_id}
                  </Badge>
                )}
                {toolArgs.category_id !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Category ID: {toolArgs.category_id}
                  </Badge>
                )}
                {toolArgs.payee_id !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Payee ID: {toolArgs.payee_id}
                  </Badge>
                )}
                {toolArgs.transaction_type && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    Type: {toolArgs.transaction_type}
                  </Badge>
                )}
                {toolArgs.status && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    Status: {toolArgs.status}
                  </Badge>
                )}
                {toolArgs.start_date && (
                  <Badge variant="secondary" className="text-xs">
                    From: {toolArgs.start_date}
                  </Badge>
                )}
                {toolArgs.end_date && (
                  <Badge variant="secondary" className="text-xs">
                    To: {toolArgs.end_date}
                  </Badge>
                )}

                {/* Sort */}
                {toolArgs.sort && (
                  <Badge variant="outline" className="text-xs">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    Sort: {toolArgs.sort}
                  </Badge>
                )}
                {toolArgs.order && (
                  <Badge variant="outline" className="text-xs">
                    Order: {toolArgs.order === "asc" ? "Ascending" : "Descending"}
                  </Badge>
                )}

                {/* Pagination */}
                {toolArgs.limit !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Limit: {toolArgs.limit}
                  </Badge>
                )}
                {toolArgs.offset !== undefined && toolArgs.offset > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Offset: {toolArgs.offset}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Summary */}
        {pagination && pagination.total > transactions.length && (
          <div className="text-xs text-muted-foreground">
            Showing {pagination.offset + 1}-{pagination.offset + transactions.length} of {pagination.total} total
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1 px-3">
        {transactions.map((transaction) => {
          const type = transaction.transaction_type
          const amount = Math.abs(transaction.amount)

          // Determine icon and color based on type
          let icon
          let iconColor
          if (type === "income") {
            icon = <ArrowUpRight className="size-4 text-green-600" />
            iconColor = "text-green-600"
          } else if (type === "transfer") {
            icon = <ArrowLeftRight className="size-4 text-blue-600" />
            iconColor = "text-blue-600"
          } else {
            icon = <ArrowDownLeft className="size-4 text-red-600" />
            iconColor = "text-red-600"
          }

          return (
            <div
              key={transaction.transaction_id}
              className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                {/* Left: Icon */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  {icon}
                </div>

                {/* Middle: Main Info */}
                <div className="min-w-0 flex-1">
                  {/* Primary line: Description only */}
                  <p className="truncate font-medium text-sm leading-tight">
                    {transaction.description || "No description"}
                  </p>

                  {/* Secondary line: Date + Category */}
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <time dateTime={transaction.transaction_date}>
                      {formatDate(transaction.transaction_date)}
                    </time>
                    {transaction.category_name && (
                      <Badge
                        variant="outline"
                        className="h-4 border-0 px-1.5 text-[10px] font-normal"
                        style={{
                          backgroundColor: transaction.category_color ? `${transaction.category_color}15` : undefined,
                          color: transaction.category_color || undefined,
                        }}
                      >
                        {transaction.category_name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Right: Amount */}
                <div className="shrink-0 text-right">
                  <p className={cn("whitespace-nowrap font-semibold text-sm tabular-nums", iconColor)}>
                    {type === "income" && "+"}
                    {type === "expense" && "−"}
                    {formatCurrency(amount, transaction.currency_code)}
                  </p>
                  {transaction.status && (
                    <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">{transaction.status}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
