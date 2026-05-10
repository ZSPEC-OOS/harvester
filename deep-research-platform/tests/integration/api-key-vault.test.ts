import { beforeEach, describe, expect, it } from 'vitest';
import { decryptApiKey, encryptApiKey } from '@/lib/encryption';

interface StoredKey { userId: string; provider: string; encryptedKey: string }
const vault: StoredKey[] = [];

describe('api key vault integration', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'k'.repeat(32);
    vault.length = 0;
  });

  it('encrypts and stores key', () => {
    const encryptedKey = encryptApiKey('abc123');
    vault.push({ userId: 'u1', provider: 'deepseek', encryptedKey });
    expect(vault).toHaveLength(1);
    expect(decryptApiKey(vault[0].encryptedKey)).toBe('abc123');
  });

  it('query response omits encryptedKey field', () => {
    vault.push({ userId: 'u1', provider: 'deepseek', encryptedKey: encryptApiKey('abc123') });
    const response = vault.map(({ encryptedKey: _encryptedKey, ...rest }) => rest);
    expect(response[0]).not.toHaveProperty('encryptedKey');
  });
});
