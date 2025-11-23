"use client"

import { useChat } from "ai/react"
import { useWidgetManager } from "@/hooks/use-widget-manager"
import { Dashboard } from "@/components/dashboard/dashboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Trash2 } from "lucide-react"
import { useEffect, useRef } from "react"

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    maxSteps: 5, // Allow multi-step tool calls
  })

  const { widgets, activeTab, setActiveTab, clearWidgets } = useWidgetManager(messages)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // When a new relevant widget appears, switch tab automatically
  // This is a simple logic: if the count of widgets changes, switch to the type of the last widget
  const prevWidgetCountRef = useRef(0)
  useEffect(() => {
    if (widgets.length > prevWidgetCountRef.current) {
      const lastWidget = widgets[widgets.length - 1]
      if (lastWidget.type === "summary-chart") setActiveTab("overview")
      if (lastWidget.type === "expense-list") setActiveTab("expenses")
      if (lastWidget.type === "spending-analysis") setActiveTab("analysis")
    }
    prevWidgetCountRef.current = widgets.length
  }, [widgets, setActiveTab])

  const handleClearSession = () => {
    setMessages([])
    clearWidgets()
    prevWidgetCountRef.current = 0
  }

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Left Panel: Chat Interface */}
      <div className="w-[450px] flex flex-col border-r shadow-sm z-10">
        <div className="h-14 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="font-semibold text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Expense Assistant
          </h1>
          <Button variant="ghost" size="icon" onClick={handleClearSession} title="Clear Session">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-full">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm my-10 space-y-2">
                <p>Try asking:</p>
                <div className="flex flex-col gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleInputChange({ target: { value: "Show me all my food expenses" } } as any)
                    }}
                  >
                    "Show me food expenses"
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleInputChange({ target: { value: "Analyze my spending for Food" } } as any)
                    }}
                  >
                    "Analyze Food budget"
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleInputChange({ target: { value: "Give me a summary of my spending" } } as any)
                    }}
                  >
                    "Spending Summary"
                  </Button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] text-sm ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {m.content}

                  {/* Show simplified tool status in chat */}
                  {m.toolInvocations?.map((toolInv) => (
                    <div key={toolInv.toolCallId} className="mt-2 text-xs opacity-70 border-t pt-1 border-white/20">
                      {toolInv.state === "result" ? (
                        <div className="flex items-center gap-1">
                          ✓ Used tool: <span className="font-mono">{toolInv.toolName}</span>
                        </div>
                      ) : (
                        <div className="animate-pulse flex items-center gap-1">
                          ⏳ Calling: <span className="font-mono">{toolInv.toolName}</span>...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about expenses..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Panel: Dashboard Widgets */}
      <div className="flex-1 bg-muted/20">
        <Dashboard widgets={widgets} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
