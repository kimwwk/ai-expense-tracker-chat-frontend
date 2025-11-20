import { useState, FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useChatState } from '@/lib/store/chat-state'
import { useStreamInterceptor } from '@/lib/chat/stream-interceptor'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ChatInput() {
  const [input, setInput] = useState('')
  const { isStreaming, addMessage, setStreaming } = useChatState()
  const { processEvent } = useStreamInterceptor()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInput('')
    setStreaming(true)

    // Add placeholder for assistant response
    addMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    })

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [userMessage] // In real app, send full history
        })
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              processEvent(event)
            } catch (e) {
              console.error('Error parsing SSE event', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
      <div className="relative flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px] w-full resize-none pr-12"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          disabled={isStreaming}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!input.trim() || isStreaming}
          className="absolute right-2 bottom-2 h-8 w-8"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </form>
  )
}
