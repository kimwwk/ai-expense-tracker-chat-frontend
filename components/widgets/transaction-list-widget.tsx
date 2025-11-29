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

  // Check if any parameters were used
  const hasParameters = !!toolArgs

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
