import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { tools } from "@/lib/ai/tools"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Convert UIMessages to ModelMessages for compatibility with streamText
  const modelMessages = convertToModelMessages(messages)

  const result = streamText({
    model: openai("gpt-5.1"),
    system: `You are an intelligent transaction assistant. You have access to tools to manage and view financial transactions.

    CRITICAL INSTRUCTION:
    When the user asks for information, use the appropriate tools.
    You often need to use multiple tools to give a complete answer.
    For example, if asked for a "summary", use getSpendingSummary.
    If asked for "transactions", use getTransactions.
    If asked about database schema or table structure, use getTableNames or getTableSchema.

    The frontend is designed to render "Widgets" based on the data you return.
    So, prefer calling tools that return structured data (like getTransactions, analyzeSpending)
    over just summarizing it in text if the user wants to "see" the data.

    However, you MUST still provide a helpful text response summarizing the findings.
    `,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(10),
    toolChoice: "auto",
  })

  return result.toUIMessageStreamResponse()
}
