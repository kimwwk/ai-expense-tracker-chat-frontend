import { NextResponse } from "next/server"
import { createTransaction } from "@/lib/api/transactions"

export async function POST(req: Request) {
  try {
    const { changeSet } = await req.json()

    console.log("=== Applying Change Set ===")
    console.log(`Change Set ID: ${changeSet.id}`)
    console.log(`Total Changes: ${changeSet.requests.length}`)

    const results = []

    for (const request of changeSet.requests) {
      console.log(`\n[${request.sequenceOrder}] ${request.operation.toUpperCase()} ${request.entity}`)
      console.log(`  Record ID: ${request.recordId || "N/A (new)"}`)
      console.log(`  Current Data:`, request.currentData)
      console.log(`  Proposed Data:`, request.proposedData)

      try {
        // Only actually execute createTransaction
        if (request.operation === "create" && request.entity === "transaction") {
          const result = await createTransaction(request.proposedData)
          console.log(`  ✓ Created transaction:`, result)
          results.push({ request: request.id, success: true, result })
        } else {
          // Simulate success for other operations
          console.log(`  ✓ Simulated (not implemented)`)
          results.push({ request: request.id, success: true, simulated: true })
        }
      } catch (error) {
        console.error(`  ✗ Failed:`, error)
        results.push({
          request: request.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    const allSucceeded = results.every((r) => r.success)

    return NextResponse.json({
      success: allSucceeded,
      message: allSucceeded
        ? `Successfully applied ${changeSet.requests.length} change(s)`
        : `Some changes failed - see console`,
      results,
    })
  } catch (error) {
    console.error("Change set apply error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
