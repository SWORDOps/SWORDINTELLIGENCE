import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  canaryTokenStore,
  CanaryTokenType,
  CanaryTokenOptions,
} from '@/lib/security/canary-tokens';

/**
 * Create a new canary token
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const body = await request.json();

    const {
      type,
      documentId,
      targetUserId,
      label,
      description,
      tags,
      expiresIn,
      alertOnFirstTrigger,
      alertOnEveryTrigger,
      maxTriggers,
      payload,
    } = body;

    // Validate required fields
    if (!type || !label) {
      return NextResponse.json(
        { error: 'Token type and label are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: CanaryTokenType[] = [
      'dns',
      'web_bug',
      'honeytoken',
      'watermark',
      'qr_code',
      'pdf_beacon',
      'macro',
      'clonedsite',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid token type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate canary token
    const options: CanaryTokenOptions = {
      type,
      documentId,
      targetUserId,
      label,
      description,
      tags,
      expiresIn,
      alertOnFirstTrigger,
      alertOnEveryTrigger,
      maxTriggers,
      payload,
    };

    const token = canaryTokenStore.generateToken(userId, options);

    // Return token details
    return NextResponse.json({
      success: true,
      token: {
        tokenId: token.tokenId,
        type: token.type,
        label: token.label,
        description: token.description,
        tokenValue: token.tokenValue,
        status: token.status,
        createdAt: token.createdAt.toISOString(),
        expiresAt: token.expiresAt?.toISOString(),
        documentId: token.documentId,
        targetUserId: token.targetUserId,
        tags: token.tags,

        // Usage instructions based on type
        instructions: getInstructions(token.type, token.tokenValue),
      },
    });
  } catch (error) {
    console.error('Canary token creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create canary token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get usage instructions for a token type
 */
function getInstructions(type: CanaryTokenType, tokenValue: string): string {
  switch (type) {
    case 'dns':
      return `DNS Canary Token\n\nAdd this DNS query to your document:\n  ${tokenValue}\n\nWhen the domain is resolved, you'll receive an alert.\n\nExample uses:\n- Embed in PDF as external resource URL\n- Add to Word document as remote template\n- Include in Excel as external data source`;

    case 'web_bug':
      return `Web Bug Canary Token\n\nEmbed this tracking pixel:\n  <img src="https://swordintelligence.com${tokenValue}" width="1" height="1" />\n\nWhen the image is loaded, you'll receive an alert.\n\nExample uses:\n- Embed in HTML emails\n- Add to Word documents (Insert > Picture > From Web)\n- Include in PDF as external image`;

    case 'honeytoken':
      return `Honeytoken Credential\n\nFake AWS Access Key:\n  ${tokenValue}\n\nPlant this in:\n- .env files\n- Configuration files\n- Code repositories\n- Documentation\n\nIf an attacker tries to use it, you'll receive an alert.\n\nNOTE: This is a fake credential for detection purposes only.`;

    case 'watermark':
      return `Steganographic Watermark\n\nWatermark ID:\n  ${tokenValue}\n\nThis watermark is automatically embedded in document metadata.\n\nThe watermark is invisible and survives:\n- Copy/paste operations\n- PDF export\n- Screenshots (with OCR)\n- Format conversions\n\nUse this to track document provenance and detect leaks.`;

    case 'qr_code':
      return `QR Code Canary Token\n\nQR Code URL:\n  ${tokenValue}\n\nGenerate QR code and embed in document.\n\nWhen someone scans the QR code, you'll receive an alert with:\n- Device type\n- Location\n- IP address\n- Timestamp\n\nUse cases:\n- Physical document tracking\n- Printed materials\n- ID badges\n- Product packaging`;

    case 'pdf_beacon':
      return `PDF Beacon Canary Token\n\nBeacon URL:\n  ${tokenValue}\n\nEmbed this URL in PDF as:\n1. External resource (PDF Action)\n2. Embedded JavaScript\n3. Remote font reference\n4. Embedded multimedia\n\nWhen PDF is opened with external resources enabled, you'll receive an alert.\n\nCompatible with most PDF readers.`;

    case 'macro':
      return `Office Macro Canary Token\n\nCallback URL:\n  ${tokenValue}\n\nAdd VBA macro to Office document:\n\nSub Auto_Open()\n  Dim http As Object\n  Set http = CreateObject("MSXML2.XMLHTTP")\n  http.Open "GET", "${tokenValue}", False\n  http.Send\nEnd Sub\n\nWhen document is opened with macros enabled, you'll receive an alert.\n\nWARNING: Requires macros to be enabled.`;

    case 'clonedsite':
      return `Cloned Site Canary Token\n\nFake Login Page:\n  ${tokenValue}\n\nUse this to detect credential harvesting attempts.\n\nWhen someone visits this URL and attempts to login, you'll receive:\n- Full credentials entered (for honeypot analysis)\n- Source IP and geolocation\n- Browser fingerprint\n- Screenshots of attacker's browser\n\nDeploy in:\n- Phishing awareness training\n- Internal red team exercises\n- Honeypot networks`;

    default:
      return 'No specific instructions available for this token type.';
  }
}

/**
 * List canary tokens for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Get tokens
    let tokens = documentId
      ? canaryTokenStore.getDocumentTokens(documentId)
      : canaryTokenStore.getUserTokens(userId);

    // Filter by status
    if (status) {
      tokens = tokens.filter(t => t.status === status);
    }

    // Filter by type
    if (type) {
      tokens = tokens.filter(t => t.type === type);
    }

    // Get stats
    const stats = canaryTokenStore.getStats();

    // Return sanitized token list (no secrets)
    return NextResponse.json({
      tokens: tokens.map(token => ({
        tokenId: token.tokenId,
        type: token.type,
        status: token.status,
        label: token.label,
        description: token.description,
        tokenValue: token.tokenValue,
        documentId: token.documentId,
        targetUserId: token.targetUserId,
        tags: token.tags,
        createdAt: token.createdAt.toISOString(),
        expiresAt: token.expiresAt?.toISOString(),
        firstTriggeredAt: token.firstTriggeredAt?.toISOString(),
        lastTriggeredAt: token.lastTriggeredAt?.toISOString(),
        triggerCount: token.triggerCount,
        alertOnFirstTrigger: token.alertOnFirstTrigger,
        alertOnEveryTrigger: token.alertOnEveryTrigger,
        maxTriggers: token.maxTriggers,
      })),
      stats,
    });
  } catch (error) {
    console.error('Failed to list canary tokens:', error);
    return NextResponse.json(
      { error: 'Failed to list canary tokens' },
      { status: 500 }
    );
  }
}

/**
 * Delete/revoke a canary token
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: 'Token ID required' },
        { status: 400 }
      );
    }

    const success = canaryTokenStore.revokeToken(tokenId, userId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Canary token revoked',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to revoke token (not found or unauthorized)' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Failed to revoke canary token:', error);
    return NextResponse.json(
      { error: 'Failed to revoke canary token' },
      { status: 500 }
    );
  }
}
