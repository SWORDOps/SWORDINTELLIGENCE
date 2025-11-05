import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a simple nonce for CSP (in production, use crypto.randomBytes)
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
}

// Regional compliance feature flags
export interface ComplianceFlags {
  strictMode: boolean; // GDPR/CCPA-like requirements
  requireConsent: boolean;
  enableTracking: boolean;
  region: 'US' | 'EU' | 'OTHER';
}

export function getComplianceFlags(userRegion?: string): ComplianceFlags {
  // Default to U.S./Iowa baseline
  const flags: ComplianceFlags = {
    strictMode: false,
    requireConsent: false,
    enableTracking: true,
    region: 'US',
  };

  // Check for EU region (will be implemented with geo-detection)
  if (userRegion && ['EU', 'EEA', 'UK'].includes(userRegion)) {
    flags.strictMode = true;
    flags.requireConsent = true;
    flags.region = 'EU';
  }

  return flags;
}
