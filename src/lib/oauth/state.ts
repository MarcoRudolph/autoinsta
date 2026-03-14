const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(input: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(input, 'base64'));
  }

  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeOAuthState(payload: Record<string, unknown>): string {
  return bytesToBase64(encoder.encode(JSON.stringify(payload)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeOAuthState<T>(rawState: string): T {
  const normalized = rawState.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(decoder.decode(base64ToBytes(padded))) as T;
}
