import { describe, expect, it } from 'vitest';
import { formatApa, formatMla } from '@/server/citations/format';
import { source } from '../fixtures/sources';

describe('citations', () => {
  it('formats APA with year journal and doi', () => {
    const out = formatApa(source());
    expect(out).toContain('(2024)');
    expect(out).toContain('Journal of Testing');
    expect(out).toContain('https://doi.org/10.1000/test');
  });
  it('formats MLA', () => {
    expect(formatMla(source())).toContain('"Baseline Title."');
  });
  it('handles single author', () => {
    expect(formatApa(source({ authors: ['Solo'] }))).toContain('Solo');
  });
  it('uses et al for 3+ authors', () => {
    expect(formatApa(source({ authors: ['A', 'B', 'C'] }))).toContain('et al.');
  });
});
