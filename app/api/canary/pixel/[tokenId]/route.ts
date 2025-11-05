import { NextRequest, NextResponse } from 'next/server';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

/**
 * Web bug tracking pixel endpoint
 * Returns 1x1 transparent GIF and triggers canary alert
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId.replace('.gif', ''); // Remove .gif extension

  // Extract network information
  const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Collect all headers for forensics
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Trigger canary token
  try {
    await canaryTokenStore.triggerToken(tokenId, {
      sourceIp,
      userAgent,
      referer,
      headers,
      triggerType: 'web_bug_pixel',
      metadata: {
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
      },
    });
  } catch (error) {
    console.error('Failed to trigger web bug canary:', error);
  }

  // Return 1x1 transparent GIF
  // This is the actual pixel data for a transparent GIF
  const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return new NextResponse(transparentGif, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
