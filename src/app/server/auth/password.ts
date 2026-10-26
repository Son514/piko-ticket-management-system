import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";

const ALGORITHM = "scrypt";
const COST = 32768; // N
const BLOCK_SIZE = 8; // r
const PARALLELIZATION = 1; // p
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;
const SALT_BYTES = 16;

function deriveKey(
  password: string,
  salt: string,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize("NFKC"), salt, keyLength, options, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
}

/**
 * Hash a password with scrypt. The returned string contains every parameter
 * needed to verify it later, so the cost can be raised without invalidating
 * existing hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("base64url");
  const key = await deriveKey(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: MAX_MEMORY,
  });

  return [
    ALGORITHM,
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt,
    key.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!storedHash) return false;

  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== ALGORITHM) return false;

  const [, cost, blockSize, parallelization, salt, encodedKey] = parts;
  const N = Number(cost);
  const r = Number(blockSize);
  const p = Number(parallelization);

  if (
    !Number.isSafeInteger(N) ||
    !Number.isSafeInteger(r) ||
    !Number.isSafeInteger(p) ||
    N <= 1 ||
    r <= 0 ||
    p <= 0
  ) {
    return false;
  }

  const expected = Buffer.from(encodedKey, "base64url");
  if (expected.length === 0) return false;

  const actual = await deriveKey(password, salt, expected.length, {
    N,
    r,
    p,
    maxmem: MAX_MEMORY,
  });

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * A stable hash used to keep the sign-in timing similar whether or not the
 * email exists in the database.
 */
export function getDummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword("piko-dummy-password");
  return dummyHash;
}
