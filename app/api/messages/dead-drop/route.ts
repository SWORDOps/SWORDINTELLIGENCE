/**
 * Dead Drop API Endpoints
 *
 * Manage scheduled message delivery with various trigger conditions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { deadDropStore, Trigger } from '@/lib/messaging/dead-drop';

/**
 * GET /api/messages/dead-drop
 * List user's dead drops (created or recipient)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, delivered, cancelled, failed

    let drops = deadDropStore.getUserDeadDrops(session.user.email);

    // Filter by status if provided
    if (status) {
      drops = drops.filter((d) => d.status === status);
    }

    // Add trigger summaries for UI
    const dropsWithSummaries = drops.map((drop) => ({
      ...drop,
      triggerSummary: deadDropStore.getTriggerSummary(drop.trigger),
    }));

    return NextResponse.json({
      drops: dropsWithSummaries,
      total: dropsWithSummaries.length,
    });
  } catch (error) {
    console.error('Failed to get dead drops:', error);
    return NextResponse.json(
      { error: 'Failed to get dead drops' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages/dead-drop
 * Create a new dead drop
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientId,
      roomId,
      encryptedContent,
      encryptionMetadata,
      trigger,
      expiresAt,
      requireConfirmation,
      selfDestruct,
      maxAttempts,
    } = body;

    // Validation
    if (!recipientId || !encryptedContent || !encryptionMetadata || !trigger) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate trigger
    if (!isValidTrigger(trigger)) {
      return NextResponse.json(
        { error: 'Invalid trigger configuration' },
        { status: 400 }
      );
    }

    // Create dead drop
    const drop = deadDropStore.createDeadDrop({
      creatorId: session.user.email,
      recipientId,
      roomId,
      encryptedContent,
      encryptionMetadata,
      trigger,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      requireConfirmation,
      selfDestruct,
      maxAttempts: maxAttempts || 3,
    });

    return NextResponse.json({
      success: true,
      deadDrop: {
        ...drop,
        triggerSummary: deadDropStore.getTriggerSummary(drop.trigger),
      },
    });
  } catch (error) {
    console.error('Failed to create dead drop:', error);
    return NextResponse.json(
      { error: 'Failed to create dead drop' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/dead-drop?id=xxx
 * Cancel a pending dead drop
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing dead drop ID' },
        { status: 400 }
      );
    }

    const success = deadDropStore.cancelDeadDrop(id, session.user.email);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel dead drop (not found or not authorized)' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel dead drop:', error);
    return NextResponse.json(
      { error: 'Failed to cancel dead drop' },
      { status: 500 }
    );
  }
}

/**
 * Validate trigger configuration
 */
function isValidTrigger(trigger: any): trigger is Trigger {
  if (!trigger || typeof trigger !== 'object' || !trigger.type) {
    return false;
  }

  switch (trigger.type) {
    case 'time':
      return !!(trigger.deliverAt || trigger.delayMinutes);

    case 'heartbeat':
      return !!(trigger.userId && trigger.timeoutHours > 0);

    case 'geographic':
      return !!(
        trigger.condition &&
        typeof trigger.latitude === 'number' &&
        typeof trigger.longitude === 'number' &&
        trigger.radiusMeters > 0 &&
        trigger.recipientId
      );

    case 'composite':
      return !!(
        trigger.operator &&
        Array.isArray(trigger.triggers) &&
        trigger.triggers.length > 0 &&
        trigger.triggers.every(isValidTrigger)
      );

    default:
      return false;
  }
}
