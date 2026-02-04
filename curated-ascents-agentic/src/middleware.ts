import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "admin_session";
const AGENCY_COOKIE_NAME = "agency_session";
const SUPPLIER_COOKIE_NAME = "supplier_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle supplier routes (both pages and API)
  if (pathname.startsWith("/supplier") || pathname.startsWith("/api/supplier")) {
    return handleSupplierRoutes(request, pathname);
  }

  // Handle agency routes (both pages and API)
  if (pathname.startsWith("/agency") || pathname.startsWith("/api/agency")) {
    return handleAgencyRoutes(request, pathname);
  }

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    return handleAdminRoutes(request, pathname);
  }

  return NextResponse.next();
}

async function handleSupplierRoutes(
  request: NextRequest,
  pathname: string
): Promise<NextResponse> {
  const isApiRoute = pathname.startsWith("/api/supplier");

  // Allow login page and auth API routes without authentication
  if (pathname === "/supplier/login" || pathname.startsWith("/api/supplier/auth")) {
    // If on login page and already logged in, redirect to dashboard
    if (pathname === "/supplier/login") {
      const sessionCookie = request.cookies.get(SUPPLIER_COOKIE_NAME);
      if (sessionCookie?.value) {
        const session = await verifySupplierToken(sessionCookie.value);
        if (session) {
          return NextResponse.redirect(
            new URL("/supplier/dashboard", request.url)
          );
        }
      }
    }
    return NextResponse.next();
  }

  // Protect all other /supplier/* and /api/supplier/* routes
  const sessionCookie = request.cookies.get(SUPPLIER_COOKIE_NAME);

  if (!sessionCookie?.value) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/supplier/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT token
  const session = await verifySupplierToken(sessionCookie.value);
  if (!session) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/supplier/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SUPPLIER_COOKIE_NAME);
    return response;
  }

  // Inject session info into request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-supplier-id", String(session.supplierId));
  requestHeaders.set("x-supplier-user-id", String(session.userId));
  requestHeaders.set("x-supplier-role", session.role);
  requestHeaders.set("x-supplier-name", session.supplierName);
  requestHeaders.set("x-supplier-email", session.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

async function verifySupplierToken(
  token: string
): Promise<{
  userId: number;
  supplierId: number;
  email: string;
  role: string;
  supplierName: string;
} | null> {
  try {
    const secret = process.env.SUPPLIER_JWT_SECRET || process.env.AGENCY_JWT_SECRET;
    if (!secret || secret.length < 32) {
      console.error("SUPPLIER_JWT_SECRET not configured properly");
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: payload.userId as number,
      supplierId: payload.supplierId as number,
      email: payload.email as string,
      role: payload.role as string,
      supplierName: payload.supplierName as string,
    };
  } catch {
    return null;
  }
}

async function handleAgencyRoutes(
  request: NextRequest,
  pathname: string
): Promise<NextResponse> {
  const isApiRoute = pathname.startsWith("/api/agency");

  // Allow login page and auth API routes without authentication
  if (pathname === "/agency/login" || pathname.startsWith("/api/agency/auth")) {
    // If on login page and already logged in, redirect to dashboard
    if (pathname === "/agency/login") {
      const sessionCookie = request.cookies.get(AGENCY_COOKIE_NAME);
      if (sessionCookie?.value) {
        const session = await verifyAgencyToken(sessionCookie.value);
        if (session) {
          return NextResponse.redirect(
            new URL("/agency/dashboard", request.url)
          );
        }
      }
    }
    return NextResponse.next();
  }

  // Protect all other /agency/* and /api/agency/* routes
  const sessionCookie = request.cookies.get(AGENCY_COOKIE_NAME);

  if (!sessionCookie?.value) {
    if (isApiRoute) {
      // For API routes, return 401 JSON response
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    // For pages, redirect to login
    const loginUrl = new URL("/agency/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT token
  const session = await verifyAgencyToken(sessionCookie.value);
  if (!session) {
    if (isApiRoute) {
      // For API routes, return 401 JSON response
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
    // For pages, redirect to login
    const loginUrl = new URL("/agency/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AGENCY_COOKIE_NAME);
    return response;
  }

  // Inject session info into request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-agency-id", String(session.agencyId));
  requestHeaders.set("x-agency-user-id", String(session.userId));
  requestHeaders.set("x-agency-role", session.role);
  requestHeaders.set("x-agency-slug", session.agencySlug);
  requestHeaders.set("x-agency-name", session.agencyName);
  requestHeaders.set("x-agency-email", session.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

async function verifyAgencyToken(
  token: string
): Promise<{
  userId: number;
  agencyId: number;
  email: string;
  role: string;
  agencySlug: string;
  agencyName: string;
} | null> {
  try {
    const secret = process.env.AGENCY_JWT_SECRET;
    if (!secret || secret.length < 32) {
      console.error("AGENCY_JWT_SECRET not configured properly");
      return null;
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: payload.userId as number,
      agencyId: payload.agencyId as number,
      email: payload.email as string,
      role: payload.role as string,
      agencySlug: payload.agencySlug as string,
      agencyName: payload.agencyName as string,
    };
  } catch {
    return null;
  }
}

function handleAdminRoutes(
  request: NextRequest,
  pathname: string
): NextResponse {
  // Only protect /admin routes (except /admin/login)
  if (pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);

    if (!sessionCookie?.value) {
      // No session - redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the session token
    const expectedToken = generateAdminToken(process.env.ADMIN_PASSWORD || "");
    if (sessionCookie.value !== expectedToken) {
      // Invalid session - redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid cookie
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }
  }

  // If already logged in and trying to access login page, redirect to admin
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const expectedToken = generateAdminToken(process.env.ADMIN_PASSWORD || "");

    if (sessionCookie?.value === expectedToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

// Simple token generation for admin (matches the one in auth route)
function generateAdminToken(password: string): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET || "curated-ascents-default-secret";
  // Simple hash - in production you might want something stronger
  let hash = 0;
  const str = password + secret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `session_${Math.abs(hash).toString(36)}`;
}

export const config = {
  matcher: ["/admin/:path*", "/agency/:path*", "/api/agency/:path*", "/supplier/:path*", "/api/supplier/:path*"],
};
