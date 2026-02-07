import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash, randomInt } from "crypto";

const JWT_EXPIRY = "30d";
const COOKIE_NAME = "customer_session";

export interface CustomerSessionPayload {
  clientId: number;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("CUSTOMER_JWT_SECRET (or ADMIN_SESSION_SECRET) must be configured");
  }
  return new TextEncoder().encode(secret);
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function createCustomerSession(
  payload: Omit<CustomerSessionPayload, "iat" | "exp">
): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
  return token;
}

export async function verifyCustomerSession(
  token: string
): Promise<CustomerSessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as CustomerSessionPayload;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCustomerSession(token);
}

export async function setCustomerSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getCustomerCookieName(): string {
  return COOKIE_NAME;
}
