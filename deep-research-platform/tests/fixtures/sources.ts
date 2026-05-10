import type { CandidateSource } from '@/types/research';

export const source = (overrides: Partial<CandidateSource> = {}): CandidateSource => ({
  id: 's1',
  title: 'Baseline Title',
  authors: ['Alice A.', 'Bob B.'],
  year: 2024,
  journal: 'Journal of Testing',
  doi: '10.1000/test',
  url: 'https://example.org',
  sourceType: 'journal',
  abstract: 'A'.repeat(300),
  ...overrides,
});
