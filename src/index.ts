#!/usr/bin/env node

/**
 * StoryShort MCP Server
 *
 * Enables AI agents (Claude, Cursor, etc.) to generate videos via StoryShort API.
 * Usage: npx @storyshort/mcp-server --api-key sk_live_xxx
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StoryShortClient } from './client.js';
import { DEFAULT_BASE_URL, VERSION } from './constants.js';
import { resolveApiKey } from './config.js';

// ── Tool registrations ──
import { registerVideoTools } from './tools/videos.js';
import { registerNicheTools } from './tools/niches.js';
import { registerCreditTools } from './tools/credits.js';
import { registerUsageTools } from './tools/usage.js';
import { registerBillingTools } from './tools/billing.js';
import { registerKeyTools } from './tools/keys.js';

// ── Resources ──
import { registerCreditResource } from './resources/credits.js';
import { registerRateLimitResource } from './resources/rate-limit.js';

// ── Prompts ──
import { registerGenerateVideoPrompt } from './prompts/generate-video.js';
import { registerCloneViralPrompt } from './prompts/clone-viral.js';

// ── CLI arg parsing ──

function parseArgs(argv: string[]): { apiKey: string; baseUrl: string } {
  let apiKey = resolveApiKey(argv);
  let baseUrl = DEFAULT_BASE_URL;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--api-key' && argv[i + 1]) {
      apiKey = argv[++i];
    } else if (argv[i] === '--base-url' && argv[i + 1]) {
      baseUrl = argv[++i];
    } else if (argv[i] === '--help' || argv[i] === '-h') {
      console.error(`storyshort-mcp-server v${VERSION}

Usage: storyshort-mcp --api-key <key> [--base-url <url>]

Options:
  --api-key <key>    StoryShort API key (or set STORYSHORT_API_KEY env var; legacy AUTOSHORT_API_KEY also works)
  --base-url <url>   API base URL (default: ${DEFAULT_BASE_URL})
  --help, -h         Show this help message

Get your API key at: https://storyshort.app/en/developers`);
      process.exit(0);
    }
  }

  if (!apiKey) {
    console.error('Note: no API key set, so tools are listed but cannot be called. Use --api-key <key> or set STORYSHORT_API_KEY.');
    console.error('Get your API key at: https://storyshort.app/en/developers');
  }

  return { apiKey, baseUrl };
}

// ── Main ──

async function main() {
  const { apiKey, baseUrl } = parseArgs(process.argv.slice(2));
  const client = new StoryShortClient(apiKey, baseUrl);

  const server = new McpServer({
    name: 'storyshort-mcp-server',
    version: VERSION,
  });

  // Register all tools
  registerVideoTools(server, client);
  registerNicheTools(server, client);
  registerCreditTools(server, client);
  registerUsageTools(server, client);
  registerBillingTools(server, client);
  registerKeyTools(server, client);

  // Register resources
  registerCreditResource(server, client);
  registerRateLimitResource(server, client);

  // Register prompts
  registerGenerateVideoPrompt(server);
  registerCloneViralPrompt(server);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
