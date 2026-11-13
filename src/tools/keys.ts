/**
 * API Keys MCP tool: list keys
 * Note: Only key prefixes are returned, never full API key secrets.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';

export function registerKeyTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_list_api_keys',
    'List your API keys with prefix, scopes, rate limits, and usage stats. Note: only key prefixes shown, never full secrets.',
    {},
    withErrorBoundary(async () => jsonResult(await client.listApiKeys())),
  );
}
