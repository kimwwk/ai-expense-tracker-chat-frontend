'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, AlertTriangle } from 'lucide-react'

interface ApprovalRequest {
  toolCallId: string
  tool: string
  params: any
  description?: string
  status: 'pending' | 'approved' | 'rejected'
}

interface ApprovalModalProps {
  request: ApprovalRequest
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function ApprovalModal({ request, onApprove, onReject }: ApprovalModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onReject(request.toolCallId)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Approval Required</DialogTitle>
          </div>
          <DialogDescription>
            The agent wants to execute a sensitive action. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Action Type</span>
            <Badge variant="outline" className="font-mono">
              {request.tool}
            </Badge>
          </div>

          {request.description && (
            <div className="mb-4 p-3 bg-muted/50 rounded-md text-sm">
              {request.description}
            </div>
          )}

          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Parameters</span>
            <ScrollArea className="h-[150px] w-full rounded-md border p-4 bg-muted/30 font-mono text-xs">
              <pre>{JSON.stringify(request.params, null, 2)}</pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onReject(request.toolCallId)}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button
            onClick={() => onApprove(request.toolCallId)}
            className="w-full sm:w-auto"
          >
            <Check className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
