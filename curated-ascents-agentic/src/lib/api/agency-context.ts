import { headers } from "next/headers";

export interface AgencyContext {
  agencyId: number;
  userId: number;
  role: string;
  email: string;
  agencySlug: string;
  agencyName: string;
}

/**
 * Get agency context from middleware headers
 * Returns null if not authenticated or headers not set
 */
export async function getAgencyContext(): Promise<AgencyContext | null> {
  const headersList = await headers();

  const agencyId = headersList.get("x-agency-id");
  const userId = headersList.get("x-agency-user-id");
  const role = headersList.get("x-agency-role");
  const email = headersList.get("x-agency-email");
  const agencySlug = headersList.get("x-agency-slug");
  const agencyName = headersList.get("x-agency-name");

  if (!agencyId || !userId || !role) {
    return null;
  }

  return {
    agencyId: parseInt(agencyId, 10),
    userId: parseInt(userId, 10),
    role,
    email: email || "",
    agencySlug: agencySlug || "",
    agencyName: agencyName || "",
  };
}

/**
 * Require agency context - throws if not authenticated
 * Use this in protected API routes to ensure proper authentication
 *
 * CRITICAL: Never trust agencyId from request body - always use this function
 */
export async function requireAgencyContext(): Promise<AgencyContext> {
  const context = await getAgencyContext();

  if (!context) {
    throw new AgencyAuthError("Not authenticated");
  }

  return context;
}

/**
 * Custom error class for agency authentication errors
 */
export class AgencyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgencyAuthError";
  }
}

/**
 * Check if a user has at least the required role
 */
export function hasMinimumRole(
  userRole: string,
  requiredRole: "owner" | "admin" | "agent" | "viewer"
): boolean {
  const roleHierarchy: Record<string, number> = {
    owner: 4,
    admin: 3,
    agent: 2,
    viewer: 1,
  };

  const userLevel = roleHierarchy[userRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;

  return userLevel >= requiredLevel;
}
