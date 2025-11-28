"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Loader2, CheckCircle, AlertCircle, Wrench, Brain } from "lucide-react"
import { ToolApproval, APPROVAL_REQUIRED_TOOLS } from "./tool-approval"

interface ChatMessageProps {
  message: any
  addToolOutput?: any
}

interface ToolPartDisplayProps {
  toolPart: any
}

interface ReasoningPartDisplayProps {
  reasoningPart: any
}

function ToolPartDisplay({ toolPart }: ToolPartDisplayProps) {
  const [inputExpanded, setInputExpanded] = useState(false)
  const [outputExpanded, setOutputExpanded] = useState(false)

  // Extract tool name from typed part (e.g., "tool-getExpenses" -> "getExpenses")
  const toolName = toolPart.type?.startsWith("tool-") ? toolPart.type.substring(5) : toolPart.toolName || "unknown"

  // Determine current state and styling
  const isLoading = toolPart.state === "input-streaming" || toolPart.state === "input-available"
  const isComplete = toolPart.state === "output-available" || toolPart.state === "result" || toolPart.state === "done"
  const isError = toolPart.state === "output-error"

  const statusIcon = isLoading ? (
    <Loader2 className="h-3 w-3 animate-spin" />
  ) : isError ? (
    <AlertCircle className="h-3 w-3 text-red-500" />
  ) : isComplete ? (
    <CheckCircle className="h-3 w-3 text-green-500" />
  ) : (
    <Wrench className="h-3 w-3" />
  )

  const statusText = isLoading ? "Executing..." : isError ? "Error" : isComplete ? "Completed" : "Pending"

  return (
    <div className="mt-2 border-t border-border/40 pt-2">
      <div className="flex items-center gap-2 text-xs">
        {statusIcon}
        <span className="font-medium">Tool: </span>
        <span className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded">{toolName}</span>
        <span className="text-muted-foreground">• {statusText}</span>
      </div>

      {/* Input/Arguments Section */}
      {toolPart.input && (
        <div className="mt-2">
          <button
            onClick={() => setInputExpanded(!inputExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {inputExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-medium">Input</span>
          </button>
          {inputExpanded && (
            <pre className="mt-1 text-xs bg-secondary/30 rounded p-2 overflow-x-auto max-w-full">
              <code className="block break-all">{JSON.stringify(toolPart.input, null, 2)}</code>
            </pre>
          )}
        </div>
      )}

      {/* Output/Results Section */}
      {(toolPart.output || toolPart.result) && (
        <div className="mt-2">
          <button
            onClick={() => setOutputExpanded(!outputExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {outputExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-medium">Output</span>
          </button>
          {outputExpanded && (
            <pre className="mt-1 text-xs bg-secondary/30 rounded p-2 overflow-x-auto max-w-full">
              <code className="block break-all">{JSON.stringify(toolPart.output || toolPart.result, null, 2)}</code>
            </pre>
          )}
        </div>
      )}

      {/* Error Text */}
      {isError && toolPart.errorText && (
        <div className="mt-2 text-xs text-red-500 bg-red-500/10 rounded p-2">
          <span className="font-medium">Error:</span> {toolPart.errorText}
        </div>
      )}
    </div>
  )
}

function ReasoningPartDisplay({ reasoningPart }: ReasoningPartDisplayProps) {
  const [expanded, setExpanded] = useState(false)

  const isStreaming = reasoningPart.state === "streaming"
  const isDone = reasoningPart.state === "done" || !reasoningPart.state

  return (
    <div className="mt-2 border-t border-purple-500/30 pt-2 bg-purple-500/5 rounded-lg p-2">
      <div className="flex items-center gap-2 justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors flex-1"
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Brain className="h-3 w-3" />
          <span className="font-medium">Reasoning</span>
          {isStreaming && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
          {isDone && !isStreaming && <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 text-xs bg-purple-500/10 rounded p-3 border border-purple-500/20">
          <div className="whitespace-pre-wrap break-words text-muted-foreground leading-relaxed overflow-hidden">
            {reasoningPart.text || reasoningPart.content}
            {isStreaming && <span className="inline-block animate-pulse ml-1">▊</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatMessage({ message, addToolOutput }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Render parts sequentially in the order they appear to preserve streaming order
  const renderPart = (part: any, idx: number) => {
    // Handle text parts
    if (part.type === "text") {
      return (
        <span key={idx} className="whitespace-pre-wrap">
          {part.text}
        </span>
      )
    }

    // Handle reasoning parts
    if (part.type?.startsWith("reasoning-")) {
      return <ReasoningPartDisplay key={idx} reasoningPart={part} />
    }

    // Handle client-side tools requiring approval
    if (part.type?.startsWith("tool-") && APPROVAL_REQUIRED_TOOLS.includes(part.type)) {
      return <ToolApproval key={part.toolCallId || idx} toolPart={part} addToolOutput={addToolOutput} />
    }

    // Handle tool parts (typed as "tool-getExpenses", "tool-analyzeSpending", etc.)
    if (part.type?.startsWith("tool-")) {
      return <ToolPartDisplay key={part.toolCallId || idx} toolPart={part} />
    }

    // Handle step-start parts (optional - shows step boundaries)
    if (part.type === "step-start") {
      return idx > 0 ? (
        <div key={idx} className="my-3 border-t border-border/30" />
      ) : null
    }

    // Unknown part type - don't render
    return null
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-[85%] text-sm break-words overflow-hidden ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {/* Render all parts in sequential order */}
        {message.parts?.map((part: any, idx: number) => renderPart(part, idx))}
      </div>
    </div>
  )
}
