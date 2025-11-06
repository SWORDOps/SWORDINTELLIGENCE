/**
 * Steganography Extract API Endpoint
 *
 * Extract hidden file from steganographic image
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { LSBSteganography } from '@/lib/steganography/lsb-engine';
import { auditLog } from '@/lib/admin/audit-log';

/**
 * POST /api/steganography/extract
 * Extract file from steganographic image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const stegoImage = formData.get('image') as File;
    const password = formData.get('password') as string;
    const bitsPerChannel = parseInt(formData.get('bitsPerChannel') as string) || 2;
    const encryptedPayload = formData.get('encrypted') === 'true';

    // Validation
    if (!stegoImage) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (encryptedPayload && !password) {
      return NextResponse.json(
        { error: 'Password required for encrypted payload' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const imageBuffer = Buffer.from(await stegoImage.arrayBuffer());

    // Extract file from image
    const result = LSBSteganography.extract(imageBuffer, {
      bitsPerChannel: bitsPerChannel as 1 | 2 | 3 | 4,
      channels: ['r', 'g', 'b'],
      password: encryptedPayload ? password : undefined,
      encryptPayload: encryptedPayload,
    });

    if (!result.success) {
      // Audit failed extraction attempt
      auditLog.log({
        userId: session.user.email,
        action: 'steganography.extract_failed',
        severity: 'warning',
        success: false,
        metadata: {
          error: result.error,
          imageSize: imageBuffer.length,
        },
      });

      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Audit successful extraction
    auditLog.log({
      userId: session.user.email,
      action: 'steganography.extract',
      severity: 'info',
      success: true,
      metadata: {
        extractedSize: result.extractedFile?.length,
        filename: result.metadata?.filename,
        mimeType: result.metadata?.mimeType,
        encrypted: encryptedPayload,
      },
    });

    // Return extracted file
    return new NextResponse(result.extractedFile, {
      headers: {
        'Content-Type': result.metadata?.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.metadata?.filename || 'extracted_file'}"`,
        'X-Original-Filename': result.metadata?.filename || '',
        'X-Original-Size': result.metadata?.size.toString() || '0',
        'X-Original-Timestamp': result.metadata?.timestamp.toString() || '0',
      },
    });
  } catch (error) {
    console.error('Failed to extract file:', error);
    return NextResponse.json(
      { error: 'Failed to extract file' },
      { status: 500 }
    );
  }
}
