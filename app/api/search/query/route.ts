/**
 * Search Query API Endpoint
 *
 * Execute encrypted searches without decrypting messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import {
  SearchableEncryption,
  SearchQuery,
} from '@/lib/search/searchable-encryption';
import { auditLog } from '@/lib/admin/audit-log';
import { getDatabaseAdapter } from '@/lib/db/adapter';

/**
 * POST /api/search/query
 * Search encrypted message indexes
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      terms,
      searchKey,
      fuzzy = false,
      maxDistance = 2,
      roomId,
      senderId,
      dateFrom,
      dateTo,
    } = body;

    // Validation
    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      return NextResponse.json(
        { error: 'Search terms required' },
        { status: 400 }
      );
    }

    if (!searchKey) {
      return NextResponse.json(
        { error: 'Search key required' },
        { status: 400 }
      );
    }

    // Build search query
    const query: SearchQuery = {
      terms: terms.map((t: string) => t.toLowerCase()),
      fuzzy,
      maxDistance,
      roomId,
      senderId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    // Get all indexes from database
    const db = getDatabaseAdapter();
    const indexes = await db.getSearchIndexes({
      roomId,
      senderId,
      dateFrom,
      dateTo,
    });

    // Execute search
    const results = SearchableEncryption.search(query, indexes, searchKey);

    // Audit log (privacy-preserving: don't log actual search terms)
    auditLog.log({
      userId: session.user.email,
      action: 'search.query_executed',
      severity: 'info',
      success: true,
      metadata: {
        termCount: terms.length,
        resultCount: results.length,
        fuzzy,
        roomId,
        hasDateFilter: !!(dateFrom || dateTo),
      },
    });

    return NextResponse.json({
      success: true,
      results,
      totalResults: results.length,
      query: {
        termCount: terms.length,
        fuzzy,
        filters: {
          room: !!roomId,
          sender: !!senderId,
          dateRange: !!(dateFrom || dateTo),
        },
      },
    });
  } catch (error) {
    console.error('Failed to execute search:', error);
    return NextResponse.json(
      { error: 'Failed to execute search' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search/query/stats
 * Get search statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDatabaseAdapter();
    const indexes = await db.getSearchIndexes({});

    const totalKeywords = indexes.reduce(
      (sum, index) => sum + index.encryptedKeywords.length,
      0
    );

    const stats = {
      totalIndexes: indexes.length,
      totalKeywords,
      averageKeywordsPerMessage: indexes.length > 0 ? totalKeywords / indexes.length : 0,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get search stats:', error);
    return NextResponse.json(
      { error: 'Failed to get search stats' },
      { status: 500 }
    );
  }
}
