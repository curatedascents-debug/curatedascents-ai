import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const SALT_ROUNDS = 12;
const COOKIE_NAME = "agency_session";
const JWT_EXPIRY = "7d";

export interface AgencySessionPayload extends JWTPayload {
  userId: number;
  agencyId: number;
  email: string;
  role: string;
  agencySlug: string;
  agencyName: string;
}

/**
 * Hash a password using bcrypt with cost factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get the JWT secret as Uint8Array for jose
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.AGENCY_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AGENCY_JWT_SECRET must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a JWT session token for an agency user
 */
export async function createSession(
  payload: Omit<AgencySessionPayload, "iat" | "exp">
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);

  return token;
}

/**
 * Verify a JWT session token and return the payload
 */
export async function verifySession(
  token: string
): Promise<AgencySessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as AgencySessionPayload;
  } catch {
    return null;
  }
}

/**
 * Get agency session from cookies (for use in server components/actions)
 */
export async function getAgencySession(): Promise<AgencySessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Set the agency session cookie
 */
export async function setAgencySessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Clear the agency session cookie
 */
export async function clearAgencySessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Export cookie name for use in middleware
 */
export const AGENCY_COOKIE_NAME = COOKIE_NAME;
