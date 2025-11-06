/**
 * Steganography Embed API Endpoint
 *
 * Embed file into carrier image using LSB steganography
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { LSBSteganography } from '@/lib/steganography/lsb-engine';
import { auditLog } from '@/lib/admin/audit-log';

/**
 * POST /api/steganography/embed
 * Embed file into carrier image
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const carrierImage = formData.get('carrier') as File;
    const payloadFile = formData.get('payload') as File;
    const password = formData.get('password') as string;
    const bitsPerChannel = parseInt(formData.get('bitsPerChannel') as string) || 2;
    const encryptPayload = formData.get('encryptPayload') === 'true';

    // Validation
    if (!carrierImage || !payloadFile) {
      return NextResponse.json(
        { error: 'Missing carrier image or payload file' },
        { status: 400 }
      );
    }

    if (encryptPayload && !password) {
      return NextResponse.json(
        { error: 'Password required when encryption is enabled' },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const carrierBuffer = Buffer.from(await carrierImage.arrayBuffer());
    const payloadBuffer = Buffer.from(await payloadFile.arrayBuffer());

    // Prepare metadata
    const metadata = {
      filename: payloadFile.name,
      mimeType: payloadFile.type,
      size: payloadBuffer.length,
      timestamp: Date.now(),
    };

    // Embed file into image
    const result = LSBSteganography.embed(
      carrierBuffer,
      payloadBuffer,
      metadata,
      {
        bitsPerChannel: bitsPerChannel as 1 | 2 | 3 | 4,
        channels: ['r', 'g', 'b'],
        password: encryptPayload ? password : undefined,
        encryptPayload,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Audit log
    auditLog.log({
      userId: session.user.email,
      action: 'steganography.embed',
      severity: 'info',
      success: true,
      metadata: {
        carrierSize: carrierBuffer.length,
        payloadSize: payloadBuffer.length,
        payloadFilename: payloadFile.name,
        capacityUsed: result.capacityUsed,
        bitsPerChannel,
        encrypted: encryptPayload,
      },
    });

    // Return steganographic image
    return new NextResponse(result.outputImage, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="stego_${carrierImage.name}"`,
        'X-Capacity-Used': result.capacityUsed?.toFixed(2) || '0',
      },
    });
  } catch (error) {
    console.error('Failed to embed file:', error);
    return NextResponse.json(
      { error: 'Failed to embed file' },
      { status: 500 }
    );
  }
}
