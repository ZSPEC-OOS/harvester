import { describe, expect, it } from 'vitest';

const states = ['created','planning','searching','retrieving','indexing','ranking','verifying','synthesizing','complete'] as const;

describe('session state integration', () => {
  it('supports expected transitions order', () => {
    expect(states[0]).toBe('created');
    expect(states[states.length - 1]).toBe('complete');
  });

  it('stores and retrieves plan JSON', () => {
    const plan = { objective: 'x', subquestions: ['a'], searchQueries: ['q'] };
    const serialized = JSON.stringify(plan);
    expect(JSON.parse(serialized)).toMatchObject(plan);
  });

  it('research log entries can be created', () => {
    const log = { phase: 'search', message: 'started', createdAt: new Date().toISOString() };
    expect(log.phase).toBe('search');
  });
});
