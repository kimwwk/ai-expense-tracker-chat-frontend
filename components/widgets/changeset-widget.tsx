"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useChangeSet } from "@/lib/changeset/ChangeSetContext"
import { useState } from "react"

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
    <Card>
      <CardHeader>
        <CardTitle>Change Set Review</CardTitle>
        <CardDescription>
          {changeSet.requests.length} change{changeSet.requests.length !== 1 ? "s" : ""} pending
          approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {changeSet.requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-3 rounded-md border">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{request.operation}</Badge>
                <span className="font-medium">{request.entity}</span>
                {request.recordId && (
                  <span className="text-sm text-muted-foreground">ID: {request.recordId}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleReject} variant="outline" disabled={isApplying}>
            Reject All
          </Button>
          <Button onClick={handleApply} disabled={isApplying}>
            {isApplying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Apply Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
