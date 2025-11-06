/**
 * Admin Permission System
 *
 * Role-based access control for admin functionality
 */

/**
 * User roles
 */
export type UserRole = 'user' | 'analyst' | 'admin' | 'superadmin';

/**
 * Admin permissions
 */
export type AdminPermission =
  // User management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.change_role'
  // Vault management
  | 'vault.view_all'
  | 'vault.delete_any'
  | 'vault.view_logs'
  // Canary tokens
  | 'canary.view_all'
  | 'canary.delete_any'
  | 'canary.view_triggers'
  // Dead drops
  | 'deaddrop.view_all'
  | 'deaddrop.delete_any'
  // Messaging
  | 'messages.view_all'
  | 'messages.moderate'
  // Threat intelligence
  | 'threats.create'
  | 'threats.edit'
  | 'threats.delete'
  // Audit logs
  | 'audit.view'
  | 'audit.export'
  // System
  | 'system.config'
  | 'system.backup'
  | 'system.restore';

/**
 * Role permission mappings
 */
const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  user: [],
  analyst: [
    'threats.create',
    'threats.edit',
    'audit.view',
  ],
  admin: [
    'users.view',
    'users.edit',
    'vault.view_all',
    'vault.view_logs',
    'canary.view_all',
    'canary.view_triggers',
    'deaddrop.view_all',
    'messages.view_all',
    'messages.moderate',
    'threats.create',
    'threats.edit',
    'threats.delete',
    'audit.view',
    'audit.export',
  ],
  superadmin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.change_role',
    'vault.view_all',
    'vault.delete_any',
    'vault.view_logs',
    'canary.view_all',
    'canary.delete_any',
    'canary.view_triggers',
    'deaddrop.view_all',
    'deaddrop.delete_any',
    'messages.view_all',
    'messages.moderate',
    'threats.create',
    'threats.edit',
    'threats.delete',
    'audit.view',
    'audit.export',
    'system.config',
    'system.backup',
    'system.restore',
  ],
};

/**
 * User profile with role
 */
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  disabled: boolean;
}

/**
 * User store
 */
class UserStore {
  private users: Map<string, UserProfile> = new Map();

  constructor() {
    // Seed with default admin user
    this.users.set('admin@swordintel.com', {
      userId: 'admin@swordintel.com',
      email: 'admin@swordintel.com',
      name: 'System Administrator',
      role: 'superadmin',
      createdAt: new Date(),
      disabled: false,
    });
  }

  /**
   * Get or create user
   */
  getOrCreateUser(userId: string, email: string, name: string): UserProfile {
    let user = this.users.get(userId);
    if (!user) {
      user = {
        userId,
        email,
        name,
        role: 'user',
        createdAt: new Date(),
        disabled: false,
      };
      this.users.set(userId, user);
    }
    return user;
  }

  /**
   * Get user
   */
  getUser(userId: string): UserProfile | undefined {
    return this.users.get(userId);
  }

  /**
   * Update user role
   */
  updateUserRole(userId: string, role: UserRole): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.role = role;
    return true;
  }

  /**
   * Disable/enable user
   */
  setUserDisabled(userId: string, disabled: boolean): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.disabled = disabled;
    return true;
  }

  /**
   * Update last login
   */
  updateLastLogin(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastLogin = new Date();
    }
  }

  /**
   * Get all users
   */
  getAllUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  /**
   * Get users by role
   */
  getUsersByRole(role: UserRole): UserProfile[] {
    return Array.from(this.users.values()).filter(u => u.role === role);
  }
}

// Singleton instance
export const userStore = new UserStore();

/**
 * Check if user has permission
 */
export function hasPermission(userId: string, permission: AdminPermission): boolean {
  const user = userStore.getUser(userId);
  if (!user || user.disabled) return false;

  const rolePermissions = ROLE_PERMISSIONS[user.role];
  return rolePermissions.includes(permission);
}

/**
 * Check if user has any admin permissions
 */
export function isAdmin(userId: string): boolean {
  const user = userStore.getUser(userId);
  if (!user || user.disabled) return false;

  return user.role === 'admin' || user.role === 'superadmin' || user.role === 'analyst';
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(userId: string): boolean {
  const user = userStore.getUser(userId);
  if (!user || user.disabled) return false;

  return user.role === 'superadmin';
}

/**
 * Get user's role
 */
export function getUserRole(userId: string): UserRole | null {
  const user = userStore.getUser(userId);
  return user ? user.role : null;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): AdminPermission[] {
  return ROLE_PERMISSIONS[role];
}
