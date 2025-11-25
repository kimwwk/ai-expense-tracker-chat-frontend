"use client"

import { useChat } from "@ai-sdk/react"
import { useWidgetManager } from "@/hooks/use-widget-manager"
import { Dashboard } from "@/components/dashboard/dashboard"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useEffect, useRef, useState } from "react"

export default function Page() {
  // @ai-sdk/react v2 uses a different API - we manage input state locally
  const { messages, sendMessage, setMessages, status } = useChat({
    // Defaults to /api/chat endpoint
  })

  // Manage input state locally since @ai-sdk/react v2 doesn't provide it
  const [input, setInput] = useState("")

  // Check if chat is currently loading/streaming
  // ChatStatus can be: 'submitted' | 'streaming' | 'ready' | 'error'
  const isLoading = status === "submitted" || status === "streaming"

  // Compatibility functions to match expected API
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput("") // Clear input immediately
    // sendMessage expects a message with role and parts array
    sendMessage({
      role: "user",
      parts: [{ type: "text", text: message }],
    })
  }

  const { widgets, activeTab, setActiveTab, clearWidgets } = useWidgetManager(messages)

  // When a new relevant widget appears, switch tab automatically
  const prevWidgetCountRef = useRef(0)
  useEffect(() => {
    if (widgets.length > prevWidgetCountRef.current) {
      const lastWidget = widgets[widgets.length - 1]
      if (lastWidget.type === "summary-chart") setActiveTab("overview")
      if (lastWidget.type === "transaction-list") setActiveTab("transactions")
      if (lastWidget.type === "spending-analysis") setActiveTab("analysis")
    }
    prevWidgetCountRef.current = widgets.length
  }, [widgets, setActiveTab])

  const handleClearSession = () => {
    setMessages([])
    clearWidgets()
    prevWidgetCountRef.current = 0
    setInput("")
  }

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      {/* Left Panel: Chat Interface */}
      <ChatInterface
        messages={messages}
        input={input}
        isLoading={isLoading}
        status={status}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClearSession={handleClearSession}
        onSendMessage={sendMessage}
      />

      {/* Right Panel: Dashboard Widgets */}
      <div className="flex-1 bg-muted/20">
        <Dashboard widgets={widgets} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
