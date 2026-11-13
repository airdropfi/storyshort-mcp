/**
 * Values the StoryShort API accepts or charges, as this package advertises them to agents.
 *
 * This package is published on its own and cannot import the app, so these are copies.
 * Each copy is pinned to its source by src/lib/__tests__/mcp-stdio-catalog-sync.test.ts in
 * the app (VideoStatus and VideoQuality enums, FEATURE_COSTS). Change the source and that
 * test names the line to change here. Hand-typed values are how the tools came to offer
 * status GENERATING (rejected by the API) and "40-150 credits" for a 40-credit video.
 */

/** Prisma VideoStatus, in schema order. */
export const VIDEO_STATUSES = [
  'PENDING',
  'GENERATING_SCRIPT',
  'GENERATING_VOICE',
  'FETCHING_MEDIA',
  'RENDERING',
  'COMPLETED',
  'FAILED',
] as const;

/** Prisma VideoQuality. */
export const VIDEO_QUALITIES = ['HD_720', 'FULL_HD_1080'] as const;

/** FEATURE_COSTS.video_standard and FEATURE_COSTS.voice_over_premium. */
export const CREDIT_COSTS = {
  videoStandard: 40,
  elevenLabsVoice: 25,
} as const;

/** /api/v1 videos use the plan's default voice (Google Cloud), which carries no premium. */
export const API_VIDEO_CREDITS = CREDIT_COSTS.videoStandard;

export const API_VIDEO_COST_TEXT =
  `Costs ${API_VIDEO_CREDITS} credits with the default voice; art style does not change the price.`;

export const POLL_HINT =
  'Rendering is asynchronous: poll storyshort_get_video every 20-30 seconds until status is COMPLETED or FAILED. ' +
  'If get_video returns blockedReason, stop polling and act on it (e.g. top up credits).';
