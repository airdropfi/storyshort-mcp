/**
 * Video MCP tools: generate, get status, list videos
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { StoryShortClient } from '../client.js';
import { withErrorBoundary, jsonResult } from '../tool-helpers.js';
import { API_VIDEO_COST_TEXT, POLL_HINT, VIDEO_QUALITIES, VIDEO_STATUSES } from '../catalog.js';

export function registerVideoTools(server: McpServer, client: StoryShortClient) {
  server.tool(
    'storyshort_generate_video',
    `Generate an AI video from a topic. Returns a video ID for status polling. ${API_VIDEO_COST_TEXT} ` +
      `The request is refused with 402 INSUFFICIENT_CREDITS (credits needed, available, top-up URL) when the balance is short. ${POLL_HINT}`,
    {
      topic: z.string().min(1).max(500).describe('Video topic or script idea'),
      niche: z.string().optional().describe('Video niche (e.g., MOTIVATIONAL, AI_FACTS, SCARY_STORIES); see storyshort_list_niches'),
      duration: z.number().optional().describe('Target duration in seconds: 30, 60, or 90'),
      artStyle: z.string().optional().describe('Art style id (e.g., AUTOSHORTS, COMIC_BOOK, PIXEL_ART); legacy ids LEGO, DISNEY_TOON, STUDIO_GHIBLI are shown as Brick Toy, Storybook Cartoon, Hand-drawn Anime. See storyshort_list_niches'),
      quality: z
        .enum(VIDEO_QUALITIES)
        .optional()
        .describe("Output resolution. Omit to use the plan's resolution. Asking for one the plan does not render returns 403 QUALITY_NOT_IN_PLAN."),
    },
    withErrorBoundary(async (params) => jsonResult(await client.generateVideo(params))),
  );

  server.tool(
    'storyshort_get_video',
    'Get video status and details by ID. Use after generating to check progress. ' +
      'A video that failed for lack of credits returns blockedReason INSUFFICIENT_CREDITS with creditsNeeded, creditsAvailable and topUpUrl: it will not be retried.',
    { id: z.string().describe('Video ID returned from generate') },
    withErrorBoundary(async ({ id }) => jsonResult(await client.getVideo(id))),
  );

  server.tool(
    'storyshort_list_videos',
    'List your videos with optional pagination and status filter.',
    {
      limit: z.number().int().min(1).max(100).default(20).optional().describe('Max results (1-100, default 20)'),
      offset: z.number().int().min(0).default(0).optional().describe('Pagination offset'),
      status: z.enum(VIDEO_STATUSES).optional().describe(`Filter by status: ${VIDEO_STATUSES.join(', ')}`),
    },
    withErrorBoundary(async (params) => jsonResult(await client.listVideos(params))),
  );
}
