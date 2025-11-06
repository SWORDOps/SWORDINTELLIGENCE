import { NextRequest, NextResponse } from 'next/server';
import { canaryTokenStore } from '@/lib/security/canary-tokens';

/**
 * Office macro callback endpoint
 * Triggered when Office document with embedded macro is opened
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get('key'); // Secret key from macro

  // Extract network information
  const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Collect headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Detect Office application
  const officeApp = detectOfficeApp(userAgent);

  // Additional macro data (can be passed as query params)
  const macroData = {
    documentName: searchParams.get('doc'),
    userName: searchParams.get('user'),
    computerName: searchParams.get('computer'),
    osVersion: searchParams.get('os'),
  };

  // Trigger canary token
  try {
    await canaryTokenStore.triggerToken(tokenId, {
      sourceIp,
      userAgent,
      referer,
      headers,
      triggerType: 'office_macro',
      metadata: {
        key: key ? key.substring(0, 4) + '...' : undefined,
        officeApp,
        macroData,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(searchParams),
      },
    });
  } catch (error) {
    console.error('Failed to trigger macro canary:', error);
  }

  // Return minimal response (VBA macros expect HTTP 200)
  return new NextResponse('OK', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * POST endpoint for macros that send additional data
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;

  // Extract network information
  const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  const referer = request.headers.get('referer') || undefined;

  // Parse POST body
  let postData;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      postData = await request.json();
    } else {
      const text = await request.text();
      postData = { body: text };
    }
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
      triggerType: 'office_macro_post',
      metadata: {
        postData,
        path: request.nextUrl.pathname,
      },
    });
  } catch (error) {
    console.error('Failed to trigger macro canary (POST):', error);
  }

  return NextResponse.json({
    success: true,
    message: 'Macro callback received',
  });
}

/**
 * Detect Office application from user agent or macro data
 */
function detectOfficeApp(userAgent?: string): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Office applications include specific identifiers in HTTP requests
  if (ua.includes('microsoft office word')) return 'Microsoft Word';
  if (ua.includes('microsoft office excel')) return 'Microsoft Excel';
  if (ua.includes('microsoft office powerpoint')) return 'Microsoft PowerPoint';
  if (ua.includes('microsoft office outlook')) return 'Microsoft Outlook';
  if (ua.includes('winword')) return 'Microsoft Word';
  if (ua.includes('excel')) return 'Microsoft Excel';
  if (ua.includes('powerpnt')) return 'Microsoft PowerPoint';
  if (ua.includes('libreoffice')) return 'LibreOffice';
  if (ua.includes('openoffice')) return 'OpenOffice';

  return 'unknown';
}
