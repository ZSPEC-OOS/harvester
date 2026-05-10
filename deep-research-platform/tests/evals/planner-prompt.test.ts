import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const planner = fs.readFileSync(path.join(process.cwd(), 'prompts/planner.system.md'), 'utf8');

describe('planner prompt regression', () => {
  it('requires json only and forbids markdown', () => {
    expect(planner).toMatch(/Return ONLY valid JSON/i);
    expect(planner).toMatch(/No markdown/i);
  });

  it('contains required fields', () => {
    ['objective','subquestions','searchQueries','inclusionCriteria','exclusionCriteria'].forEach((k)=>expect(planner).toContain(k));
  });
});
