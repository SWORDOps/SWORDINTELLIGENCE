// In-memory store for WebAuthn credentials
// In production, this would be replaced with database storage

export interface WebAuthnCredential {
  id: string;
  userId: string;
  credentialID: string;
  credentialPublicKey: Uint8Array;
  counter: number;
  deviceName: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface WebAuthnChallenge {
  challenge: string;
  userId: string;
  timestamp: number;
}

class WebAuthnStore {
  private credentials: Map<string, WebAuthnCredential> = new Map();
  private challenges: Map<string, WebAuthnChallenge> = new Map();
  private userCredentials: Map<string, string[]> = new Map(); // userId -> credentialIds

  // Credential management
  addCredential(credential: WebAuthnCredential): void {
    this.credentials.set(credential.credentialID, credential);

    const userCreds = this.userCredentials.get(credential.userId) || [];
    userCreds.push(credential.credentialID);
    this.userCredentials.set(credential.userId, userCreds);
  }

  getCredential(credentialID: string): WebAuthnCredential | undefined {
    return this.credentials.get(credentialID);
  }

  getUserCredentials(userId: string): WebAuthnCredential[] {
    const credIds = this.userCredentials.get(userId) || [];
    return credIds
      .map(id => this.credentials.get(id))
      .filter((cred): cred is WebAuthnCredential => cred !== undefined);
  }

  updateCredentialCounter(credentialID: string, counter: number): void {
    const cred = this.credentials.get(credentialID);
    if (cred) {
      cred.counter = counter;
      cred.lastUsed = new Date();
    }
  }

  removeCredential(credentialID: string): void {
    const cred = this.credentials.get(credentialID);
    if (cred) {
      this.credentials.delete(credentialID);

      const userCreds = this.userCredentials.get(cred.userId) || [];
      const filtered = userCreds.filter(id => id !== credentialID);
      this.userCredentials.set(cred.userId, filtered);
    }
  }

  // Challenge management (for CSRF protection)
  setChallenge(userId: string, challenge: string): void {
    this.challenges.set(userId, {
      challenge,
      userId,
      timestamp: Date.now(),
    });

    // Auto-cleanup old challenges after 5 minutes
    setTimeout(() => {
      this.challenges.delete(userId);
    }, 5 * 60 * 1000);
  }

  getChallenge(userId: string): string | undefined {
    const data = this.challenges.get(userId);
    if (!data) return undefined;

    // Challenges expire after 5 minutes
    if (Date.now() - data.timestamp > 5 * 60 * 1000) {
      this.challenges.delete(userId);
      return undefined;
    }

    return data.challenge;
  }

  clearChallenge(userId: string): void {
    this.challenges.delete(userId);
  }
}

// Singleton instance
export const webAuthnStore = new WebAuthnStore();

// Helper to initialize demo credentials (remove in production)
export function initDemoWebAuthnCredentials() {
  // Demo user already has credentials set up
  // This would normally come from database on app start
}
