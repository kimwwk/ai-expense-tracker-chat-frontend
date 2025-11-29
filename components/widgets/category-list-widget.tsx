import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Category {
  category_id: number
  category_name: string
  category_type: "income" | "expense" | "transfer"
  category_group: string | null
  color_code: string | null
  icon_name: string | null
  is_active: boolean
  created_at: string
}

interface CategoryListWidgetProps {
  data: Category[] | { data: Category[]; pagination: { limit: number; offset: number; total: number } }
  toolArgs?: {
    category_type?: string
    category_group?: string
    is_active?: boolean
    limit?: number
    offset?: number
  }
}

export function CategoryListWidget({ data, toolArgs }: CategoryListWidgetProps) {
  const categories = Array.isArray(data) ? data : data.data
  const pagination = Array.isArray(data) ? null : data.pagination

  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    )
  }

  const incomeCount = categories.filter((c) => c.category_type === "income").length
  const expenseCount = categories.filter((c) => c.category_type === "expense").length
  const transferCount = categories.filter((c) => c.category_type === "transfer").length
  const activeCount = categories.filter((c) => c.is_active).length
  const inactiveCount = categories.length - activeCount

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return ""
    }
  }

  const groupedCategories = {
    income: categories.filter((c) => c.category_type === "income"),
    expense: categories.filter((c) => c.category_type === "expense"),
    transfer: categories.filter((c) => c.category_type === "transfer"),
  }

  // Check if any parameters were used
  const hasParameters = !!toolArgs

  return (
    <Card className="h-full border-0 shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle>Categories ({categories.length})</CardTitle>

        {/* Summary badges */}
        <div className="flex gap-2 flex-wrap">
          {incomeCount > 0 && (
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
              Income: {incomeCount}
            </Badge>
          )}
          {expenseCount > 0 && (
            <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20">
              Expense: {expenseCount}
            </Badge>
          )}
          {transferCount > 0 && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              Transfer: {transferCount}
            </Badge>
          )}
          {inactiveCount > 0 && (
            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20">
              Inactive: {inactiveCount}
            </Badge>
          )}
        </div>

        {/* Query Parameters */}
        {hasParameters && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Filter className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Query Parameters:</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Filters */}
                {toolArgs.category_type && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    Type: {toolArgs.category_type}
                  </Badge>
                )}
                {toolArgs.category_group && (
                  <Badge variant="secondary" className="text-xs">
                    Group: {toolArgs.category_group}
                  </Badge>
                )}
                {toolArgs.is_active !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {toolArgs.is_active ? "Active" : "Inactive"}
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
        {pagination && pagination.total > categories.length && (
          <div className="text-xs text-muted-foreground">
            Showing {pagination.offset + 1}-{pagination.offset + categories.length} of {pagination.total} total
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-6">
            {Object.entries(groupedCategories).map(([type, cats]) => {
              if (cats.length === 0) return null

              return (
                <div key={type}>
                  <h3 className="text-sm font-semibold mb-3 uppercase text-muted-foreground">
                    {type} ({cats.length})
                  </h3>
                  <div className="space-y-2">
                    {cats.map((category) => (
                      <div
                        key={category.category_id}
                        className={cn(
                          "border rounded-lg p-3 hover:bg-muted/50 transition-colors",
                          !category.is_active && "opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {category.color_code && (
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color_code }}
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{category.category_name}</div>
                              {category.category_group && (
                                <div className="text-xs text-muted-foreground truncate">
                                  {category.category_group}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={cn("text-xs", getTypeBadgeColor(category.category_type))}>
                              {category.category_type.toUpperCase()}
                            </Badge>
                            {!category.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
