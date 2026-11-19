import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

/** Format sama dengan `npm run admin:hash`: `scrypt:<salt>:<hash>` (hex). */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

// Hash acak untuk menyamakan waktu respons saat email tidak terdaftar.
const DUMMY_HASH = `scrypt:${"0".repeat(32)}:${"0".repeat(KEY_LENGTH * 2)}`;

export async function verifyPassword(password: string, stored: string | null | undefined) {
  const [algorithm, salt, hash] = (stored ?? DUMMY_HASH).split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const derived = await derive(password, salt);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected) && stored !== undefined && stored !== null;
}
