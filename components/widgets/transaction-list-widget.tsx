import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Filter, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  transaction_id: number
  transaction_date: string
  description?: string | null
  amount: number
  transaction_type: "expense" | "income"
  category_id?: number | null
  payee_id?: number | null
  status?: string
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

  // Calculate totals
  const incomeTotal = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const expenseTotal = transactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netTotal = incomeTotal - expenseTotal

  // Check if filters are applied
  const hasFilters = toolArgs && (
    toolArgs.account_id !== undefined ||
    toolArgs.category_id !== undefined ||
    toolArgs.payee_id !== undefined ||
    toolArgs.transaction_type !== undefined ||
    toolArgs.status !== undefined ||
    toolArgs.start_date !== undefined ||
    toolArgs.end_date !== undefined
  )

  // Check if sorting is applied
  const hasSorting = toolArgs && (toolArgs.sort !== undefined || toolArgs.order !== undefined)

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle>Transactions ({transactions.length})</CardTitle>

        {/* Summary */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            Income: ${incomeTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20">
            <TrendingDown className="w-3 h-3 mr-1" />
            Expense: ${expenseTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
          <Badge variant="outline" className={cn(
            "font-semibold",
            netTotal >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          )}>
            Net: ${Math.abs(netTotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
        </div>

        {/* Filter Summary */}
        {hasFilters && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Applied Filters:</p>
              <div className="flex flex-wrap gap-1.5">
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
              </div>
            </div>
          </div>
        )}

        {/* Sort Info */}
        {hasSorting && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpDown className="w-3 h-3" />
            <span>
              Sorted by {toolArgs.sort || "transaction_date"} ({toolArgs.order === "asc" ? "oldest first" : "newest first"})
            </span>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && pagination.total > transactions.length && (
          <div className="text-xs text-muted-foreground">
            Showing {pagination.offset + 1}-{pagination.offset + transactions.length} of {pagination.total} transactions
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-4">
            {transactions.map((transaction) => {
              const date = new Date(transaction.transaction_date)
              const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              const isCredit = transaction.transaction_type === "income"
              const displayAmount = Math.abs(transaction.amount)

              return (
                <div
                  key={transaction.transaction_id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{formattedDate}</span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {transaction.description || "No description"}
                      </span>
                      {transaction.status && (
                        <Badge variant="outline" className="text-xs w-fit capitalize mt-1">
                          {transaction.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold flex-shrink-0 ml-2",
                      isCredit ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
                    )}
                  >
                    {isCredit ? "+" : "-"}${displayAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
