import { NextResponse } from "next/server"
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/api/transactions"
import { createAccount, updateAccount, deleteAccount } from "@/lib/api/accounts"
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categories"

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
        let result

        // Route to appropriate API based on entity and operation
        if (request.entity === "transaction") {
          if (request.operation === "create") {
            result = await createTransaction(request.proposedData)
            console.log(`  ✓ Created transaction:`, result)
          } else if (request.operation === "update") {
            result = await updateTransaction(request.recordId, request.proposedData)
            console.log(`  ✓ Updated transaction:`, result)
          } else if (request.operation === "delete") {
            await deleteTransaction(request.recordId)
            console.log(`  ✓ Deleted transaction`)
            result = { deleted: true }
          }
        } else if (request.entity === "account") {
          if (request.operation === "create") {
            result = await createAccount(request.proposedData)
            console.log(`  ✓ Created account:`, result)
          } else if (request.operation === "update") {
            result = await updateAccount(request.recordId, request.proposedData)
            console.log(`  ✓ Updated account:`, result)
          } else if (request.operation === "delete") {
            await deleteAccount(request.recordId)
            console.log(`  ✓ Deleted account`)
            result = { deleted: true }
          }
        } else if (request.entity === "category") {
          if (request.operation === "create") {
            result = await createCategory(request.proposedData)
            console.log(`  ✓ Created category:`, result)
          } else if (request.operation === "update") {
            result = await updateCategory(request.recordId, request.proposedData)
            console.log(`  ✓ Updated category:`, result)
          } else if (request.operation === "delete") {
            await deleteCategory(request.recordId)
            console.log(`  ✓ Deleted category`)
            result = { deleted: true }
          }
        } else {
          throw new Error(`Unsupported entity: ${request.entity}`)
        }

        results.push({ request: request.id, success: true, result })
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
