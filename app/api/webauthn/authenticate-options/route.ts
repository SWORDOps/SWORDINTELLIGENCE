import { NextRequest, NextResponse } from 'next/server';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';
import { webAuthnStore } from '@/lib/auth/webauthn-store';

// Relying Party configuration
const RP_ID = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL).hostname
  : 'localhost';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user's registered credentials
    const userCredentials = webAuthnStore.getUserCredentials(email);

    if (userCredentials.length === 0) {
      return NextResponse.json(
        { error: 'No security keys registered for this account' },
        { status: 404 }
      );
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: userCredentials.map((cred) => ({
        id: cred.credentialID,
        type: 'public-key',
        transports: ['usb', 'nfc', 'ble', 'internal'],
      })),
      userVerification: 'preferred',
    });

    // Store challenge for verification
    webAuthnStore.setChallenge(email, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authentication options' },
      { status: 500 }
    );
  }
}
