/**
 * Video generation prompt template
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { API_VIDEO_COST_TEXT, CREDIT_COSTS } from '../catalog.js';

export function registerGenerateVideoPrompt(server: McpServer) {
  server.prompt(
    'generate_video',
    'Step-by-step guide to generate an AI video with StoryShort',
    { topic: z.string().optional().describe('Video topic (optional — will prompt if not provided)') },
    ({ topic }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Help me generate an AI video with StoryShort.${topic ? ` Topic: "${topic}"` : ''}

Steps:
1. First, check my credit balance with storyshort_get_credit_balance
2. List available options with storyshort_list_niches (niches, art styles, qualities)
3. Generate the video with storyshort_generate_video using:
   - topic: ${topic ? `"${topic}"` : '(ask the user)'}
   - niche: Choose the best match from available niches
   - duration: 60 (default, good for most videos)
   - artStyle: AUTOSHORTS (default cinematic style)
4. Poll storyshort_get_video every 20-30 seconds until status is COMPLETED or FAILED.
   If it returns blockedReason (e.g. INSUFFICIENT_CREDITS), stop polling and tell the user what it says.
5. Share the video URL when done

Credit costs: storyshort_generate_video: ${API_VIDEO_COST_TEXT} An ElevenLabs voice adds ${CREDIT_COSTS.elevenLabsVoice}.
If storyshort_get_credit_balance returns 403 INSUFFICIENT_SCOPE, the API key lacks "credits:read": the error says where to create a key that has it.`,
        },
      }],
    }),
  );
}
