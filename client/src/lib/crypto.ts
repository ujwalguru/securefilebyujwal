/**
 * Crypto utilities for secure file sharing with AES-GCM encryption
 * and PBKDF2 key derivation from patterns/passphrases
 */

// Convert pattern to string representation
export function patternToString(pattern: number[]): string {
  return pattern.join('-');
}

// Derive encryption key from pattern/passphrase using PBKDF2
export async function deriveKeyFromPattern(
  pattern: string, 
  salt: Uint8Array, 
  iterations: number = 200000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pattern),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt file using AES-GCM
export async function encryptFile(
  bytes: Uint8Array, 
  key: CryptoKey
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    bytes
  );

  return {
    iv: iv,
    ciphertext: new Uint8Array(ciphertext)
  };
}

// Decrypt file using AES-GCM
export async function decryptFile(
  ciphertext: Uint8Array, 
  iv: Uint8Array, 
  key: CryptoKey
): Promise<Uint8Array> {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    ciphertext
  );

  return new Uint8Array(decrypted);
}

// Package file with header and ciphertext
export function packageFile(headerJson: object, ciphertext: Uint8Array): Uint8Array {
  const headerString = JSON.stringify(headerJson);
  const headerBytes = new TextEncoder().encode(headerString);
  const headerLength = headerBytes.length;
  
  // Create 4-byte header length prefix
  const lengthBytes = new Uint8Array(4);
  const view = new DataView(lengthBytes.buffer);
  view.setUint32(0, headerLength, false); // big-endian
  
  // Combine: length (4 bytes) + header + ciphertext
  const result = new Uint8Array(4 + headerLength + ciphertext.length);
  result.set(lengthBytes, 0);
  result.set(headerBytes, 4);
  result.set(ciphertext, 4 + headerLength);
  
  return result;
}

// Parse packaged file to extract header and ciphertext
export function parsePackage(fileBytes: Uint8Array): { header: any; ciphertext: Uint8Array } {
  if (fileBytes.length < 4) {
    throw new Error('Invalid file format: too short');
  }
  
  // Read header length from first 4 bytes
  const view = new DataView(fileBytes.buffer, fileBytes.byteOffset, 4);
  const headerLength = view.getUint32(0, false); // big-endian
  
  if (fileBytes.length < 4 + headerLength) {
    throw new Error('Invalid file format: header length mismatch');
  }
  
  // Extract header
  const headerBytes = fileBytes.slice(4, 4 + headerLength);
  const headerString = new TextDecoder().decode(headerBytes);
  let header;
  
  try {
    header = JSON.parse(headerString);
  } catch (e) {
    throw new Error('Invalid file format: malformed header JSON');
  }
  
  // Extract ciphertext
  const ciphertext = fileBytes.slice(4 + headerLength);
  
  return { header, ciphertext };
}

// Generate random salt
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Convert bytes to base64
export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(bytes)));
}

// Convert base64 to bytes
export function base64ToBytes(base64: string): Uint8Array {
  return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
}

// Validate pattern strength
export function validatePatternStrength(pattern: number[]): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  message: string;
} {
  if (pattern.length < 4) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Pattern must connect at least 4 dots'
    };
  }

  const uniqueDots = new Set(pattern).size;
  if (uniqueDots < 4) {
    return {
      isValid: false,
      strength: 'weak',
      message: 'Pattern must use at least 4 different dots'
    };
  }

  if (pattern.length < 6) {
    return {
      isValid: true,
      strength: 'medium',
      message: 'Pattern strength: Medium'
    };
  }

  return {
    isValid: true,
    strength: 'strong',
    message: 'Pattern strength: Strong'
  };
}