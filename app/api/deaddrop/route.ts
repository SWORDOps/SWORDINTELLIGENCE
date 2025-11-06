import { NextRequest, NextResponse } from 'next/server';
import { deadDropStore } from '@/lib/security/dead-drops';
import { encodeData, generateCoverImage, validateCapacity } from '@/lib/crypto/steganography';

/**
 * Create a new dead drop
 * Hides payload inside cover image using steganography
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get parameters
    const file = formData.get('file') as File;
    const password = formData.get('password') as string;
    const passwordHint = formData.get('passwordHint') as string | null;
    const ttl = parseInt(formData.get('ttl') as string) || 86400; // 24 hours default
    const maxRetrievals = parseInt(formData.get('maxRetrievals') as string) || 0;
    const burnAfterReading = formData.get('burnAfterReading') === 'true';
    const coverImageFile = formData.get('coverImage') as File | null;
    const tags = formData.get('tags') as string | null;

    if (!file || !password) {
      return NextResponse.json(
        { error: 'File and password are required' },
        { status: 400 }
      );
    }

    // Read file data
    const fileData = Buffer.from(await file.arrayBuffer());

    console.log(`Creating dead drop for ${file.name} (${fileData.length} bytes)...`);

    // Get or generate cover image
    let coverImage: Buffer;
    let coverImageType: 'generated' | 'uploaded';

    if (coverImageFile) {
      // Use uploaded cover image
      coverImage = Buffer.from(await coverImageFile.arrayBuffer());
      coverImageType = 'uploaded';
      console.log('Using uploaded cover image');
    } else {
      // Generate cover image
      // Calculate required size based on payload
      const requiredCapacity = fileData.length + 100; // Add buffer
      const pixelsNeeded = Math.ceil((requiredCapacity * 8) / 3); // 3 bits per pixel

      // Calculate dimensions (aim for 4:3 aspect ratio)
      const width = Math.ceil(Math.sqrt(pixelsNeeded * (4 / 3)));
      const height = Math.ceil(width * 0.75);

      // Generate with random color
      const baseColor = {
        r: Math.floor(Math.random() * 128) + 64,
        g: Math.floor(Math.random() * 128) + 64,
        b: Math.floor(Math.random() * 128) + 64,
      };

      coverImage = generateCoverImage(width, height, baseColor);
      coverImageType = 'generated';

      console.log(`Generated ${width}x${height} cover image`);
    }

    // Verify capacity
    // Parse PNG to get dimensions
    const PNG = require('pngjs').PNG;
    const png = PNG.sync.read(coverImage);
    const validation = validateCapacity(png.width, png.height, fileData.length);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Payload too large for cover image',
          capacity: validation.capacity,
          required: validation.required,
        },
        { status: 400 }
      );
    }

    // Embed data using steganography
    console.log('Embedding data using LSB steganography...');
    const stegoImage = await encodeData(coverImage, fileData, password);

    // Get network info
    const sourceIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create dead drop
    const drop = deadDropStore.createDrop({
      coverImage: stegoImage,
      coverImageType,
      payloadSize: fileData.length,
      encrypted: true, // Always encrypted with password
      password,
      passwordHint: passwordHint || undefined,
      ttl,
      maxRetrievals,
      burnAfterReading,
      originalFilename: file.name,
      mimeType: file.type || 'application/octet-stream',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      ipAddress: sourceIp,
      userAgent,
    });

    // Calculate expiration time
    const hoursUntilExpiry = Math.floor(ttl / 3600);

    return NextResponse.json({
      success: true,
      dropId: drop.dropId,
      codename: drop.codename,
      expiresAt: drop.expiresAt.toISOString(),
      ttl: {
        seconds: ttl,
        hours: hoursUntilExpiry,
        formatted: `${hoursUntilExpiry}h`,
      },
      maxRetrievals: drop.maxRetrievals,
      burnAfterReading: drop.burnAfterReading,
      steganography: {
        imageSize: `${png.width}x${png.height}`,
        payloadSize: fileData.length,
        capacity: validation.capacity,
        utilization: `${((fileData.length / validation.capacity) * 100).toFixed(2)}%`,
      },
      accessUrl: `/deadd rop/${drop.codename}`,
      instructions: {
        pickup: `Share the codename "${drop.codename}" and password with the recipient.`,
        security: 'The file is encrypted and hidden in an innocent-looking image.',
        expiration: `This dead drop will expire in ${hoursUntilExpiry} hours.`,
      },
    });
  } catch (error) {
    console.error('Dead drop creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create dead drop',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get dead drop statistics (for monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const stats = deadDropStore.getStats();

    return NextResponse.json({
      stats,
      activeDrops: stats.active,
      totalRetrievals: stats.totalRetrievals,
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
