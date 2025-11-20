'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatState } from '@/lib/store/chat-state'
import { useStreamInterceptor } from '@/lib/chat/stream-interceptor'
import { MessageItem } from './message-item'
import { ApprovalModal } from './approval-modal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import { StreamEvent } from '@/lib/types/stream-events'

export function ChatInterface() {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    isStreaming,
    pendingApprovals,
    addMessage,
    setStreaming,
    resolveApproval,
  } = useChatState()
  
  const { handleEvent } = useStreamInterceptor()

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (content: string, approval?: any) => {
    if (!content.trim() && !approval) return

    // Add user message
    if (content.trim()) {
      const userMessage = {
        id: `msg_${Date.now()}`,
        role: 'user' as const,
        content,
        timestamp: new Date(),
      }
      addMessage(userMessage)
      setInput('')
    }

    // Create assistant message placeholder
    const assistantMessageId = `msg_${Date.now() + 1}`
    addMessage({
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    })

    setStreaming(true, assistantMessageId)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          approval,
        }),
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6))
              handleEvent(event, assistantMessageId)
            } catch (e) {
              console.error('[v0] Failed to parse event:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('[v0] Stream error:', error)
    } finally {
      setStreaming(false)
    }
  }

  const handleApprove = async (toolCallId: string) => {
    resolveApproval(toolCallId, true)
    const approval = pendingApprovals.find((a) => a.toolCallId === toolCallId)
    if (approval) {
      await sendMessage('', {
        status: 'approved',
        toolCallId,
        tool: approval.tool,
      })
    }
  }

  const handleReject = (toolCallId: string) => {
    resolveApproval(toolCallId, false)
    const approval = pendingApprovals.find((a) => a.toolCallId === toolCallId)
    if (approval) {
      sendMessage('', {
        status: 'rejected',
        toolCallId,
        tool: approval.tool,
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="max-w-3xl mx-auto py-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Type a message... (Try 'update dashboard' or 'deploy to production')"
            disabled={isStreaming}
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={isStreaming || !input.trim()}
            size="icon"
            className="size-[60px]"
          >
            {isStreaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Approval Modals */}
      {pendingApprovals
        .filter((req) => req.status === 'pending')
        .map((req) => (
          <ApprovalModal
            key={req.toolCallId}
            request={req}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
    </div>
  )
}
