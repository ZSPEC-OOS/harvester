import { describe, expect, it } from 'vitest';
import { deduplicateSources, normalizeTitle } from '@/lib/search/types';
import { source } from '../fixtures/sources';

describe('deduplication', () => {
  it('deduplicates by doi', () => {
    const out = deduplicateSources([source(), source({ id: '2' })]);
    expect(out).toHaveLength(1);
  });
  it('deduplicates by normalized title when doi missing', () => {
    const out = deduplicateSources([source({ doi: null, title: 'A Study!' }), source({ id: '2', doi: null, title: ' a   study ' })]);
    expect(out).toHaveLength(1);
  });
  it('keeps short titles', () => {
    const out = deduplicateSources([source({ doi: null, title: 'AI' })]);
    expect(out).toHaveLength(1);
  });
  it('normalizes title text', () => {
    expect(normalizeTitle(' Hello,  WORLD! ')).toBe('hello world');
  });
});
