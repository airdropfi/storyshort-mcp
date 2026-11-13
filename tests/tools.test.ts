/**
 * Unit tests for MCP tool registrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StoryShortClient } from '../src/client.js';
import { registerVideoTools } from '../src/tools/videos.js';
import { registerNicheTools } from '../src/tools/niches.js';
import { registerCreditTools } from '../src/tools/credits.js';
import { registerUsageTools } from '../src/tools/usage.js';
import { registerBillingTools } from '../src/tools/billing.js';
import { registerKeyTools } from '../src/tools/keys.js';
import { VIDEO_STATUSES } from '../src/catalog.js';

// Mock the client
vi.mock('../src/client.js', () => ({
  StoryShortClient: vi.fn(),
  StoryShortApiError: class StoryShortApiError extends Error {
    constructor(message: string, public status: number, public code: string) {
      super(message);
    }
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('MCP Tool Registrations', () => {
  let server: McpServer;
  let client: StoryShortClient;
  const registeredTools = new Map<string, any>();

  beforeEach(() => {
    vi.clearAllMocks();
    registeredTools.clear();

    // Create real server with mocked tool registration
    server = new McpServer({
      name: 'test',
      version: '1.0.0',
    });

    // Capture tool registrations
    const originalTool = server.tool.bind(server);
    server.tool = ((name: string, description: string, schema: any, handler: any) => {
      registeredTools.set(name, { description, schema, handler });
      return originalTool(name, description, schema, handler);
    }) as any;

    // Create mock client
    client = {
      generateVideo: vi.fn(),
      getVideo: vi.fn(),
      listVideos: vi.fn(),
      listNiches: vi.fn(),
      getCreditBalance: vi.fn(),
      getUsageStats: vi.fn(),
      getSubscription: vi.fn(),
      listApiKeys: vi.fn(),
      lastRateLimit: null,
    } as any;
  });

  describe('registerVideoTools', () => {
    it('registers 3 video tools', () => {
      const initialCount = registeredTools.size;
      registerVideoTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 3);
    });

    it('registers storyshort_generate_video tool', () => {
      registerVideoTools(server, client);
      expect(registeredTools.has('storyshort_generate_video')).toBe(true);
      expect(registeredTools.get('storyshort_generate_video').description).toContain('Generate');
    });

    it('registers storyshort_get_video tool', () => {
      registerVideoTools(server, client);
      expect(registeredTools.has('storyshort_get_video')).toBe(true);
      expect(registeredTools.get('storyshort_get_video').description).toContain('status');
    });

    it('registers storyshort_list_videos tool', () => {
      registerVideoTools(server, client);
      expect(registeredTools.has('storyshort_list_videos')).toBe(true);
      expect(registeredTools.get('storyshort_list_videos').description).toContain('List');
    });

    it('generate video tool calls client method', async () => {
      (client.generateVideo as any).mockResolvedValue({ id: 'vid_123' });
      registerVideoTools(server, client);

      const handler = registeredTools.get('storyshort_generate_video').handler;
      const result = await handler({ topic: 'Test' });

      expect(client.generateVideo).toHaveBeenCalledWith({ topic: 'Test' });
      expect(result.content).toBeDefined();
    });
  });

  describe('registerNicheTools', () => {
    it('registers 1 niche tool', () => {
      const initialCount = registeredTools.size;
      registerNicheTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 1);
    });

    it('registers storyshort_list_niches tool', () => {
      registerNicheTools(server, client);
      expect(registeredTools.has('storyshort_list_niches')).toBe(true);
    });

    it('niche tool calls client method', async () => {
      (client.listNiches as any).mockResolvedValue({
        niches: [],
        artStyles: [],
        videoQualities: [],
        durations: [],
      });
      registerNicheTools(server, client);

      const handler = registeredTools.get('storyshort_list_niches').handler;
      const result = await handler({});

      expect(client.listNiches).toHaveBeenCalled();
      expect(result.content).toBeDefined();
    });
  });

  describe('registerCreditTools', () => {
    it('registers 1 credit tool', () => {
      const initialCount = registeredTools.size;
      registerCreditTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 1);
    });

    it('registers storyshort_get_credit_balance tool', () => {
      registerCreditTools(server, client);
      expect(registeredTools.has('storyshort_get_credit_balance')).toBe(true);
    });

    it('credit tool calls client method', async () => {
      (client.getCreditBalance as any).mockResolvedValue({
        balance: 1000,
        monthlyAllocation: 500,
        bonusCredits: 0,
        plan: 'free',
      });
      registerCreditTools(server, client);

      const handler = registeredTools.get('storyshort_get_credit_balance').handler;
      const result = await handler({});

      expect(client.getCreditBalance).toHaveBeenCalled();
      expect(result.content).toBeDefined();
    });
  });

  describe('registerUsageTools', () => {
    it('registers 1 usage tool', () => {
      const initialCount = registeredTools.size;
      registerUsageTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 1);
    });

    it('registers storyshort_get_usage_stats tool', () => {
      registerUsageTools(server, client);
      expect(registeredTools.has('storyshort_get_usage_stats')).toBe(true);
    });

    it('usage tool calls client method', async () => {
      (client.getUsageStats as any).mockResolvedValue({
        credits: { balance: 500, monthlyAllocation: 500 },
        apiCalls: { today: 10, total: 100 },
        recentTransactions: [],
      });
      registerUsageTools(server, client);

      const handler = registeredTools.get('storyshort_get_usage_stats').handler;
      const result = await handler({});

      expect(client.getUsageStats).toHaveBeenCalled();
      expect(result.content).toBeDefined();
    });
  });

  describe('registerBillingTools', () => {
    it('registers 1 billing tool', () => {
      const initialCount = registeredTools.size;
      registerBillingTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 1);
    });

    it('registers storyshort_get_subscription tool', () => {
      registerBillingTools(server, client);
      expect(registeredTools.has('storyshort_get_subscription')).toBe(true);
    });

    it('billing tool calls client method', async () => {
      (client.getSubscription as any).mockResolvedValue({
        plan: 'pro',
        hasActiveSubscription: true,
        videosUsed: 10,
        videosLimit: 50,
      });
      registerBillingTools(server, client);

      const handler = registeredTools.get('storyshort_get_subscription').handler;
      const result = await handler({});

      expect(client.getSubscription).toHaveBeenCalled();
      expect(result.content).toBeDefined();
    });
  });

  describe('registerKeyTools', () => {
    it('registers 1 key tool', () => {
      const initialCount = registeredTools.size;
      registerKeyTools(server, client);
      expect(registeredTools.size).toBe(initialCount + 1);
    });

    it('registers storyshort_list_api_keys tool', () => {
      registerKeyTools(server, client);
      expect(registeredTools.has('storyshort_list_api_keys')).toBe(true);
    });

    it('key tool calls client method', async () => {
      (client.listApiKeys as any).mockResolvedValue({ apiKeys: [] });
      registerKeyTools(server, client);

      const handler = registeredTools.get('storyshort_list_api_keys').handler;
      const result = await handler({});

      expect(client.listApiKeys).toHaveBeenCalled();
      expect(result.content).toBeDefined();
    });
  });

  describe('webhooks are not offered', () => {
    // Nothing on the server delivers video events (triggerWebhookEvent has no caller and
    // POST /api/v1/webhooks answers 501), so a webhook tool or param would send an agent
    // to wait for a call that never comes.
    it('registers no webhook tool and no webhookUrl param', () => {
      registerVideoTools(server, client);
      registerNicheTools(server, client);
      registerCreditTools(server, client);
      registerUsageTools(server, client);
      registerBillingTools(server, client);
      registerKeyTools(server, client);
      for (const [name, tool] of registeredTools) {
        expect(name).not.toMatch(/webhook/i);
        expect(Object.keys(tool.schema ?? {})).not.toContain('webhookUrl');
        expect(tool.description).not.toMatch(/webhook/i);
      }
    });
  });

  describe('schemas match what the API accepts', () => {
    it('list_videos status is the VideoStatus enum (no GENERATING)', () => {
      registerVideoTools(server, client);
      const status = registeredTools.get('storyshort_list_videos').schema.status;
      expect(status.unwrap().options).toEqual([...VIDEO_STATUSES]);
      expect(status.safeParse('GENERATING').success).toBe(false);
      expect(status.safeParse('GENERATING_SCRIPT').success).toBe(true);
    });

    it('generate_video states the real cost and the quality policy', () => {
      registerVideoTools(server, client);
      const tool = registeredTools.get('storyshort_generate_video');
      expect(tool.description).toContain('Costs 40 credits with the default voice');
      expect(tool.description).not.toContain('40-150');
      expect(tool.schema.quality.unwrap().options).toEqual(['HD_720', 'FULL_HD_1080']);
      expect(tool.schema.quality.description).toContain('QUALITY_NOT_IN_PLAN');
    });
  });

  describe('Error boundary behavior', () => {
    it('tool returns isError: true when client throws StoryShortApiError', async () => {
      const { StoryShortApiError } = await import('../src/client.js');
      (client.getCreditBalance as any).mockRejectedValue(new StoryShortApiError('Unauthorized', 401, 'AUTH_INVALID'));
      registerCreditTools(server, client);

      const handler = registeredTools.get('storyshort_get_credit_balance').handler;
      const result = await handler({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('401');
      expect(result.content[0].text).toContain('AUTH_INVALID');
    });

    it('tool returns isError: true when client throws generic error', async () => {
      (client.listVideos as any).mockRejectedValue(new Error('Network failure'));
      registerVideoTools(server, client);

      const handler = registeredTools.get('storyshort_list_videos').handler;
      const result = await handler({});
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Network failure');
    });

    it('all tools return JSON content on success (not raw objects)', async () => {
      (client.getSubscription as any).mockResolvedValue({ plan: 'pro' });
      registerBillingTools(server, client);

      const handler = registeredTools.get('storyshort_get_subscription').handler;
      const result = await handler({});
      expect(result.content[0].type).toBe('text');
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });
  });

  describe('Tool count and coverage', () => {
    it('all 8 tools are registered when all registrations called', () => {
      registerVideoTools(server, client);
      registerNicheTools(server, client);
      registerCreditTools(server, client);
      registerUsageTools(server, client);
      registerBillingTools(server, client);
      registerKeyTools(server, client);

      // Video: 3, Niches: 1, Credits: 1, Usage: 1, Billing: 1, Keys: 1 = 8
      expect(registeredTools.size).toBe(8);
    });

    it('all tools have descriptions', () => {
      registerVideoTools(server, client);
      registerNicheTools(server, client);
      registerCreditTools(server, client);
      registerUsageTools(server, client);
      registerBillingTools(server, client);
      registerKeyTools(server, client);

      for (const [name, tool] of registeredTools) {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(0);
      }
    });

    it('all tools have handlers', () => {
      registerVideoTools(server, client);
      registerNicheTools(server, client);
      registerCreditTools(server, client);
      registerUsageTools(server, client);
      registerBillingTools(server, client);
      registerKeyTools(server, client);

      for (const [name, tool] of registeredTools) {
        expect(typeof tool.handler).toBe('function');
      }
    });
  });
});
