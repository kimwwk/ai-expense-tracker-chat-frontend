"use client"

import { useChat } from "@ai-sdk/react"
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { useWidgetManager } from "@/hooks/use-widget-manager"
import { Dashboard } from "@/components/dashboard/dashboard"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChangeSetProvider, useChangeSet } from "@/lib/changeset/ChangeSetContext"
import { fetchCurrentData } from "@/lib/changeset/helpers"
import { transformToolInput } from "@/lib/changeset/transformations"
import { EntityType, OperationType } from "@/lib/changeset/types"
import { useEffect, useRef, useState } from "react"

/**
 * Parse tool name to extract entity and operation
 * Example: "createTransactionChangeRequest" -> { entity: "transaction", operation: "create" }
 */
function parseChangeRequestToolName(toolName: string): {
  entity: EntityType
  operation: OperationType
} {
  // Tool name pattern: {operation}{Entity}ChangeRequest
  const match = toolName.match(/^(create|update|delete)(Transaction|Account|Category)ChangeRequest$/)

  if (!match) {
    throw new Error(`Invalid changeset tool name: ${toolName}`)
  }

  const [, operation, entityPascal] = match
  const entity = entityPascal.toLowerCase() as EntityType

  return {
    entity,
    operation: operation as OperationType,
  }
}

export default function Page() {
  return (
    <ChangeSetProvider>
      <PageContent />
    </ChangeSetProvider>
  )
}

function PageContent() {
  const { addChange, confirmChangeSet, clearChangeSet, setAddToolOutput } = useChangeSet()

  // @ai-sdk/react v2 uses a different API - we manage input state locally
  const { messages, sendMessage, setMessages, status, addToolOutput } = useChat({
    // Defaults to /api/chat endpoint
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      // Check if it's a dynamic tool first for proper type narrowing
      if (toolCall.dynamic) {
        return;
      }

      const toolName = toolCall.toolName

      // Define client-side changeset tools (tools without execute function)
      const changesetTools = [
        // Entity-specific change request tools
        "createTransactionChangeRequest",
        "updateTransactionChangeRequest",
        "deleteTransactionChangeRequest",
        "createAccountChangeRequest",
        "updateAccountChangeRequest",
        "deleteAccountChangeRequest",
        "createCategoryChangeRequest",
        "updateCategoryChangeRequest",
        "deleteCategoryChangeRequest",
        // Management tools
        "confirmChangeSet",
        "resetChangeSet",
      ]

      // Only handle client-side changeset tools
      // For server-side tools, return to let SDK handle them
      if (!changesetTools.includes(toolName)) {
        return;
      }

      // Handle entity-specific change request tools
      if (toolName.endsWith("ChangeRequest")) {
        try {
          // Parse tool name to extract entity and operation
          const { entity, operation } = parseChangeRequestToolName(toolName)

          // Transform tool input to ChangeRequest format
          const transformed = transformToolInput(entity, operation, toolCall.input)

          // Fetch currentData if recordId present (for updates/deletes)
          let currentData = null
          if (transformed.recordId) {
            currentData = await fetchCurrentData(entity, transformed.recordId)
          }

          // Add to changeset context
          addChange({
            entity: transformed.entity,
            operation: transformed.operation,
            recordId: transformed.recordId,
            currentData,
            proposedData: transformed.proposedData,
          })

          // Send success response to AI
          addToolOutput({
            tool: toolName,
            toolCallId: toolCall.toolCallId,
            output: {
              success: true,
              message: `Change request added: ${operation} ${entity}`,
            },
          })
        } catch (error) {
          console.error(`Error in ${toolName}:`, error)
          addToolOutput({
            tool: toolName,
            toolCallId: toolCall.toolCallId,
            state: "output-error",
            errorText: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      if (toolName === "confirmChangeSet") {
        try {
          // Mark as pending approval in context FIRST
          confirmChangeSet(toolCall.toolCallId)

          // CREATE WIDGET IMPERATIVELY (data doesn't matter, widget uses Context)
          // This displays the widget immediately, before addToolOutput is called
          addWidget({
            id: toolCall.toolCallId,
            toolName: "confirmChangeSet",
            toolArgs: toolCall.input,
            data: null, // Widget ignores this, gets data from ChangeSetContext
            autoFocus: true,
          })

          // DO NOT call addToolOutput here - widget will call it after user approval
        } catch (error) {
          console.error(`Error in confirmChangeSet:`, error)
          addToolOutput({
            tool: toolName,
            toolCallId: toolCall.toolCallId,
            state: "output-error",
            errorText: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      if (toolName === "resetChangeSet") {
        try {
          clearChangeSet()

          // Manually call addToolOutput
          addToolOutput({
            tool: toolName,
            toolCallId: toolCall.toolCallId,
            output: {
              success: true,
              message: "Change set cleared",
            },
          })
        } catch (error) {
          console.error(`Error in resetChangeSet:`, error)
          addToolOutput({
            tool: toolName,
            toolCallId: toolCall.toolCallId,
            state: "output-error",
            errorText: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }
    },
  })

  // Set addToolOutput in context so widget can use it
  useEffect(() => {
    setAddToolOutput(() => addToolOutput)
  }, [addToolOutput, setAddToolOutput])

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

  // Use widget manager with new imperative API
  const { widgets, activeTab, setActiveTab, clearWidgets, addWidget } = useWidgetManager(messages)

  // Auto-focus logic has been moved into useWidgetManager
  // No longer need hardcoded widget-type-to-tab mappings here

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
        addToolOutput={addToolOutput}
      />

      {/* Right Panel: Dashboard Widgets */}
      <div className="flex-1 bg-muted/20">
        <Dashboard widgets={widgets} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
