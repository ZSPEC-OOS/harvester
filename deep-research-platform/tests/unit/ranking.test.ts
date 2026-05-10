import { describe, expect, it } from 'vitest';
import { scoreAuthority, scoreEvidence, scoreRecency } from '@/lib/ranking/heuristics';
import { source } from '../fixtures/sources';

describe('ranking heuristics', () => {
  it('authority favors journal over web', () => {
    expect(scoreAuthority(source({ sourceType: 'journal' }))).toBeGreaterThan(scoreAuthority(source({ sourceType: 'web' })));
  });
  it('authority has doi boost and cap', () => {
    expect(scoreAuthority(source({ doi: '10.1/x' }))).toBeGreaterThan(scoreAuthority(source({ doi: null })));
    expect(scoreAuthority(source({ authors: Array(100).fill('A') }))).toBeLessThanOrEqual(10);
  });
  it('recency score for 2026 is near max and 1990 is low', () => {
    expect(scoreRecency(2026, 2026)).toBe(10);
    expect(scoreRecency(1990, 2026)).toBeLessThan(5);
  });
  it('evidence responds to abstract length and missing fields', () => {
    expect(scoreEvidence(source({ abstract: 'x'.repeat(500) }))).toBeGreaterThan(scoreEvidence(source({ abstract: 'tiny' })));
    expect(scoreEvidence(source({ doi: null, authors: [] }))).toBeLessThan(scoreEvidence(source()));
  });
  it('final weighted score is computable', () => {
    const r = 8, a = scoreAuthority(source()), rc = scoreRecency(2024, 2026), e = scoreEvidence(source());
    const final = r * 0.4 + a * 0.25 + rc * 0.2 + e * 0.15;
    expect(final).toBeGreaterThan(0);
  });
});
