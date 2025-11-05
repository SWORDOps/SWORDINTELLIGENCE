import { NextRequest, NextResponse } from 'next/server';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

/**
 * PDF beacon / general callback endpoint
 * Can be embedded in PDFs as external resources, fonts, JavaScript, etc.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string; secret: string } }
) {
  const { tokenId, secret } = params;

  // Extract network information
  const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Collect headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Detect PDF reader from user agent
  const pdfReader = detectPDFReader(userAgent);

  // Trigger canary token
  try {
    await canaryTokenStore.triggerToken(tokenId, {
      sourceIp,
      userAgent,
      referer,
      headers,
      triggerType: 'pdf_beacon',
      metadata: {
        secret: secret.substring(0, 4) + '...', // Log partial secret for verification
        pdfReader,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams),
      },
    });
  } catch (error) {
    console.error('Failed to trigger PDF beacon canary:', error);
  }

  // Return minimal response (PDF readers expect HTTP 200)
  // Some PDF readers fetch fonts, images, or JavaScript - return appropriate content
  const acceptHeader = request.headers.get('accept') || '';

  if (acceptHeader.includes('font')) {
    // Return minimal valid font (empty TTF)
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Content-Type': 'font/ttf',
      },
    });
  } else if (acceptHeader.includes('image')) {
    // Return 1x1 transparent PNG
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return new NextResponse(transparentPng, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } else {
    // Return minimal HTML/JavaScript
    return new NextResponse('/* Canary token triggered */', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  }
}

/**
 * POST endpoint for more sophisticated beacons (e.g., JavaScript fetch)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tokenId: string; secret: string } }
) {
  const { tokenId, secret } = params;

  // Extract network information
  const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Parse POST body (if any)
  let postData;
  try {
    postData = await request.json();
  } catch {
    postData = null;
  }

  // Collect headers
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
      triggerType: 'pdf_beacon_post',
      metadata: {
        secret: secret.substring(0, 4) + '...',
        postData,
        path: request.nextUrl.pathname,
      },
    });
  } catch (error) {
    console.error('Failed to trigger PDF beacon canary (POST):', error);
  }

  return NextResponse.json({
    success: true,
    message: 'Beacon received',
  });
}

/**
 * Detect PDF reader from user agent
 */
function detectPDFReader(userAgent?: string): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  if (ua.includes('adobe') || ua.includes('acrobat')) return 'Adobe Acrobat Reader';
  if (ua.includes('foxit')) return 'Foxit Reader';
  if (ua.includes('chrome')) return 'Chrome PDF Viewer';
  if (ua.includes('firefox')) return 'Firefox PDF Viewer';
  if (ua.includes('safari')) return 'Safari PDF Viewer';
  if (ua.includes('edge')) return 'Edge PDF Viewer';
  if (ua.includes('preview')) return 'macOS Preview';
  if (ua.includes('sumatra')) return 'Sumatra PDF';
  if (ua.includes('okular')) return 'Okular';
  if (ua.includes('evince')) return 'Evince';

  return 'unknown';
}
