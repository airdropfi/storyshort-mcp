/**
 * Tests for tool-helpers: withErrorBoundary and jsonResult
 */

import { describe, it, expect, vi } from 'vitest';
import { withErrorBoundary, jsonResult } from '../src/tool-helpers.js';
import { StoryShortApiError } from '../src/client.js';

// Need real StoryShortApiError
vi.mock('../src/client.js', () => ({
  StoryShortApiError: class StoryShortApiError extends Error {
    constructor(message: string, public status: number, public code: string) {
      super(message);
      this.name = 'StoryShortApiError';
    }
  },
}));

describe('jsonResult', () => {
  it('formats object as JSON text content', () => {
    const result = jsonResult({ id: 'test', balance: 100 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(JSON.parse(result.content[0].text)).toEqual({ id: 'test', balance: 100 });
  });

  it('formats array as JSON', () => {
    const result = jsonResult([1, 2, 3]);
    expect(JSON.parse(result.content[0].text)).toEqual([1, 2, 3]);
  });

  it('does not set isError', () => {
    const result = jsonResult({ ok: true });
    expect(result.isError).toBeUndefined();
  });
});

describe('withErrorBoundary', () => {
  it('passes through successful result', async () => {
    const handler = withErrorBoundary(async () => jsonResult({ ok: true }));
    const result = await handler({});
    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toEqual({ ok: true });
  });

  it('catches StoryShortApiError and returns isError: true', async () => {
    const handler = withErrorBoundary(async () => {
      throw new StoryShortApiError('Not found', 404, 'NOT_FOUND');
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('404');
    expect(result.content[0].text).toContain('NOT_FOUND');
    expect(result.content[0].text).toContain('Not found');
  });

  it('catches generic Error and returns isError: true', async () => {
    const handler = withErrorBoundary(async () => {
      throw new Error('Network timeout');
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Network timeout');
  });

  it('catches non-Error throw and returns isError: true', async () => {
    const handler = withErrorBoundary(async () => {
      throw 'string error';
    });
    const result = await handler({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('string error');
  });

  it('passes params to wrapped function', async () => {
    const spy = vi.fn(async (p: { id: string }) => jsonResult({ id: p.id }));
    const handler = withErrorBoundary(spy);
    await handler({ id: 'test123' });
    expect(spy).toHaveBeenCalledWith({ id: 'test123' });
  });
});
