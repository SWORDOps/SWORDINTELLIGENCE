import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { webAuthnStore } from '@/lib/auth/webauthn-store';

// Relying Party configuration
const RP_NAME = 'SWORD Intelligence Portal';
const RP_ID = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).hostname
  : 'localhost';

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

    // Get existing credentials for this user (for excluded credentials)
    const userCredentials = webAuthnStore.getUserCredentials(userId);
    const excludeCredentials = userCredentials.map((cred) => ({
      id: cred.credentialID,
      type: 'public-key' as const,
    }));

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: userId,
      userName: session.user.name || userId,
      userDisplayName: session.user.name || userId,
      attestationType: 'none', // 'none', 'indirect', or 'direct'
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'cross-platform', // Hardware keys
      },
    });

    // Store challenge for verification
    webAuthnStore.setChallenge(userId, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate registration options' },
      { status: 500 }
    );
  }
}
