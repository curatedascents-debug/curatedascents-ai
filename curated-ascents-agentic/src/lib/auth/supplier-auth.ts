import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SALT_ROUNDS = 12;
const JWT_EXPIRY = "7d";
const COOKIE_NAME = "supplier_session";

export interface SupplierSessionPayload {
  userId: number;
  supplierId: number;
  email: string;
  role: string;
  supplierName: string;
  iat?: number;
  exp?: number;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.SUPPLIER_JWT_SECRET || process.env.AGENCY_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SUPPLIER_JWT_SECRET (or AGENCY_JWT_SECRET) must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSupplierSession(
  payload: Omit<SupplierSessionPayload, "iat" | "exp">
): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(secret);
  return token;
}

export async function verifySupplierSession(token: string): Promise<SupplierSessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SupplierSessionPayload;
  } catch {
    return null;
  }
}

export async function getSupplierSession(): Promise<SupplierSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySupplierSession(token);
}

export async function setSupplierSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSupplierSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getSupplierCookieName(): string {
  return COOKIE_NAME;
}
