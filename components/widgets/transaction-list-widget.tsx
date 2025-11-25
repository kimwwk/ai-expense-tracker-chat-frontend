import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
}

export function TransactionListWidget({ data }: TransactionListWidgetProps) {
  // Handle both array format and paginated response format
  const transactions = Array.isArray(data) ? data : data.data

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">No transactions available</p>
      </div>
    )
  }

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>Recent Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1 p-4">
            {transactions.map((transaction) => {
              const date = new Date(transaction.transaction_date)
              const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              const isCredit = transaction.transaction_type === "income"
              const displayAmount = Math.abs(transaction.amount)

              return (
                <div
                  key={transaction.transaction_id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-sm text-muted-foreground w-16 flex-shrink-0">{formattedDate}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {transaction.description || "No description"}
                      </span>
                      {transaction.category_id && (
                        <span className="text-xs text-muted-foreground">Category: {transaction.category_id}</span>
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
