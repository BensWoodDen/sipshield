import { hash, verify } from "@node-rs/argon2";

const pepper = process.env.AUTH_PEPPER ?? "";

export async function hashPassword(plain: string): Promise<string> {
  return hash(pepper + plain);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string
): Promise<boolean> {
  return verify(passwordHash, pepper + plain);
}
