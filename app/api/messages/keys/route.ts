/**
 * Messaging Keys API
 *
 * Generate and retrieve post-quantum public keys for messaging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateMessagingKeys } from '@/lib/messaging/message-crypto';
import { messageStore } from '@/lib/messaging/message-store';

/**
 * POST - Generate messaging keys for current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;

    // Check if user already has keys
    const existingProfile = messageStore.getProfile(userId);
    if (existingProfile) {
      return NextResponse.json({
        error: 'Keys already exist. Use PUT to rotate keys.',
      }, { status: 400 });
    }

    // Generate new keys
    const keys = await generateMessagingKeys();

    // Store profile with public keys
    messageStore.storeProfile({
      userId,
      displayName: session.user.name || userId,
      kyberPublicKey: Buffer.from(keys.kyber.publicKey).toString('base64'),
      dilithiumPublicKey: Buffer.from(keys.dilithium.publicKey).toString('base64'),
      keyGeneratedAt: new Date(),
      acceptDirectMessages: true,
      requireApproval: false,
      online: true,
      lastSeen: new Date(),
    });

    return NextResponse.json({
      success: true,
      publicKeys: {
        kyber: Buffer.from(keys.kyber.publicKey).toString('base64'),
        dilithium: Buffer.from(keys.dilithium.publicKey).toString('base64'),
      },
      // IMPORTANT: Private keys should be stored client-side only
      // For this demo, we'll return them but in production they should never leave the client
      privateKeys: {
        kyber: Buffer.from(keys.kyber.privateKey).toString('base64'),
        dilithium: Buffer.from(keys.dilithium.privateKey).toString('base64'),
      },
      warning: 'Store private keys securely on client. Never transmit to server in production.',
    });
  } catch (error: any) {
    console.error('Key generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate keys', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get current user's messaging profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.email;
    const profile = messageStore.getProfile(userId);

    if (!profile) {
      return NextResponse.json({
        error: 'No messaging profile found. Generate keys first.',
        hasKeys: false,
      }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        kyberPublicKey: profile.kyberPublicKey,
        dilithiumPublicKey: profile.dilithiumPublicKey,
        keyGeneratedAt: profile.keyGeneratedAt,
        online: profile.online,
        lastSeen: profile.lastSeen,
        statusMessage: profile.statusMessage,
      },
      hasKeys: true,
    });
  } catch (error: any) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile', details: error.message },
      { status: 500 }
    );
  }
}
