'use client';

import Link from 'next/link';
import { Shield, Eye, Lock, Radio, Search } from 'lucide-react';

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              SWORD Intelligence Programs
            </h1>
            <p className="text-xl text-muted leading-relaxed">
              Classified research and development initiatives leveraging advanced cryptography,
              intelligence tradecraft, and cutting-edge security technologies.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-16">
          {/* CRYPTOGRAM */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">CRYPTOGRAM</h2>
                <p className="text-lg text-accent">Post-Quantum Cryptography Initiative</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Advanced cryptographic research program focused on quantum-resistant security primitives
                and hybrid encryption systems.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>ML-KEM-1024: NIST-approved key encapsulation mechanism (FIPS 203)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>ML-DSA-87: Digital signature algorithm with NIST Level 5 security (FIPS 204)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>AES-256-GCM: Authenticated symmetric encryption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Double ratchet protocol: Forward secrecy with per-message keys</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* DIRECTEYE */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">DIRECTEYE</h2>
                <p className="text-lg text-accent">Open-Source Intelligence Collection Platform</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Automated OSINT aggregation and threat intelligence pipeline with database-backed caching
                and real-time feed synchronization.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>18 integrated threat intelligence feeds (URLhaus, Feodo, PhishTank, OTX, VirusTotal)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Background synchronization service with automatic deduplication</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Database persistence for indicator caching and historical analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Multi-category coverage: malware, phishing, C2 infrastructure, narcotics, darknet markets</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* KYBERLOCK */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">KYBERLOCK</h2>
                <p className="text-lg text-accent">Biometric Hardware Authentication System</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Multi-factor authentication platform supporting FIDO2/WebAuthn hardware security keys,
                biometric authenticators, and PKI smartcards.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>WebAuthn/FIDO2 protocol implementation with database persistence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>YubiKey 5 Series support (USB, NFC, Lightning)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>CAC/PIV smartcard integration for government/DoD personnel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Platform authenticators (Face ID, Touch ID, Windows Hello, fingerprint readers)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Hardware Security Module (HSM) integration for cryptographic operations</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* SWORDCOMM */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Radio className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">SWORDCOMM</h2>
                <p className="text-lg text-accent">APT-Level Secure Communications Platform</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Real-time encrypted messaging system with advanced traffic obfuscation, dead drop triggers,
                and steganographic payload delivery.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>WebSocket-based real-time messaging with database persistence</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>APT41-inspired traffic obfuscation (message padding, decoy messages, timing randomization)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Dead drop system: time-based, heartbeat, and geographic triggers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>LSB steganography for hiding files in carrier images</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>End-to-end encryption with forward secrecy (double ratchet)</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* SPINDEX */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">SPINDEX</h2>
                <p className="text-lg text-accent">Searchable Private Index - Encrypted Search System</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Privacy-preserving searchable symmetric encryption (SSE) engine enabling keyword search
                over encrypted message archives without decryption.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>HMAC-based encrypted indexing: server never sees plaintext search terms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Trapdoor query generation: client-side search token creation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Fuzzy matching: Porter stemming, Soundex phonetic matching, Levenshtein distance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Bloom filters for efficient index lookups</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Stop word filtering and keyword normalization</span>
                </li>
              </ul>
              <div className="pt-4">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="p-8 rounded-lg bg-accent/5 border border-accent/20">
          <h3 className="text-2xl font-bold mb-4">Access Restricted</h3>
          <p className="text-muted mb-6">
            These programs are available exclusively to vetted clients with active engagements.
            All prospective clients undergo identity verification, sanctions screening, and business legitimacy assessment.
          </p>
          <Link
            href="/contact"
            className="inline-block px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-semibold"
          >
            Request Access
          </Link>
        </div>
      </section>
    </main>
  );
}
