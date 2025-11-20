'use client'

import { useExternalViews } from '@/lib/store/external-views'
import { useChatState } from '@/lib/store/chat-state'
import { StreamEvent, ToolCallEvent, ChatMessage } from '@/lib/types/stream-events'

/**
 * Stream Interceptor Hook
 * Routes incoming SSE events to appropriate handlers:
 * - Text tokens → Append to chat
 * - Tool calls → Check registry or request approval
 * - Tool results → Update external views or show in chat
 */

export function useStreamInterceptor() {
  const { updateDashboard, updateSidebar, addWidget } = useExternalViews()
  const { appendToLastMessage, addApprovalRequest, updateMessage } = useChatState()

  const handleEvent = (event: StreamEvent, currentMessageId: string) => {
    console.log('[v0] Stream event received:', event.type, event)

    switch (event.type) {
      case 'token':
        // Append text to the current streaming message
        appendToLastMessage(event.content)
        break

      case 'tool_call':
        const toolCall = event as ToolCallEvent
        
        // Check if this tool needs approval
        if (toolCall.needsApproval) {
          addApprovalRequest({
            toolCallId: toolCall.toolCallId,
            tool: toolCall.tool,
            params: toolCall.params,
            description: toolCall.metadata?.description,
            status: 'pending',
          })
          return { type: 'approval', data: toolCall }
        }

        // Check if this tool updates an external view
        if (toolCall.metadata?.ui_target) {
          handleExternalViewUpdate(toolCall)
          return null // Don't render in chat
        }

        // Otherwise, render the tool call in chat
        return { type: 'tool_call', data: toolCall }

      case 'tool_result':
        // If result has a target, update external view
        if (event.target) {
          handleExternalViewUpdate(event)
          return null
        }
        
        // Otherwise, show result in chat
        return { type: 'tool_result', data: event }

      case 'error':
        console.error('[v0] Stream error:', event.message)
        return { type: 'error', data: event }

      default:
        console.warn('[v0] Unknown event type:', event)
        return null
    }
  }

  const handleExternalViewUpdate = (event: any) => {
    const target = event.metadata?.ui_target || event.target

    console.log('[v0] Updating external view:', target, event)

    switch (target) {
      case 'dashboard':
        updateDashboard({
          mode: event.params?.mode || event.data?.mode,
          data: event.params?.data || event.data,
        })
        break

      case 'sidebar':
        updateSidebar({
          visible: true,
          content: event.params?.content || event.data,
          title: event.params?.title || event.data?.title,
        })
        break

      case 'widget':
        addWidget({
          id: event.toolCallId || `widget_${Date.now()}`,
          type: event.tool,
          data: event.params || event.data,
        })
        break

      default:
        console.warn('[v0] Unknown target:', target)
    }
  }

  return { handleEvent }
}
