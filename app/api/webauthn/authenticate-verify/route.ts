import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { webAuthnStore } from '@/lib/auth/webauthn-store';
import { getUserByEmail } from '@/lib/auth/users';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server/script/deps';

// Relying Party configuration
const RP_ID = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).hostname
  : 'localhost';
const ORIGIN = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, credential } = body;

    if (!email || !credential) {
      return NextResponse.json(
        { error: 'Missing email or credential' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Retrieve the challenge for this user
    const expectedChallenge = webAuthnStore.getChallenge(email);
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'Challenge not found or expired' },
        { status: 400 }
      );
    }

    // Get the credential ID from the response
    const credentialID = credential.id || credential.rawId;

    // Retrieve the stored credential
    const storedCredential = webAuthnStore.getCredential(credentialID);
    if (!storedCredential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 404 }
      );
    }

    // Verify the credential belongs to this user
    if (storedCredential.userId !== email) {
      return NextResponse.json(
        { error: 'Credential does not belong to this user' },
        { status: 403 }
      );
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential as AuthenticationResponseJSON,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: Buffer.from(storedCredential.credentialID, 'base64url'),
        credentialPublicKey: storedCredential.credentialPublicKey,
        counter: storedCredential.counter,
      },
      requireUserVerification: false,
    });

    const { verified, authenticationInfo } = verification;

    if (!verified) {
      return NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 400 }
      );
    }

    // Update credential counter and last used timestamp
    webAuthnStore.updateCredentialCounter(
      credentialID,
      authenticationInfo.newCounter
    );

    // Clear the challenge
    webAuthnStore.clearChallenge(email);

    // Return success with user info for session creation
    return NextResponse.json({
      verified: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify authentication' },
      { status: 500 }
    );
  }
}
