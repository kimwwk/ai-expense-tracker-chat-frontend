import { useEffect, useRef } from 'react'
import { useChatState } from '@/lib/store/chat-state'
import { cn } from '@/lib/utils'
import { ApprovalCard } from './approval-card'

export function MessageList() {
  const { messages, pendingApprovals } = useChatState()
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pendingApprovals])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex w-full",
            msg.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-3 text-sm",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-foreground"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        </div>
      ))}

      {/* Render Pending Approvals inline with chat */}
      {pendingApprovals.map((req) => (
        <div key={req.toolCallId} className="flex justify-start w-full">
          <ApprovalCard request={req} />
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
