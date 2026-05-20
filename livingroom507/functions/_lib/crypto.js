import { base64ToBytes, bytesToBase64 } from './base64.js';

const encoder = new TextEncoder();
const PBKDF2_ITERATIONS = 310000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export async function hashPassword(password, saltBase64) {
  const salt = saltBase64
    ? base64ToBytes(saltBase64)
    : crypto.getRandomValues(new Uint8Array(SALT_BYTES));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      iterations: PBKDF2_ITERATIONS,
      salt,
    },
    keyMaterial,
    HASH_BYTES * 8
  );

  return {
    hash: bytesToBase64(new Uint8Array(derivedBits)),
    salt: bytesToBase64(salt),
  };
}
