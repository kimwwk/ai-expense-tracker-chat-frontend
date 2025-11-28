"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { ChangeSet, ChangeRequest } from "./types"

interface ChangeSetContextType {
  changeSet: ChangeSet | null
  addChange: (change: Omit<ChangeRequest, "id" | "createdAt" | "sequenceOrder">) => void
  confirmChangeSet: (toolCallId: string) => void
  clearChangeSet: () => void
  hasChanges: boolean
  addToolOutput?: any // Function to call after user approval
  setAddToolOutput: (fn: any) => void
}

const ChangeSetContext = createContext<ChangeSetContextType | null>(null)

interface ChangeSetProviderProps {
  children: ReactNode
}

export function ChangeSetProvider({ children }: ChangeSetProviderProps) {
  const [changeSet, setChangeSet] = useState<ChangeSet | null>(null)
  const [addToolOutput, setAddToolOutput] = useState<any>(undefined)

  const addChange = useCallback(
    (change: Omit<ChangeRequest, "id" | "createdAt" | "sequenceOrder">) => {
      setChangeSet((prev) => {
        const newRequest: ChangeRequest = {
          ...change,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          sequenceOrder: (prev?.requests.length || 0) + 1,
        }

        if (!prev) {
          return {
            id: crypto.randomUUID(),
            requests: [newRequest],
            status: "building",
            createdAt: Date.now(),
          }
        }

        return {
          ...prev,
          requests: [...prev.requests, newRequest],
        }
      })
    },
    []
  )

  const confirmChangeSet = useCallback((toolCallId: string) => {
    setChangeSet((prev) => (prev ? { ...prev, status: "pending_approval", toolCallId } : null))
  }, [])

  const clearChangeSet = useCallback(() => {
    setChangeSet(null)
  }, [])

  return (
    <ChangeSetContext.Provider
      value={{
        changeSet,
        addChange,
        confirmChangeSet,
        clearChangeSet,
        hasChanges: !!changeSet && changeSet.requests.length > 0,
        addToolOutput,
        setAddToolOutput,
      }}
    >
      {children}
    </ChangeSetContext.Provider>
  )
}

export function useChangeSet() {
  const context = useContext(ChangeSetContext)
  if (!context) throw new Error("useChangeSet must be used within ChangeSetProvider")
  return context
}
