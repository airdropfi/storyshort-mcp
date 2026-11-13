/**
 * Tests for MCP prompts: generate_video, clone_viral_video
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerGenerateVideoPrompt } from '../src/prompts/generate-video.js';
import { registerCloneViralPrompt } from '../src/prompts/clone-viral.js';

// Mock fetch
global.fetch = vi.fn();

describe('MCP Prompts', () => {
  let server: McpServer;
  const registeredPrompts = new Map<string, any>();

  beforeEach(() => {
    vi.clearAllMocks();
    registeredPrompts.clear();
    server = new McpServer({ name: 'test', version: '1.0.0' });

    // Capture prompt registrations
    const origPrompt = server.prompt.bind(server);
    server.prompt = ((name: string, description: string, schema: any, handler: any) => {
      registeredPrompts.set(name, { description, schema, handler });
      return origPrompt(name, description, schema, handler);
    }) as any;
  });

  describe('registerGenerateVideoPrompt', () => {
    it('registers generate_video prompt', () => {
      registerGenerateVideoPrompt(server);
      expect(registeredPrompts.has('generate_video')).toBe(true);
    });

    it('returns messages with topic when provided', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'AI facts' });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content.text).toContain('AI facts');
    });

    it('returns messages without topic when not provided', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({});
      expect(result.messages[0].content.text).toContain('ask the user');
    });

    it('includes credit cost information', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'test' });
      const text = result.messages[0].content.text;
      expect(text).toContain('Costs 40 credits with the default voice');
      expect(text).toContain('ElevenLabs voice adds 25');
      expect(text).not.toContain('+50');
      expect(text).toContain('blockedReason');
    });

    it('includes step-by-step tool names', () => {
      registerGenerateVideoPrompt(server);
      const handler = registeredPrompts.get('generate_video').handler;
      const result = handler({ topic: 'test' });
      const text = result.messages[0].content.text;
      expect(text).toContain('storyshort_get_credit_balance');
      expect(text).toContain('storyshort_list_niches');
      expect(text).toContain('storyshort_generate_video');
      expect(text).toContain('storyshort_get_video');
    });
  });

  describe('registerCloneViralPrompt', () => {
    it('is hidden while VIRAL_FEATURES_ENABLED is unset or not "true"', () => {
      registerCloneViralPrompt(server, {});
      registerCloneViralPrompt(server, { VIRAL_FEATURES_ENABLED: 'false' });
      expect(registeredPrompts.has('clone_viral_video')).toBe(false);
    });

    it('registers clone_viral_video prompt', () => {
      registerCloneViralPrompt(server, { VIRAL_FEATURES_ENABLED: 'true' });
      expect(registeredPrompts.has('clone_viral_video')).toBe(true);
    });

    it('returns messages with topic', () => {
      registerCloneViralPrompt(server, { VIRAL_FEATURES_ENABLED: 'true' });
      const handler = registeredPrompts.get('clone_viral_video').handler;
      const result = handler({ topic: 'Motivational content' });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content.text).toContain('Motivational content');
    });

    it('recommends short-form duration for viral content', () => {
      registerCloneViralPrompt(server, { VIRAL_FEATURES_ENABLED: 'true' });
      const handler = registeredPrompts.get('clone_viral_video').handler;
      const result = handler({ topic: 'test' });
      expect(result.messages[0].content.text).toContain('duration: 30');
    });

    it('includes viral tips', () => {
      registerCloneViralPrompt(server, { VIRAL_FEATURES_ENABLED: 'true' });
      const handler = registeredPrompts.get('clone_viral_video').handler;
      const result = handler({ topic: 'test' });
      expect(result.messages[0].content.text).toContain('hook');
    });
  });
});
