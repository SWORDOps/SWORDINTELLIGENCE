/**
 * Get User Public Keys API
 *
 * Retrieve another user's public keys for message encryption
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { messageStore } from '@/lib/messaging/message-store';

/**
 * GET - Get a user's public keys
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    const profile = messageStore.getProfile(userId);
    if (!profile) {
      return NextResponse.json({
        error: 'User not found or has not generated messaging keys',
      }, { status: 404 });
    }

    // Check if user accepts direct messages
    if (!profile.acceptDirectMessages && profile.requireApproval) {
      return NextResponse.json({
        error: 'User does not accept direct messages',
        acceptDirectMessages: false,
      }, { status: 403 });
    }

    return NextResponse.json({
      userId: profile.userId,
      displayName: profile.displayName,
      publicKeys: {
        kyber: profile.kyberPublicKey,
        dilithium: profile.dilithiumPublicKey,
      },
      online: profile.online,
      lastSeen: profile.lastSeen,
      acceptDirectMessages: profile.acceptDirectMessages,
    });
  } catch (error: any) {
    console.error('Public key retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve public keys', details: error.message },
      { status: 500 }
    );
  }
}
