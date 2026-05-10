import { beforeEach, describe, expect, it } from 'vitest';
import { decryptApiKey, encryptApiKey } from '@/lib/encryption';

describe('encryption', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'x'.repeat(32);
  });

  it('encrypts and decrypts round trip', () => {
    const encrypted = encryptApiKey('secret');
    expect(decryptApiKey(encrypted)).toBe('secret');
  });

  it('uses random iv so ciphertext differs per call', () => {
    expect(encryptApiKey('same')).not.toBe(encryptApiKey('same'));
  });

  it('handles empty string', () => {
    expect(decryptApiKey(encryptApiKey(''))).toBe('');
  });

  it('throws for invalid payload', () => {
    expect(() => decryptApiKey('not.valid')).toThrow();
  });
});
