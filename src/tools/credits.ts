/**
 * Credits MCP tool: check credit balance
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';

export function registerCreditTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_get_credit_balance',
    'Check your current credit balance, monthly allocation, bonus credits, and plan tier.',
    {},
    withErrorBoundary(async () => jsonResult(await client.getCreditBalance())),
  );
}
