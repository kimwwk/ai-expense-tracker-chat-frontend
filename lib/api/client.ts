/**
 * Base HTTP client for backend API communication
 */

import { isMockApiEnabled, mockApiClient } from "./mock"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Backend-less mode: serve everything from the in-memory mock so the app
  // stays fully functional without a live service. Enabled by default; set
  // NEXT_PUBLIC_USE_MOCK_API="false" to hit the real NEXT_PUBLIC_API_BASE_URL.
  if (isMockApiEnabled) {
    return mockApiClient<T>(endpoint, options)
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(`API request failed: ${response.statusText}`, response.status, errorData)
    }

    // Handle 204 No Content responses (e.g., DELETE requests)
    if (response.status === 204) {
      return undefined as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
