"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { Dashboard } from "@/components/dashboard"
import type { WidgetData } from "@/types/widget"

export default function Page() {
  const [widgets, setWidgets] = useState<WidgetData[]>([])

  const handleWidgetUpdate = (newWidget: WidgetData) => {
    setWidgets((prev) => {
      const updated = [...prev, newWidget]
      // Keep only the latest 5 widgets
      return updated.slice(-5)
    })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Interface - Left Side */}
      <div className="w-1/2 border-r border-border">
        <ChatInterface onWidgetUpdate={handleWidgetUpdate} />
      </div>

      {/* Dashboard - Right Side */}
      <div className="w-1/2">
        <Dashboard widgets={widgets} />
      </div>
    </div>
  )
}
