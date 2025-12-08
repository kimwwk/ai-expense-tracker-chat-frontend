import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"

export function SpendingAnalysisWidget({ data }: { data: any }) {
  if (!data) return null

  const { category, spent, budget, remaining, percentageUsed, status, transactionCount } = data

  const getStatusConfig = (s: string) => {
    if (s === "over_budget")
      return {
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        icon: AlertCircle,
        label: "Over Budget",
        description: "Exceeded budget limit",
      }
    if (s === "warning")
      return {
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: TrendingUp,
        label: "Warning",
        description: "Approaching budget limit",
      }
    return {
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      icon: CheckCircle,
      label: "Good",
      description: "Within budget",
    }
  }

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon

  // Calculate insights
  const isOverBudget = remaining < 0
  const budgetHealth = isOverBudget ? 0 : (remaining / budget) * 100
  const overspentAmount = isOverBudget ? Math.abs(remaining) : 0

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            {category}
            <Badge variant="outline" className={`${statusConfig.color} ${statusConfig.bgColor} border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </span>
        </CardTitle>
        <CardDescription>{statusConfig.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-end text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Spent</div>
              <div className="text-2xl font-bold">${spent.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Budget</div>
              <div className="text-xl font-bold text-muted-foreground">${budget.toFixed(2)}</div>
            </div>
          </div>
          <Progress
            value={Math.min(percentageUsed, 100)}
            className={percentageUsed > 100 ? "bg-red-100 [&>div]:bg-red-500" : percentageUsed > 80 ? "bg-orange-100 [&>div]:bg-orange-500" : ""}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentageUsed.toFixed(1)}% used</span>
            {isOverBudget ? (
              <span className="text-red-500 font-medium">+${overspentAmount.toFixed(2)} over</span>
            ) : (
              <span className="text-green-600 font-medium">{budgetHealth.toFixed(1)}% remaining</span>
            )}
          </div>
        </div>

        {/* Remaining/Overspent Card */}
        <div
          className={`p-4 rounded-lg space-y-2 ${
            isOverBudget ? "bg-red-500/10 border border-red-500/20" : "bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              {isOverBudget ? "Over Budget" : "Remaining Budget"}
            </div>
            {isOverBudget ? (
              <TrendingUp className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className={`text-3xl font-bold ${isOverBudget ? "text-red-500" : "text-primary"}`}>
            {isOverBudget ? "-" : ""}${Math.abs(remaining).toFixed(2)}
          </div>
        </div>

        {/* Transaction Details */}
        {transactionCount !== undefined && transactionCount > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Transactions</div>
              <div className="text-lg font-bold">{transactionCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Avg per Transaction</div>
              <div className="text-lg font-bold">${(spent / transactionCount).toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {isOverBudget && (
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
            <div className="text-xs font-medium text-red-600 mb-1">💡 Recommendation</div>
            <div className="text-xs text-muted-foreground">
              Consider adjusting your budget to ${Math.ceil(spent / 50) * 50} or review recent transactions to identify
              savings opportunities.
            </div>
          </div>
        )}

        {status === "warning" && !isOverBudget && (
          <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
            <div className="text-xs font-medium text-orange-600 mb-1">⚠️ Alert</div>
            <div className="text-xs text-muted-foreground">
              You've used over 80% of your budget. ${remaining.toFixed(2)} remaining for this category.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
