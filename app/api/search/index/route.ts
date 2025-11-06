/**
 * Search Index API Endpoint
 *
 * Create and manage encrypted search indexes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { SearchableEncryption } from '@/lib/search/searchable-encryption';
import { auditLog } from '@/lib/admin/audit-log';
import { getDatabaseAdapter } from '@/lib/db/adapter';

/**
 * POST /api/search/index
 * Create search index for a message
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, messageText, roomId, senderId, searchKey } = body;

    // Validation
    if (!messageId || !messageText || !searchKey) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract keywords from message text (client-side before encryption)
    const keywords = SearchableEncryption.extractKeywords(messageText, {
      minLength: 3,
      maxLength: 50,
      stemming: true,
      phonetic: true,
      caseSensitive: false,
    });

    // Generate encrypted index
    const index = SearchableEncryption.generateIndex(
      keywords,
      searchKey,
      messageId,
      {
        timestamp: Date.now(),
        roomId,
        senderId,
      }
    );

    // Store index in database
    const db = getDatabaseAdapter();
    await db.createSearchIndex(index);

    // Audit log
    auditLog.log({
      userId: session.user.email,
      action: 'search.index_created',
      severity: 'info',
      success: true,
      metadata: {
        messageId,
        keywordCount: keywords.length,
        roomId,
      },
    });

    return NextResponse.json({
      success: true,
      messageId,
      keywordCount: keywords.length,
      indexSize: index.encryptedKeywords.length,
    });
  } catch (error) {
    console.error('Failed to create search index:', error);
    return NextResponse.json(
      { error: 'Failed to create search index' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search/index?messageId=xxx
 * Delete search index
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      );
    }

    const db = getDatabaseAdapter();
    const success = await db.deleteSearchIndex(messageId);

    if (!success) {
      return NextResponse.json(
        { error: 'Index not found' },
        { status: 404 }
      );
    }

    auditLog.log({
      userId: session.user.email,
      action: 'search.index_deleted',
      severity: 'info',
      success: true,
      metadata: { messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete search index:', error);
    return NextResponse.json(
      { error: 'Failed to delete search index' },
      { status: 500 }
    );
  }
}
