/**
 * Stream Event Types for LangGraph Integration
 * These types define the contract between Python backend and Next.js frontend
 */

// Base event types from LangGraph SSE stream
export type StreamEvent =
  | TokenEvent
  | ToolCallEvent
  | ToolResultEvent
  | ErrorEvent

// Text token streaming
export interface TokenEvent {
  type: 'token'
  content: string
}

// Tool invocation from LangGraph
export interface ToolCallEvent {
  type: 'tool_call'
  toolCallId: string
  tool: string
  params: Record<string, any>
  needsApproval?: boolean
  metadata?: {
    ui_target?: string // For external view updates
    description?: string
  }
}

// Tool execution result
export interface ToolResultEvent {
  type: 'tool_result'
  toolCallId: string
  tool: string
  data: any
  target?: string // If set, updates external view instead of chat
  error?: string
}

// Error handling
export interface ErrorEvent {
  type: 'error'
  message: string
  code?: string
}

// Frontend message structure
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  toolCalls?: ToolCallEvent[]
  toolResults?: ToolResultEvent[]
  timestamp: Date
}

// Approval state for human-in-the-loop
export interface ApprovalRequest {
  toolCallId: string
  tool: string
  params: Record<string, any>
  description?: string
  status: 'pending' | 'approved' | 'rejected'
}
