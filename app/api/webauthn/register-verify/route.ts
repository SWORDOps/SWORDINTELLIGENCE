import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { webAuthnStore } from '@/lib/auth/webauthn-store';
import type { RegistrationResponseJSON } from '@simplewebauthn/server/script/deps';

// Relying Party configuration
const RP_ID = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).hostname
  : 'localhost';
const ORIGIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.email;
    const body = await request.json();
    const { credential, deviceName } = body;

    if (!credential || !deviceName) {
      return NextResponse.json(
        { error: 'Missing credential or device name' },
        { status: 400 }
      );
    }

    // Retrieve the challenge for this user
    const expectedChallenge = webAuthnStore.getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      );
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential as RegistrationResponseJSON,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }

    const {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    // Store the credential
    webAuthnStore.addCredential({
      id: `${userId}-${Date.now()}`,
      userId,
      credentialID: Buffer.from(credentialID).toString('base64url'),
      credentialPublicKey: new Uint8Array(credentialPublicKey),
      counter,
      deviceName,
      createdAt: new Date(),
    });

    // Clear the challenge
    webAuthnStore.clearChallenge(userId);

    return NextResponse.json({
      verified: true,
      message: 'Security key registered successfully',
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    });
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify registration' },
      { status: 500 }
    );
  }
}
