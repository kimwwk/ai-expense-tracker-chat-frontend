import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SpendingAnalysisWidget({ data }: { data: any }) {
  if (!data) return null

  const { category, spent, budget, remaining, percentageUsed, status } = data

  const getStatusColor = (s: string) => {
    if (s === "over_budget") return "text-red-500"
    if (s === "warning") return "text-orange-500"
    return "text-green-500"
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{category} Analysis</span>
          <span className={`text-sm ${getStatusColor(status)} font-bold uppercase`}>{status.replace("_", " ")}</span>
        </CardTitle>
        <CardDescription>Budget utilization overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Spent: <strong>${spent.toFixed(2)}</strong>
            </span>
            <span>
              Budget: <strong>${budget.toFixed(2)}</strong>
            </span>
          </div>
          <Progress
            value={Math.min(percentageUsed, 100)}
            className={percentageUsed > 100 ? "bg-red-100 [&>div]:bg-red-500" : ""}
          />
          <div className="text-xs text-muted-foreground text-right">{percentageUsed.toFixed(1)}% used</div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Remaining Budget</div>
          <div className={`text-2xl font-bold ${remaining < 0 ? "text-red-500" : "text-primary"}`}>
            ${remaining.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
