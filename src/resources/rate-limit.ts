/**
 * Rate limit MCP resource — exposes last-seen rate limit headers
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryShortClient } from '../client.js';

export function registerRateLimitResource(server: McpServer, client: StoryShortClient) {
  server.resource(
    'rate-limit',
    'storyshort://usage/rate-limit',
    { description: 'Current API rate limit status from most recent request', mimeType: 'application/json' },
    async () => {
      const info = client.lastRateLimit ?? { limit: null, remaining: null, resetAt: null, note: 'No API requests made yet' };
      return {
        contents: [{
          uri: 'storyshort://usage/rate-limit',
          mimeType: 'application/json',
          text: JSON.stringify(info, null, 2),
        }],
      };
    },
  );
}
