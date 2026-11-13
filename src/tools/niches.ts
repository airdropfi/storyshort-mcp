/**
 * Niches MCP tool: list available video niches, art styles, qualities
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';

export function registerNicheTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_list_niches',
    'List available video niches, art styles, video qualities, and duration options for video generation.',
    {},
    withErrorBoundary(async () => jsonResult(await client.listNiches())),
  );
}
