/**
 * Extract a user-friendly error message from an Axios error response.
 *
 * Priority:
 * 1. First validation error from `errors` object
 * 2. Top-level `message` field
 * 3. Provided fallback string
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const response = (err as any)?.response?.data;
  if (!response) return fallback;

  // Check for Laravel validation errors object
  const errors = response.errors;
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const firstMessage = firstKey ? errors[firstKey]?.[0] : null;
    if (typeof firstMessage === 'string' && firstMessage.length > 0) {
      return firstMessage;
    }
  }

  // Check for top-level message
  if (typeof response.message === 'string' && response.message.length > 0) {
    return response.message;
  }

  return fallback;
}
