import { NextRequest } from 'next/server'

/**
 * Mock LangGraph API Endpoint
 * Simulates a Python backend streaming SSE events
 * Handles:
 * 1. Text streaming
 * 2. Tool calls (with approval requests)
 * 3. External view updates
 */

export async function POST(req: NextRequest) {
  const { messages, approval } = await req.json()
  const lastMessage = messages[messages.length - 1]

  // Create a stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Scenario 1: Handling an approval response
      if (approval) {
        if (approval.status === 'approved') {
          sendEvent({ type: 'token', content: 'Action approved! Executing now...\n\n' })
          await new Promise(r => setTimeout(r, 1000))
          
          // Simulate tool execution result
          sendEvent({
            type: 'tool_result',
            tool: approval.tool,
            toolCallId: approval.toolCallId,
            data: { success: true, timestamp: new Date().toISOString() }
          })
          
          sendEvent({ type: 'token', content: 'The action has been completed successfully.' })
        } else {
          sendEvent({ type: 'token', content: 'Action rejected. Is there anything else I can help with?' })
        }
        controller.close()
        return
      }

      // Scenario 2: User asks to update dashboard (External View)
      if (lastMessage.content.toLowerCase().includes('dashboard')) {
        sendEvent({ type: 'token', content: 'Sure, I can update the dashboard for you.\n' })
        await new Promise(r => setTimeout(r, 500))
        
        // Tool call to update external view
        sendEvent({
          type: 'tool_call',
          tool: 'update_dashboard',
          toolCallId: `call_${Date.now()}`,
          params: { mode: 'analytics', data: { visitors: 1250, sales: 4500 } },
          metadata: { ui_target: 'dashboard', description: 'Switching to analytics view' }
        })
        
        await new Promise(r => setTimeout(r, 1000))
        sendEvent({ type: 'token', content: 'I\'ve switched the view to Analytics mode.' })
        controller.close()
        return
      }

      // Scenario 3: User asks for something requiring approval (Human-in-the-loop)
      if (lastMessage.content.toLowerCase().includes('deploy')) {
        sendEvent({ type: 'token', content: 'I can help with that deployment.\n' })
        await new Promise(r => setTimeout(r, 800))
        
        // Tool call requiring approval
        sendEvent({
          type: 'tool_call',
          tool: 'deploy_production',
          toolCallId: `call_${Date.now()}`,
          params: { environment: 'production', version: 'v2.0.1' },
          needsApproval: true,
          metadata: { description: 'Deploy v2.0.1 to Production' }
        })
        
        // Note: In a real LangGraph, the stream would pause here (interrupt)
        // We simulate the pause by ending the stream, waiting for the client to call back with approval
        controller.close()
        return
      }

      // Default: Standard chat response
      const text = "I'm a simulated LangGraph agent. You can ask me to:\n1. 'Update dashboard' (Changes external view)\n2. 'Deploy to production' (Triggers approval flow)"
      const tokens = text.split(' ')
      
      for (const token of tokens) {
        sendEvent({ type: 'token', content: token + ' ' })
        await new Promise(r => setTimeout(r, 50))
      }
      
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
