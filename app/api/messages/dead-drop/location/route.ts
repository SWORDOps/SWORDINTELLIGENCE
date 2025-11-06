/**
 * Location API Endpoint
 *
 * Updates user's location for geographic trigger evaluation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { deadDropStore } from '@/lib/messaging/dead-drop';

/**
 * POST /api/messages/dead-drop/location
 * Update user's location
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, accuracy } = body;

    // Validation
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const ipHash = ipAddress !== 'unknown'
      ? require('crypto').createHash('sha256').update(ipAddress).digest('hex').substring(0, 16)
      : undefined;

    // Update location
    deadDropStore.updateLocation(session.user.email, {
      latitude,
      longitude,
      accuracy: accuracy || 0,
      ipHash,
    });

    return NextResponse.json({
      success: true,
      location: {
        latitude,
        longitude,
        accuracy,
      },
    });
  } catch (error) {
    console.error('Failed to update location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages/dead-drop/location
 * Get user's last known location
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const location = deadDropStore.getLocation(session.user.email);

    if (!location) {
      return NextResponse.json(
        { error: 'No location found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to get location:', error);
    return NextResponse.json(
      { error: 'Failed to get location' },
      { status: 500 }
    );
  }
}
