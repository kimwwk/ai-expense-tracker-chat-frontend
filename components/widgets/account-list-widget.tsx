import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Building2, PiggyBank, Landmark, FileText, Filter, TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Account {
  account_id: number
  account_type_id: number
  account_name: string
  account_number: string | null
  institution_name: string | null
  currency_code: string
  opening_balance: string
  current_balance: string
  credit_limit: string | null
  is_closed: boolean
  notes: string | null
  opening_balance_date: string
  created_at: string
  updated_at: string
}

// Map account type IDs to icons and names
const accountTypeInfo: Record<number, { icon: LucideIcon; name: string }> = {
  1: { icon: Landmark, name: "Checking" },
  2: { icon: PiggyBank, name: "Savings" },
  3: { icon: CreditCard, name: "Credit Card" },
  4: { icon: Wallet, name: "Cash" },
  5: { icon: Building2, name: "Investment" },
  6: { icon: FileText, name: "Loan" },
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Math.abs(amount))
}

function CreditUtilization({ balance, limit }: { balance: number; limit: number }) {
  const used = Math.abs(balance)
  const percentage = Math.min((used / limit) * 100, 100)

  let colorClass = "bg-green-500"
  if (percentage > 30) colorClass = "bg-amber-500"
  if (percentage > 70) colorClass = "bg-red-500"

  return (
    <div className="mt-1.5">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>Credit used</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${colorClass}`}
          style={{ width: `${percentage}%`, minWidth: '4px' }}
        />
      </div>
    </div>
  )
}

interface AccountListWidgetProps {
  data: Account[] | { data: Account[]; pagination: { limit: number; offset: number; total: number } }
  toolArgs?: {
    account_type_id?: number
    currency_code?: string
    is_closed?: boolean
    limit?: number
    offset?: number
  }
}


export function AccountListWidget({ data, toolArgs }: AccountListWidgetProps) {
  const accounts = Array.isArray(data) ? data : data.data
  const pagination = Array.isArray(data) ? null : data.pagination

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">No accounts available</p>
      </div>
    )
  }

  // Calculate net total
  const activeAccounts = accounts.filter((acc) => !acc.is_closed)
  const netTotal = activeAccounts.reduce((sum, acc) => sum + parseFloat(acc.current_balance), 0)
  const primaryCurrency = accounts[0]?.currency_code || "USD"

  // Check if any parameters were used
  const hasParameters = !!toolArgs

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Accounts ({accounts.length})</CardTitle>
        </div>

        {/* Query Parameters */}
        {hasParameters && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Query Parameters:</p>
              <div className="flex flex-wrap gap-1.5">
                {toolArgs.account_type_id !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Type ID: {toolArgs.account_type_id}
                  </Badge>
                )}
                {toolArgs.currency_code && (
                  <Badge variant="secondary" className="text-xs">
                    Currency: {toolArgs.currency_code}
                  </Badge>
                )}
                {toolArgs.is_closed !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {toolArgs.is_closed ? "Closed" : "Active"}
                  </Badge>
                )}
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
        {pagination && pagination.total > accounts.length && (
          <div className="text-xs text-muted-foreground">
            Showing {pagination.offset + 1}-{pagination.offset + accounts.length} of {pagination.total} total
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-1 px-3">
        {accounts.map((account) => {
          const balance = parseFloat(account.current_balance)
          const creditLimit = account.credit_limit ? parseFloat(account.credit_limit) : null
          const typeInfo = accountTypeInfo[account.account_type_id]
          const Icon = typeInfo?.icon || Wallet

          return (
            <div
              key={account.account_id}
              className="group rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="size-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-sm">{account.account_name}</span>
                    {account.is_closed && (
                      <Badge variant="secondary" className="h-4 shrink-0 px-1.5 text-[10px] font-normal">
                        Closed
                      </Badge>
                    )}
                  </div>
                  {account.institution_name && (
                    <p className="text-xs text-muted-foreground">{account.institution_name}</p>
                  )}

                  {/* Credit utilization for credit accounts */}
                  {creditLimit && creditLimit > 0 && (
                    <CreditUtilization balance={balance} limit={creditLimit} />
                  )}
                </div>

                {/* Balance */}
                <div className="shrink-0 text-right">
                  <p className={`font-semibold text-sm ${balance < 0 ? "text-destructive" : "text-foreground"}`}>
                    {balance < 0 ? "-" : ""}
                    {formatCurrency(balance, account.currency_code)}
                  </p>
                  {creditLimit && (
                    <p className="text-xs text-muted-foreground">
                      of {formatCurrency(creditLimit, account.currency_code)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Net Total */}
        {activeAccounts.length > 0 && (
          <div className="group rounded-lg px-3 py-2.5 border-t border-border mt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Net Total:</span>
              <span className="text-sm font-bold">
                {formatCurrency(netTotal, primaryCurrency)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
