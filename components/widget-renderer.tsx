"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { WidgetData } from "@/types/widget"
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface WidgetRendererProps {
  widget: WidgetData
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const [toolResult, setToolResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // For demo purposes, we'll use the widget data directly
    const timer = setTimeout(() => {
      setToolResult(widget.data)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [widget.data])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading {widget.type}...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render different widget types based on the tool call
  switch (widget.type) {
    case "get_recent_expenses":
      return <ExpenseTableWidget data={toolResult} />
    case "analyze_spending":
      return <SpendingAnalysisWidget data={toolResult} />
    case "get_budget_status":
      return <BudgetStatusWidget data={toolResult} />
    case "get_category_breakdown":
      return <CategoryBreakdownWidget data={toolResult} />
    default:
      return <GenericWidget widget={widget} result={toolResult} />
  }
}

function ExpenseTableWidget({ data }: { data: any }) {
  const expenses = data?.expenses || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="text-sm text-muted-foreground">{expense.date}</TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{expense.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SpendingAnalysisWidget({ data }: { data: any }) {
  const { total, average, trend } = data
  const isIncreasing = trend === "increasing"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">${total.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Average per Day</p>
            <p className="text-2xl font-bold">${average.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          {isIncreasing ? (
            <ArrowUpRight className="h-5 w-5 text-destructive" />
          ) : (
            <ArrowDownRight className="h-5 w-5 text-green-600" />
          )}
          <p className="text-sm">
            Spending is <span className="font-medium">{trend}</span> compared to last period
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function BudgetStatusWidget({ data }: { data: any }) {
  const { budgets } = data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Budget Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {budgets?.map((budget: any, idx: number) => {
          const percentage = (budget.spent / budget.limit) * 100
          const isOverBudget = percentage > 100

          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{budget.category}</span>
                  {isOverBudget && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${
                    isOverBudget ? "bg-destructive" : percentage > 80 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function CategoryBreakdownWidget({ data }: { data: any }) {
  const { categories } = data
  const total = categories.reduce((sum: number, cat: any) => sum + cat.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map((category: any, idx: number) => {
          const percentage = (category.amount / total) * 100

          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                  <span className="font-medium">${category.amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function GenericWidget({ widget, result }: { widget: WidgetData; result: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{widget.type}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}
