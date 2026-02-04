"use client"

import { useState, useEffect } from "react"

export function useApiKey() {
  const [showDialog, setShowDialog] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    checkApiKeyConfiguration()
  }, [])

  const checkApiKeyConfiguration = async () => {
    try {
      // Check server environment
      const response = await fetch("/api/config")
      const data = await response.json()

      if (data.needsConfiguration) {
        setShowDialog(true)
      }
    } catch (error) {
      console.error("Failed to check API key configuration:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const saveApiKey = (key: string) => {
    // Store only in memory (state)
    setApiKey(key)
    setShowDialog(false)
  }

  const clearApiKey = () => {
    setApiKey(null)
    setShowDialog(true)
  }

  return {
    showDialog,
    isChecking,
    apiKey,
    saveApiKey,
    clearApiKey,
  }
}
