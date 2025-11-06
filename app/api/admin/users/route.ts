/**
 * Admin Users Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { hasPermission, userStore, type UserRole } from '@/lib/admin/permissions';
import { auditLog } from '@/lib/admin/audit-log';

/**
 * GET - Get all users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Ensure user exists in store
    userStore.getOrCreateUser(userId, session.user.email, session.user.name || userId);

    // Check permission
    if (!hasPermission(userId, 'users.view')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // Log access
    auditLog.log({
      userId,
      eventType: 'admin.access',
      severity: 'info',
      action: 'View users list',
      description: 'Admin viewed users list',
      resource: 'users',
      success: true,
    });

    const users = userStore.getAllUsers();

    // Get activity for each user
    const usersWithActivity = users.map(user => {
      const activity = auditLog.getUserActivity(user.userId, 30);
      const suspicious = auditLog.detectSuspiciousActivity(user.userId, 60);

      return {
        ...user,
        activity: {
          totalActions: activity.totalActions,
          riskScore: activity.riskScore,
        },
        suspicious: suspicious.suspicious,
        suspiciousReasons: suspicious.reasons,
      };
    });

    return NextResponse.json({
      users: usersWithActivity,
      total: users.length,
    });
  } catch (error: any) {
    console.error('Users list error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update user role or status
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUserId = session.user.email;
    const body = await request.json();
    const { targetUserId, role, disabled } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    // Check permissions based on action
    if (role !== undefined && !hasPermission(adminUserId, 'users.change_role')) {
      return NextResponse.json({ error: 'Forbidden: Cannot change user roles' }, { status: 403 });
    }

    if (disabled !== undefined && !hasPermission(adminUserId, 'users.edit')) {
      return NextResponse.json({ error: 'Forbidden: Cannot modify user status' }, { status: 403 });
    }

    const targetUser = userStore.getUser(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update role if provided
    if (role !== undefined) {
      const validRoles: UserRole[] = ['user', 'analyst', 'admin', 'superadmin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      userStore.updateUserRole(targetUserId, role);

      auditLog.log({
        userId: adminUserId,
        eventType: 'user.role_changed',
        severity: 'warning',
        action: `Change user role to ${role}`,
        description: `Admin ${adminUserId} changed ${targetUserId}'s role to ${role}`,
        resource: 'user',
        resourceId: targetUserId,
        success: true,
        metadata: {
          oldRole: targetUser.role,
          newRole: role,
        },
      });
    }

    // Update disabled status if provided
    if (disabled !== undefined) {
      userStore.setUserDisabled(targetUserId, disabled);

      auditLog.log({
        userId: adminUserId,
        eventType: disabled ? 'user.disabled' : 'user.enabled',
        severity: 'warning',
        action: disabled ? 'Disable user' : 'Enable user',
        description: `Admin ${adminUserId} ${disabled ? 'disabled' : 'enabled'} user ${targetUserId}`,
        resource: 'user',
        resourceId: targetUserId,
        success: true,
      });
    }

    const updatedUser = userStore.getUser(targetUserId);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}
