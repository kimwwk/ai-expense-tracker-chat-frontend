import { useState } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'
import { ApprovalRequest } from '@/lib/types/stream-events'
import { useChatState } from '@/lib/store/chat-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ApprovalCardProps {
  request: ApprovalRequest
}

export function ApprovalCard({ request }: ApprovalCardProps) {
  const { resolveApproval } = useChatState()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAction = async (approved: boolean) => {
    setIsSubmitting(true)
    try {
      // In a real app, you'd call the API here to resume the LangGraph thread
      // For this demo, we just update local state and trigger the callback
      await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [], // Context handled by thread ID in real app
          approval: {
            toolCallId: request.toolCallId,
            tool: request.tool,
            status: approved ? 'approved' : 'rejected'
          }
        })
      })
      
      resolveApproval(request.toolCallId, approved)
    } catch (error) {
      console.error('Failed to submit approval', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (request.status !== 'pending') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md border">
        {request.status === 'approved' ? (
          <><Check className="w-4 h-4 text-green-500" /> Approved: {request.description}</>
        ) : (
          <><X className="w-4 h-4 text-red-500" /> Rejected: {request.description}</>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Approval Required
          </CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            {request.tool}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-2">
          {request.description || "The agent wants to execute an action."}
        </p>
        <div className="bg-background/50 p-2 rounded text-xs font-mono border overflow-x-auto">
          {JSON.stringify(request.params, null, 2)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleAction(false)}
          disabled={isSubmitting}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Reject
        </Button>
        <Button 
          size="sm" 
          onClick={() => handleAction(true)}
          disabled={isSubmitting}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Approve
        </Button>
      </CardFooter>
    </Card>
  )
}
