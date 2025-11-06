import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { threatFeed, ThreatSeverity, ThreatType } from '@/lib/intelligence/threat-feed';

/**
 * Get threat intelligence feed
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const severity = searchParams.get('severity') as ThreatSeverity | null;
    const type = searchParams.get('type') as ThreatType | null;
    const actor = searchParams.get('actor');
    const active = searchParams.get('active');
    const minConfidence = searchParams.get('minConfidence');
    const tags = searchParams.get('tags')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '50');
    const ioc = searchParams.get('ioc');

    // Search by IOC if provided
    if (ioc) {
      const threats = threatFeed.searchByIOC(ioc);
      return NextResponse.json({
        threats: threats.slice(0, limit),
        total: threats.length,
        query: { ioc },
      });
    }

    // Build filters
    const filters: any = {};
    if (severity) filters.severity = severity;
    if (type) filters.type = type;
    if (actor) filters.actor = actor;
    if (active !== null) filters.active = active === 'true';
    if (minConfidence) filters.minConfidence = parseInt(minConfidence);
    if (tags) filters.tags = tags;

    // Get threats
    const threats = Object.keys(filters).length > 0
      ? threatFeed.filterThreats(filters)
      : threatFeed.getRecentThreats(limit);

    // Get statistics
    const stats = threatFeed.getStats();

    return NextResponse.json({
      threats: threats.slice(0, limit),
      total: threats.length,
      stats,
      filters,
    });
  } catch (error) {
    console.error('Failed to get threats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve threat intelligence' },
      { status: 500 }
    );
  }
}
