"use client"

import { useState, useEffect } from "react"
import { Key, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ApiKeyDialogProps {
  open: boolean
  onKeySubmit: (key: string) => void
}

export function ApiKeyDialog({ open, onKeySubmit }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key")
      return
    }

    // Basic validation for OpenAI API key format
    if (!apiKey.startsWith("sk-")) {
      setError("Invalid API key format. OpenAI keys start with 'sk-'")
      return
    }

    onKeySubmit(apiKey.trim())
    setError("")
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>API Key Required</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            To use the AI Expense Tracker, you need to provide your OpenAI API key.
            Your key will only be stored in memory for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="api-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit()
                }
              }}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">Don't have an API key?</p>
            <p>
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Save API Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
