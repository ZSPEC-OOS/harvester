import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const synthesis = fs.readFileSync(path.join(process.cwd(), 'prompts/synthesis.system.md'), 'utf8');

describe('synthesis prompt regression', () => {
  it('requires inline citations and references section', () => {
    expect(synthesis).toContain('inline numeric citations');
    expect(synthesis).toContain('References');
  });

  it('forbids fabricated claims and handles contradictions', () => {
    expect(synthesis).toContain('Avoid fabricated claims');
    expect(synthesis).toContain('evidence conflicts');
  });

  it('includes word count guidance', () => {
    expect(synthesis).toContain('800-1500');
    expect(synthesis).toContain('1500-3000');
  });
});
