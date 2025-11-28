"use client"

import { useEffect, useRef } from "react"
import { Bot, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"

interface ChatInterfaceProps {
  messages: any[]
  input: string
  isLoading: boolean
  status?: "submitted" | "streaming" | "ready" | "error"
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onClearSession: () => void
  onSendMessage?: any
  addToolOutput?: any
}

export function ChatInterface({
  messages,
  input,
  isLoading,
  status = "ready",
  onInputChange,
  onSubmit,
  onClearSession,
  onSendMessage,
  addToolOutput,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Status indicator configuration
  const getStatusConfig = () => {
    switch (status) {
      case "streaming":
        return { color: "bg-blue-500", text: "Streaming", animate: "animate-pulse" }
      case "submitted":
        return { color: "bg-yellow-500", text: "Processing", animate: "animate-pulse" }
      case "error":
        return { color: "bg-red-500", text: "Error", animate: "" }
      case "ready":
      default:
        return { color: "bg-green-500", text: "Ready", animate: "" }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="w-[450px] h-full flex flex-col border-r shadow-sm z-10">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="font-semibold text-sm flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Transaction Assistant
          <span className="flex items-center gap-1.5 ml-2">
            <span className={`h-2 w-2 rounded-full ${statusConfig.color} ${statusConfig.animate}`} />
            <span className="text-xs text-muted-foreground font-normal">{statusConfig.text}</span>
          </span>
        </h1>
        <Button variant="ghost" size="icon" onClick={onClearSession} title="Clear Session">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-4 max-w-full p-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm my-10 space-y-2">
              <p>Try asking:</p>
              <div className="flex flex-col gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSendMessage({
                      role: "user",
                      parts: [{ type: "text", text: "Show me all my transactions" }],
                    })
                  }}
                >
                  "Show all transactions"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSendMessage({
                      role: "user",
                      parts: [{ type: "text", text: "Show me food budget analysis" }],
                    })
                  }}
                >
                  "Show me food budget analysis"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onSendMessage({
                      role: "user",
                      parts: [{ type: "text", text: "Show Spending by Category" }],
                    })
                  }}
                >
                  "Show Spending by Category"
                </Button>
              </div>
            </div>
          )}

          {messages.map((m: any) => (
            <ChatMessage key={m.id} message={m} addToolOutput={addToolOutput} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2 text-sm text-muted-foreground animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <ChatInput input={input} isLoading={isLoading} onInputChange={onInputChange} onSubmit={onSubmit} />
      </div>
    </div>
  )
}
