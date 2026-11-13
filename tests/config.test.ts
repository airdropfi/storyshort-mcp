import { describe, it, expect } from 'vitest';
import { resolveApiKey } from '../src/config.js';

describe('resolveApiKey', () => {
  it('reads STORYSHORT_API_KEY', () => {
    expect(resolveApiKey([], { STORYSHORT_API_KEY: 's' })).toBe('s');
  });

  it('falls back to the legacy AUTOSHORT_API_KEY', () => {
    expect(resolveApiKey([], { AUTOSHORT_API_KEY: 'a' })).toBe('a');
  });

  it('prefers STORYSHORT_API_KEY over AUTOSHORT_API_KEY', () => {
    expect(resolveApiKey([], { STORYSHORT_API_KEY: 's', AUTOSHORT_API_KEY: 'a' })).toBe('s');
  });

  it('lets --api-key override the environment', () => {
    expect(resolveApiKey(['--api-key', 'c'], { STORYSHORT_API_KEY: 's' })).toBe('c');
  });

  it('returns an empty string when nothing is set', () => {
    expect(resolveApiKey([], {})).toBe('');
  });
});
