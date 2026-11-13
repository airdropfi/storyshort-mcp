/**
 * Billing MCP tool: subscription status
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';

export function registerBillingTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_get_subscription',
    'Check your subscription plan, status, video limits, and credit allocation.',
    {},
    withErrorBoundary(async () => jsonResult(await client.getSubscription())),
  );
}
