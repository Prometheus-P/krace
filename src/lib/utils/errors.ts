// src/lib/utils/errors.ts

/**
 * Extract error message from an unknown error type
 * Used for consistent error handling across API routes
 */
export function getErrorMessage(error: unknown, fallback = 'Internal server error'): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
