import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ExpenseListWidget({ data }: { data: any[] }) {
  if (!data || !Array.isArray(data)) return <div className="p-4">No data available</div>

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>Expense History ({data.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4">
            {data.map((expense: any) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{expense.description}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{expense.date}</span>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
                <div className="font-bold text-sm">${expense.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
