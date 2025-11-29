import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Landmark, PiggyBank, CreditCard, Wallet, TrendingUp, FileText, Filter } from "lucide-react"
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

// Map account type IDs to icons and names
const accountTypeInfo: Record<number, { icon: LucideIcon; name: string }> = {
  1: { icon: Landmark, name: "Checking" },
  2: { icon: PiggyBank, name: "Savings" },
  3: { icon: CreditCard, name: "Credit Card" },
  4: { icon: Wallet, name: "Cash" },
  5: { icon: TrendingUp, name: "Investment" },
  6: { icon: FileText, name: "Loan" },
}

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
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

  // Calculate total balance for active accounts
  const activeAccounts = accounts.filter((acc) => !acc.is_closed)
  const total = activeAccounts.reduce((sum, acc) => sum + parseFloat(acc.current_balance), 0)
  const primaryCurrency = activeAccounts[0]?.currency_code || "USD"
  const totalSymbol = currencySymbols[primaryCurrency] || primaryCurrency

  // Check if filters are applied
  const hasFilters = toolArgs && (
    toolArgs.account_type_id !== undefined ||
    toolArgs.currency_code !== undefined ||
    toolArgs.is_closed !== undefined
  )

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle>Accounts ({accounts.length})</CardTitle>

        {/* Filter Summary */}
        {hasFilters && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Applied Filters:</p>
              <div className="flex flex-wrap gap-1.5">
                {toolArgs.account_type_id !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Type: {accountTypeInfo[toolArgs.account_type_id]?.name || `ID ${toolArgs.account_type_id}`}
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
              </div>
            </div>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && pagination.total > accounts.length && (
          <div className="text-xs text-muted-foreground">
            Showing {pagination.offset + 1}-{pagination.offset + accounts.length} of {pagination.total} accounts
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {accounts.map((account) => {
              const balance = parseFloat(account.current_balance)
              const typeInfo = accountTypeInfo[account.account_type_id]
              const Icon = typeInfo?.icon || Wallet
              const symbol = currencySymbols[account.currency_code] || account.currency_code
              const displayName = account.institution_name
                ? `${account.account_name} (${account.institution_name})`
                : account.account_name
              const creditLimit = account.credit_limit ? parseFloat(account.credit_limit) : null
              const creditUsagePercent = creditLimit && creditLimit > 0 ? Math.abs((balance / creditLimit) * 100) : null

              return (
                <div key={account.account_id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{displayName}</span>
                        {account.is_closed && (
                          <Badge variant="secondary" className="text-xs">
                            Closed
                          </Badge>
                        )}
                      </div>
                      {creditLimit && (
                        <div className="text-xs text-muted-foreground">
                          Limit: {symbol}
                          {creditLimit.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          {creditUsagePercent !== null && ` (${creditUsagePercent.toFixed(0)}% used)`}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0 ml-2">
                    {symbol}
                    {Math.abs(balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )
            })}

            {activeAccounts.length > 0 && (
              <div className="flex items-center justify-between py-2 border-t border-border mt-2 pt-4">
                <span className="text-sm font-bold">Total:</span>
                <span className="text-sm font-bold">
                  {totalSymbol}
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
