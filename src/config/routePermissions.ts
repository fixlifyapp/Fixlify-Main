/**
 * Centralized route permissions configuration
 * Maps routes to their required permissions from the RBAC system
 */

export interface RoutePermissionConfig {
  /** Route path */
  path: string;
  /** Single permission required (user must have this) */
  permission?: string;
  /** Alternative permissions (user must have at least one) */
  anyPermission?: string[];
  /** All of these permissions required */
  allPermissions?: string[];
}

/**
 * Route permissions map - defines what permissions are required to access each route
 * Permission IDs must match those defined in src/components/auth/types.ts
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermissionConfig> = {
  // Always accessible
  '/dashboard': {
    path: '/dashboard',
    // No permission required - always visible
  },

  // Jobs - requires view.all OR view.assigned
  '/jobs': {
    path: '/jobs',
    anyPermission: ['jobs.view.all', 'jobs.view.assigned'],
  },

  // Clients - requires view.all OR view.assigned
  '/clients': {
    path: '/clients',
    anyPermission: ['clients.view.all', 'clients.view.assigned'],
  },

  // Schedule - requires view.all OR view.own
  '/schedule': {
    path: '/schedule',
    anyPermission: ['schedule.view.all', 'schedule.view.own'],
  },

  // Finance - requires finance.view OR invoices.view.all
  '/finance': {
    path: '/finance',
    anyPermission: ['finance.view', 'invoices.view.all'],
  },

  // Products - requires products.view
  '/products': {
    path: '/products',
    permission: 'products.view',
  },

  // Connect/Communications - requires communication permissions
  '/connect': {
    path: '/connect',
    anyPermission: ['communication.send', 'communication.view'],
  },

  // AI Center - requires automation.view
  '/ai-center': {
    path: '/ai-center',
    permission: 'automation.view',
  },

  // Automations - requires automation.view
  '/automations': {
    path: '/automations',
    permission: 'automation.view',
  },

  // Analytics/Reports - requires reports permissions
  '/analytics': {
    path: '/analytics',
    anyPermission: ['reports.view.all', 'reports.view.own'],
  },

  // Team - requires users.view
  '/team': {
    path: '/team',
    permission: 'users.view',
  },

  // Phone Numbers - requires elevated permissions
  '/settings/phone-numbers': {
    path: '/settings/phone-numbers',
    anyPermission: ['users.create', 'automation.create'],
  },

  // Settings - requires manager-level permissions
  '/settings': {
    path: '/settings',
    anyPermission: ['users.edit', 'automation.edit'],
  },
};

/**
 * Helper function to check if a route requires permissions
 */
export function getRoutePermissions(path: string): RoutePermissionConfig | undefined {
  return ROUTE_PERMISSIONS[path];
}

/**
 * Helper function to check if user can access a route
 */
export function canAccessRoute(
  path: string,
  hasPermission: (permission: string) => boolean
): boolean {
  const config = ROUTE_PERMISSIONS[path];

  // No config means always accessible
  if (!config) return true;

  // No permission requirements means always accessible
  if (!config.permission && !config.anyPermission && !config.allPermissions) {
    return true;
  }

  // Check single permission
  if (config.permission) {
    return hasPermission(config.permission);
  }

  // Check any permission
  if (config.anyPermission) {
    return config.anyPermission.some((perm) => hasPermission(perm));
  }

  // Check all permissions
  if (config.allPermissions) {
    return config.allPermissions.every((perm) => hasPermission(perm));
  }

  return true;
}
