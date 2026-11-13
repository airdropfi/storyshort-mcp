/**
 * StoryShort API HTTP Client
 *
 * Wraps all v1 API endpoints with typed methods.
 * Captures rate limit headers for MCP resource exposure.
 */

import { USER_AGENT } from './constants.js';
import type { RateLimitInfo } from './types.js';

export class StoryShortClient {
  /** Last rate limit info from API response headers */
  public lastRateLimit: RateLimitInfo | null = null;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
  ) {}

  /** Generic API request with auth, error handling, rate limit capture */
  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    if (!this.apiKey) {
      throw new StoryShortApiError('API key required. Set STORYSHORT_API_KEY or pass --api-key.', 401, 'MISSING_API_KEY');
    }
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Capture rate limit headers
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const resetAt = res.headers.get('x-ratelimit-reset');
    if (limit && remaining && resetAt) {
      this.lastRateLimit = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        resetAt,
      };
    }

    if (!res.ok) {
      let errorBody: { error?: string; code?: string } = {};
      try { errorBody = await res.json() as typeof errorBody; } catch { /* empty */ }
      const msg = errorBody.error || `API error: ${res.status} ${res.statusText}`;
      const code = errorBody.code || `HTTP_${res.status}`;
      throw new StoryShortApiError(msg, res.status, code);
    }

    return res.json() as Promise<T>;
  }

  // ── Video endpoints ──

  async generateVideo(params: {
    topic: string; niche?: string; duration?: number;
    artStyle?: string; quality?: string;
  }) {
    return this.request<{ id: string; status: string }>('POST', '/api/v1/videos/generate', params);
  }

  async getVideo(id: string) {
    return this.request<Record<string, unknown>>('GET', `/api/v1/videos/${encodeURIComponent(id)}`);
  }

  async listVideos(params?: { limit?: number; offset?: number; status?: string }) {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
    ).toString() : '';
    return this.request<{ videos: unknown[]; pagination: unknown }>('GET', `/api/v1/videos${qs}`);
  }

  // ── Niches ──

  async listNiches() {
    return this.request<{ niches: unknown[]; artStyles: unknown[]; videoQualities: unknown[]; durations: number[] }>(
      'GET', '/api/v1/scripts/niches'
    );
  }

  // ── Credits ──

  async getCreditBalance() {
    return this.request<{ balance: number; monthlyAllocation: number; bonusCredits: number; plan: string }>(
      'GET', '/api/v1/credits/balance'
    );
  }

  // ── Usage ──

  async getUsageStats() {
    return this.request<Record<string, unknown>>('GET', '/api/v1/usage/stats');
  }

  // ── Billing ──

  async getSubscription() {
    return this.request<Record<string, unknown>>('GET', '/api/v1/billing/subscription');
  }

  // ── API Keys ──

  async listApiKeys() {
    return this.request<{ apiKeys: unknown[] }>('GET', '/api/v1/keys');
  }
}

/** Typed API error with HTTP status and error code */
export class StoryShortApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'StoryShortApiError';
  }
}
