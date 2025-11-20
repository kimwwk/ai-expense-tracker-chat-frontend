'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { ExternalView } from '@/components/dashboard/external-view'
import { SidebarWidget } from '@/components/dashboard/sidebar-widget'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable-panels'
import { Button } from '@/components/ui/button'
import { useChatState } from '@/lib/store/chat-state'
import { useExternalViews } from '@/lib/store/external-views'
import { Trash2 } from 'lucide-react'

export default function Home() {
  const { clearMessages } = useChatState()
  const { clearAll } = useExternalViews()

  const handleReset = () => {
    clearMessages()
    clearAll()
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LangGraph Chat Interface</h1>
          <p className="text-sm text-muted-foreground">
            Chat with agent • External views update in real-time
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <Trash2 className="size-4 mr-2" />
          Reset
        </Button>
      </header>

      {/* Main Content: Split View */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Chat Interface */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ChatInterface />
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel: External Dashboard View */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full overflow-auto bg-muted/20">
              <ExternalView />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Sidebar Widget (controlled by agent) */}
      <SidebarWidget />
    </div>
  )
}
