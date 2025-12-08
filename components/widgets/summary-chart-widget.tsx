"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

export function SummaryChartWidget({ data }: { data: any }) {
  if (!data || !data.summary) return null

  const chartData = Object.entries(data.summary)
    .map(([key, value]: [string, any]) => ({
      name: key,
      total: value.total,
      count: value.count,
      percentage: data.grandTotal > 0 ? ((value.total / data.grandTotal) * 100).toFixed(1) : "0.0",
    }))
    .sort((a, b) => b.total - a.total) // Sort by total descending

  const topCategory = chartData[0]
  const categoryCount = chartData.length
  const transactionType = data.transactionType || "expense"
  const isIncome = transactionType === "income"
  const typeLabel = isIncome ? "Income" : "Spending"

  return (
    <Card className="border-0 shadow-none h-full">
      <CardHeader>
        <CardTitle>{typeLabel} by Category</CardTitle>
        <CardDescription>
          {data.dateRange?.startDate && data.dateRange?.endDate
            ? `${data.dateRange.startDate} to ${data.dateRange.endDate}`
            : "All time"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const percentage = payload[0].payload.percentage
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="font-bold text-sm mb-2">{payload[0].payload.name}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-bold">${payload[0].value?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">% of Total:</span>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Total {typeLabel}</span>
            <span className="text-2xl font-bold">${data.grandTotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground mb-1">Categories</div>
              <div className="text-xl font-bold">{categoryCount}</div>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground mb-1">Top Category</div>
              <div className="text-xl font-bold truncate" title={topCategory?.name}>
                {topCategory?.name || "N/A"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {topCategory?.percentage}% of total
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
