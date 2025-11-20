"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import type { WidgetData } from "@/types/widget"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  onWidgetUpdate: (widget: WidgetData) => void
}

export function ChatInterface({ onWidgetUpdate }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onToolCall: ({ toolCall }) => {
      console.log("[v0] Tool called:", toolCall.toolName, toolCall.input)

      const widget: WidgetData = {
        id: `${toolCall.toolName}-${Date.now()}`,
        type: toolCall.toolName as any,
        data: toolCall.input,
        timestamp: Date.now(),
      }

      onWidgetUpdate(widget)
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || status === "in_progress") return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">Expense Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask about your expenses, budgets, and spending patterns</p>
      </div>

      <ScrollArea className="flex-1 px-6" ref={scrollRef}>
        <div className="space-y-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="rounded-full bg-primary/10 p-4">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground">Start a conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Try: "Show me my expenses this month" or "What's my budget status?"
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <Card
                className={cn(
                  "max-w-[80%] px-4 py-3",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                {message.parts.map((part, idx) => {
                  if (part.type === "text") {
                    return (
                      <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
                        {part.text}
                      </p>
                    )
                  }
                  return null
                })}
              </Card>
            </div>
          ))}

          {status === "in_progress" && (
            <div className="flex justify-start">
              <Card className="bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Analyzing...</p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your expenses..."
            disabled={status === "in_progress"}
            className="flex-1"
          />
          <Button type="submit" disabled={status === "in_progress" || !inputValue.trim()}>
            {status === "in_progress" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
