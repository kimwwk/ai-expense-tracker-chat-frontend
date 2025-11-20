'use client'

import { ChatMessage } from '@/lib/types/stream-events'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import { getToolComponent } from '@/lib/chat/mcp-registry'

interface MessageItemProps {
  message: ChatMessage
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser && 'items-end')}>
        {/* Text content */}
        {message.content && (
          <div
            className={cn(
              'rounded-lg px-4 py-2 text-sm',
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Tool calls */}
        {message.toolCalls?.map((toolCall) => {
          const ToolComponent = getToolComponent(toolCall.tool)
          return <ToolComponent key={toolCall.toolCallId} data={toolCall} />
        })}

        {/* Tool results */}
        {message.toolResults?.map((result) => (
          <div key={result.toolCallId} className="text-xs text-muted-foreground">
            {result.error ? (
              <span className="text-destructive">Error: {result.error}</span>
            ) : (
              <span>✓ {result.tool} completed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
