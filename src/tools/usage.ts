/**
 * Usage MCP tool: get usage statistics
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';

export function registerUsageTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_get_usage_stats',
    'Get API usage statistics: credit balance, API call counts (today/total), and recent credit transactions.',
    {},
    withErrorBoundary(async () => jsonResult(await client.getUsageStats())),
  );
}
