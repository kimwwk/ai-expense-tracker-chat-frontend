import { NextResponse } from "next/server"

export async function GET() {
  // Check if OPENAI_API_KEY exists and is not empty
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY?.trim())

  return NextResponse.json({
    hasOpenAiKey,
    needsConfiguration: !hasOpenAiKey,
  })
}
