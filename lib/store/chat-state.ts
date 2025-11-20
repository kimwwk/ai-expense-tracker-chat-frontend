import { create } from 'zustand'
import { ChatMessage, ApprovalRequest } from '@/lib/types/stream-events'

/**
 * Chat-specific state management
 * Handles messages, streaming status, and approval requests
 */

interface ChatState {
  // Messages
  messages: ChatMessage[]
  
  // Streaming state
  isStreaming: boolean
  currentStreamingMessageId: string | null
  
  // Approval requests (human-in-the-loop)
  pendingApprovals: ApprovalRequest[]
  
  // Actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  appendToLastMessage: (content: string) => void
  setStreaming: (isStreaming: boolean, messageId?: string) => void
  addApprovalRequest: (request: ApprovalRequest) => void
  resolveApproval: (toolCallId: string, approved: boolean) => void
  clearMessages: () => void
}

export const useChatState = create<ChatState>((set, get) => ({
  // Initial state
  messages: [],
  isStreaming: false,
  currentStreamingMessageId: null,
  pendingApprovals: [],
  
  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),
  
  appendToLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const lastMessage = messages[messages.length - 1]
      
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += content
      }
      
      return { messages }
    }),
  
  setStreaming: (isStreaming, messageId) =>
    set({
      isStreaming,
      currentStreamingMessageId: messageId || null,
    }),
  
  addApprovalRequest: (request) =>
    set((state) => ({
      pendingApprovals: [...state.pendingApprovals, request],
    })),
  
  resolveApproval: (toolCallId, approved) =>
    set((state) => ({
      pendingApprovals: state.pendingApprovals.map((req) =>
        req.toolCallId === toolCallId
          ? { ...req, status: approved ? 'approved' : 'rejected' }
          : req
      ),
    })),
  
  clearMessages: () =>
    set({
      messages: [],
      pendingApprovals: [],
    }),
}))
