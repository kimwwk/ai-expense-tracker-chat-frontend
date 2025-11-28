"use client"

import { useState } from "react"
import { Check, X, AlertCircle, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteTransaction } from "@/lib/api/transactions"

interface ToolApprovalConfig {
  title: string
  description: (params: any) => string
  icon: React.ComponentType<{ className?: string }>
  variant: "destructive" | "warning"
  confirmLabel: string
  execute: (params: any) => Promise<any>
}

const TOOL_APPROVAL_CONFIGS: Record<string, ToolApprovalConfig> = {
  deleteTransaction: {
    title: "Confirm Deletion",
    description: (params) =>
      `Are you sure you want to delete transaction ID ${params.transaction_id}? This action cannot be undone.`,
    icon: Trash2,
    variant: "destructive",
    confirmLabel: "Delete Transaction",
    execute: async (params) => {
      await deleteTransaction(params.transaction_id)
      return {
        success: true,
        message: `Transaction ${params.transaction_id} deleted successfully`,
      }
    },
  },
  // Future tools can be added here (deleteAccount, deleteCategory, etc.)
}

// Export list of tools that require approval
export const APPROVAL_REQUIRED_TOOLS = Object.keys(TOOL_APPROVAL_CONFIGS).map(
  (toolName) => `tool-${toolName}`
)

interface ToolApprovalProps {
  toolPart: any
  addToolOutput?: any
}

export function ToolApproval({ toolPart, addToolOutput }: ToolApprovalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Extract tool name from typed part (e.g., "tool-deleteTransaction" -> "deleteTransaction")
  const toolName = toolPart.type?.startsWith("tool-")
    ? toolPart.type.substring(5)
    : toolPart.toolName || "unknown"

  const config = TOOL_APPROVAL_CONFIGS[toolName]

  if (!config) {
    console.error(`No approval config found for tool: ${toolName}`)
    return (
      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800 mt-2">
        Error: No approval configuration for tool "{toolName}"
      </div>
    )
  }

  // Don't render approval UI until input is available
  if (toolPart.state === "input-streaming" || !toolPart.input) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-md border mt-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading approval request...</span>
      </div>
    )
  }

  // Safety check: addToolOutput must be available
  if (!addToolOutput) {
    console.error("addToolOutput not available in ToolApproval component")
    return (
      <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800 mt-2">
        Error: Tool output handler not available
      </div>
    )
  }

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      const result = await config.execute(toolPart.input)

      addToolOutput({
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        output: result,
      })
    } catch (error) {
      addToolOutput({
        tool: toolName,
        toolCallId: toolPart.toolCallId,
        state: "output-error",
        errorText: `Failed to execute ${toolName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = () => {
    addToolOutput({
      tool: toolName,
      toolCallId: toolPart.toolCallId,
      output: {
        success: false,
        message: `${config.title} cancelled by user`,
      },
    })
  }

  // Show confirmation message after approval/rejection
  if (toolPart.state === "output-available") {
    const wasSuccessful = toolPart.output?.success
    return (
      <div
        className={`flex items-center gap-2 text-sm p-3 rounded-md border mt-2 ${
          wasSuccessful
            ? "text-muted-foreground bg-muted/50"
            : "text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
        }`}
      >
        {wasSuccessful ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span>{toolPart.output.message}</span>
          </>
        ) : (
          <>
            <X className="w-4 h-4 text-amber-500" />
            <span>{toolPart.output.message}</span>
          </>
        )}
      </div>
    )
  }

  // Show error state
  if (toolPart.state === "output-error") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800 mt-2">
        <AlertCircle className="w-4 h-4" />
        <span>Error: {toolPart.errorText}</span>
      </div>
    )
  }

  // Show approval card
  const IconComponent = config.icon
  const isDestructive = config.variant === "destructive"

  return (
    <Card
      className={`w-full max-w-md mt-2 ${
        isDestructive
          ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
          : "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle
              className={`w-4 h-4 ${isDestructive ? "text-red-600" : "text-amber-600"}`}
            />
            {config.title}
          </CardTitle>
          <Badge
            variant={isDestructive ? "destructive" : "outline"}
            className={`gap-1 ${
              !isDestructive && "bg-amber-100 text-amber-700 border-amber-200"
            }`}
          >
            <IconComponent className="w-3 h-3" />
            {toolName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-2">
          {config.description(toolPart.input)}
        </p>
        <div className="bg-background/50 p-2 rounded text-xs font-mono border overflow-x-auto">
          {JSON.stringify(toolPart.input, null, 2)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReject}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant={isDestructive ? "destructive" : "default"}
          size="sm"
          onClick={handleApprove}
          disabled={isSubmitting}
          className={`gap-1 ${
            !isDestructive && "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
        >
          <IconComponent className="w-3 h-3" />
          {config.confirmLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
