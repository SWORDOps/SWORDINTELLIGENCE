/**
 * Admin Audit Logs API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { auditLog, type AuditQueryFilters, type AuditSeverity, type AuditEventType } from '@/lib/admin/audit-log';
import { hasPermission, userStore } from '@/lib/admin/permissions';

/**
 * GET - Query audit logs
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
    if (!hasPermission(userId, 'audit.view')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: AuditQueryFilters = {
      userId: searchParams.get('userId') || undefined,
      eventType: (searchParams.get('eventType') as AuditEventType) || undefined,
      severity: (searchParams.get('severity') as AuditSeverity) || undefined,
      resource: searchParams.get('resource') || undefined,
      success: searchParams.get('success') ? searchParams.get('success') === 'true' : undefined,
      minRiskScore: searchParams.get('minRiskScore') ? parseInt(searchParams.get('minRiskScore')!) : undefined,
      searchQuery: searchParams.get('q') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    };

    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const results = auditLog.query(filters, limit, offset);

    return NextResponse.json({
      logs: results.logs,
      total: results.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Audit log query error:', error);
    return NextResponse.json(
      { error: 'Failed to query audit logs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Export audit logs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Check permission
    if (!hasPermission(userId, 'audit.export')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const filters: AuditQueryFilters = body.filters || {};

    const exportData = auditLog.exportLogs(filters);

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Audit log export error:', error);
    return NextResponse.json(
      { error: 'Failed to export audit logs', details: error.message },
      { status: 500 }
    );
  }
}
