/**
 * Image Analysis API Endpoint
 *
 * Analyze carrier image capacity for steganography
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { LSBSteganography } from '@/lib/steganography/lsb-engine';

/**
 * POST /api/steganography/analyze
 * Analyze carrier image capacity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Analyze image
    const analysis = LSBSteganography.analyzeImage(imageBuffer);

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        maxCapacityKB: Math.floor(analysis.maxCapacityBytes / 1024),
        maxCapacityMB: (analysis.maxCapacityBytes / (1024 * 1024)).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Failed to analyze image:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
