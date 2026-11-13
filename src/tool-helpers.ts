/**
 * Shared helpers for MCP tool handlers
 */

import { StoryShortApiError } from './client.js';

/** Tool result content type */
type ToolResult = { content: Array<{ type: 'text'; text: string }>; isError?: boolean };

/**
 * Wrap a tool handler with error boundary.
 * Returns structured error text with status code for StoryShortApiError,
 * or generic error message for unexpected errors.
 */
export function withErrorBoundary<T>(
  fn: (params: T) => Promise<ToolResult>,
): (params: T) => Promise<ToolResult> {
  return async (params: T) => {
    try {
      return await fn(params);
    } catch (e) {
      const msg = e instanceof StoryShortApiError
        ? `Error ${e.status} (${e.code}): ${e.message}`
        : `Error: ${e instanceof Error ? e.message : String(e)}`;
      return { content: [{ type: 'text' as const, text: msg }], isError: true };
    }
  };
}

/** Format API response as JSON text content */
export function jsonResult(data: unknown): ToolResult {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}
