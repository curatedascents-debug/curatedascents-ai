/**
 * Agency User Role Hierarchy
 * owner > admin > agent > viewer
 */

export type AgencyRole = "owner" | "admin" | "agent" | "viewer";

export type Resource =
  | "clients"
  | "quotes"
  | "bookings"
  | "rates"
  | "suppliers"
  | "users"
  | "settings"
  | "reports";

export type Action = "view" | "create" | "update" | "delete" | "manage";

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<AgencyRole, number> = {
  owner: 4,
  admin: 3,
  agent: 2,
  viewer: 1,
};

// Define minimum role required for each action on each resource
const PERMISSION_MATRIX: Record<Resource, Record<Action, AgencyRole>> = {
  clients: {
    view: "viewer",
    create: "agent",
    update: "agent",
    delete: "admin",
    manage: "admin",
  },
  quotes: {
    view: "viewer",
    create: "agent",
    update: "agent",
    delete: "admin",
    manage: "admin",
  },
  bookings: {
    view: "viewer",
    create: "agent",
    update: "agent",
    delete: "admin",
    manage: "admin",
  },
  rates: {
    view: "agent",
    create: "admin",
    update: "admin",
    delete: "admin",
    manage: "owner",
  },
  suppliers: {
    view: "agent",
    create: "admin",
    update: "admin",
    delete: "owner",
    manage: "owner",
  },
  users: {
    view: "admin",
    create: "admin",
    update: "admin",
    delete: "owner",
    manage: "owner",
  },
  settings: {
    view: "admin",
    create: "owner",
    update: "owner",
    delete: "owner",
    manage: "owner",
  },
  reports: {
    view: "agent",
    create: "admin",
    update: "admin",
    delete: "admin",
    manage: "owner",
  },
};

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: AgencyRole | string,
  resource: Resource,
  action: Action
): boolean {
  const userRoleLevel = ROLE_HIERARCHY[role as AgencyRole];
  if (userRoleLevel === undefined) {
    return false;
  }

  const resourcePermissions = PERMISSION_MATRIX[resource];
  if (!resourcePermissions) {
    return false;
  }

  const requiredRole = resourcePermissions[action];
  if (!requiredRole) {
    return false;
  }

  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if a role is at least as high as another role
 */
export function hasMinimumRole(
  userRole: AgencyRole | string,
  requiredRole: AgencyRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as AgencyRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  if (userLevel === undefined || requiredLevel === undefined) {
    return false;
  }

  return userLevel >= requiredLevel;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(
  role: AgencyRole
): Record<Resource, Action[]> {
  const permissions: Record<Resource, Action[]> = {} as Record<
    Resource,
    Action[]
  >;

  for (const resource of Object.keys(PERMISSION_MATRIX) as Resource[]) {
    permissions[resource] = [];
    for (const action of Object.keys(
      PERMISSION_MATRIX[resource]
    ) as Action[]) {
      if (hasPermission(role, resource, action)) {
        permissions[resource].push(action);
      }
    }
  }

  return permissions;
}

/**
 * Check if user can manage another user (can't manage users of same or higher level)
 */
export function canManageUser(
  managerRole: AgencyRole,
  targetRole: AgencyRole
): boolean {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  // Can only manage users with lower role level
  return managerLevel > targetLevel;
}

/**
 * Get roles that a user can assign to others
 */
export function getAssignableRoles(managerRole: AgencyRole): AgencyRole[] {
  const managerLevel = ROLE_HIERARCHY[managerRole];
  const assignable: AgencyRole[] = [];

  for (const [role, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level < managerLevel) {
      assignable.push(role as AgencyRole);
    }
  }

  return assignable;
}
