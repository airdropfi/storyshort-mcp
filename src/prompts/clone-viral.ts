/**
 * Viral video cloning prompt template
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * Hidden unless VIRAL_FEATURES_ENABLED=true: the viral/clone surfaces are
 * switched off during the Whop compliance audit.
 */
export function registerCloneViralPrompt(
  server: McpServer,
  env: Record<string, string | undefined> = process.env,
) {
  if (env.VIRAL_FEATURES_ENABLED !== 'true') return;
  server.prompt(
    'clone_viral_video',
    'Clone a viral video concept with AI-generated content',
    { topic: z.string().describe('Viral video topic or concept to clone') },
    ({ topic }) => ({
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Help me clone a viral video concept about "${topic}" using StoryShort.

Steps:
1. Check credit balance with storyshort_get_credit_balance
2. List available niches with storyshort_list_niches
3. Pick the best niche that matches "${topic}"
4. Generate the video with storyshort_generate_video:
   - topic: A compelling hook based on "${topic}"
   - niche: Best matching niche
   - duration: 30 (short-form viral content)
   - artStyle: AUTOSHORTS (professional cinematic)
5. Monitor with storyshort_get_video until COMPLETED
6. Share the result

Tips for viral content:
- Start with a strong hook in the first 3 seconds
- Keep it under 60 seconds for maximum engagement
- Use trending niches (MOTIVATIONAL, AI_FACTS, PSYCHOLOGY_FACTS)`,
        },
      }],
    }),
  );
}
