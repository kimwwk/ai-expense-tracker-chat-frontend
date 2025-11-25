/**
 * Context utilities for AI system prompt
 * Provides system context and user preferences
 */

/**
 * Default currency setting
 * TODO: This should eventually be fetched from user preferences/settings
 */
const DEFAULT_CURRENCY = "USD"

/**
 * Get current system context to embed in the system prompt
 */
export function getSystemContext() {
  const now = new Date()

  return {
    currentTime: {
      iso: now.toISOString(),
      date: now.toISOString().split("T")[0], // YYYY-MM-DD format
    },
    preferences: {
      defaultCurrency: DEFAULT_CURRENCY,
    },
  }
}
