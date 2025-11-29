"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Plus, Edit, Trash2, ArrowRight } from "lucide-react"
import { useChangeSet } from "@/lib/changeset/ChangeSetContext"
import { useState } from "react"
import { ChangeRequest } from "@/lib/changeset/types"

export function ChangeSetWidget() {
  const { changeSet, clearChangeSet, addToolOutput } = useChangeSet()
  const [isApplying, setIsApplying] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!changeSet) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">No pending changes</p>
        </CardContent>
      </Card>
    )
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      const response = await fetch("/api/change-sets/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeSet }),
      })

      const data = await response.json()
      setResult(data)

      // Call addToolOutput to notify AI of the result
      if (addToolOutput && changeSet.toolCallId) {
        addToolOutput({
          tool: "confirmChangeSet",
          toolCallId: changeSet.toolCallId,
          output: data,
        })
      }

      if (data.success) {
        clearChangeSet()
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }
      setResult(errorResult)

      // Call addToolOutput with error
      if (addToolOutput && changeSet.toolCallId) {
        addToolOutput({
          tool: "confirmChangeSet",
          toolCallId: changeSet.toolCallId,
          state: "output-error",
          errorText: errorResult.message,
        })
      }
    } finally {
      setIsApplying(false)
    }
  }

  const handleReject = () => {
    const rejectResult = { success: false, message: "Changes rejected by user" }
    setResult(rejectResult)

    // Call addToolOutput to notify AI of rejection
    if (addToolOutput && changeSet?.toolCallId) {
      addToolOutput({
        tool: "confirmChangeSet",
        toolCallId: changeSet.toolCallId,
        output: rejectResult,
      })
    }

    clearChangeSet()
  }

  if (result) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Review Changes</CardTitle>
        <CardDescription>
          {changeSet.requests.length} {changeSet.requests.length === 1 ? "change" : "changes"} pending your approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          {changeSet.requests.map((request, index) => (
            <ChangeRequestCard key={request.id} request={request} index={index} />
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleReject} variant="outline" disabled={isApplying} className="flex-1">
            Reject All
          </Button>
          <Button onClick={handleApply} disabled={isApplying} className="flex-1">
            {isApplying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ChangeRequestCard({ request, index }: { request: ChangeRequest; index: number }) {
  const operationConfig = {
    create: {
      icon: Plus,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      borderColor: "border-green-200 dark:border-green-800",
      badgeVariant: "default" as const,
    },
    update: {
      icon: Edit,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      borderColor: "border-blue-200 dark:border-blue-800",
      badgeVariant: "secondary" as const,
    },
    delete: {
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
      borderColor: "border-red-200 dark:border-red-800",
      badgeVariant: "destructive" as const,
    },
  }

  const config = operationConfig[request.operation]
  const Icon = config.icon

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${config.color} p-1.5 rounded-md bg-background`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold capitalize">{request.operation}</span>
              <span className="font-medium text-muted-foreground capitalize">{request.entity}</span>
            </div>
            {request.recordId && (
              <span className="text-xs text-muted-foreground">ID: {request.recordId}</span>
            )}
          </div>
        </div>
        <Badge variant={config.badgeVariant} className="ml-auto">
          #{index + 1}
        </Badge>
      </div>

      {/* Data comparison */}
      {request.operation === "create" && request.proposedData && (
        <DataDisplay title="New Data" data={request.proposedData} />
      )}

      {request.operation === "update" && (
        <div className="space-y-2">
          {request.currentData && (
            <DataDisplay title="Current" data={request.currentData} variant="muted" />
          )}
          {request.proposedData && (
            <>
              <div className="flex items-center justify-center py-1">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <DataDisplay title="Updated" data={request.proposedData} variant="highlight" />
            </>
          )}
        </div>
      )}

      {request.operation === "delete" && request.currentData && (
        <DataDisplay title="Data to be deleted" data={request.currentData} variant="danger" />
      )}
    </div>
  )
}

function DataDisplay({
  title,
  data,
  variant = "default",
}: {
  title: string
  data: Record<string, any>
  variant?: "default" | "muted" | "highlight" | "danger"
}) {
  const variantStyles = {
    default: "bg-background border-border",
    muted: "bg-muted/50 border-muted",
    highlight: "bg-primary/5 border-primary/20",
    danger: "bg-destructive/5 border-destructive/20",
  }

  const entries = Object.entries(data)

  // Limit display to prevent overwhelming UI
  const displayEntries = entries.slice(0, 10)
  const hasMore = entries.length > 10

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className={`rounded-md border p-3 space-y-1.5 ${variantStyles[variant]}`}>
        {displayEntries.map(([key, value]) => (
          <div key={key} className="flex items-start justify-between gap-4 text-sm">
            <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
              {formatFieldName(key)}:
            </span>
            <span className="text-right break-words font-mono text-xs flex-1">
              {formatValue(value)}
            </span>
          </div>
        ))}
        {hasMore && (
          <div className="text-xs text-muted-foreground italic pt-1 border-t">
            ... and {entries.length - 10} more fields
          </div>
        )}
      </div>
    </div>
  )
}

function formatFieldName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "—"
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}
