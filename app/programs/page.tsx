'use client';

import Link from 'next/link';
import { Shield, Eye, Lock, Radio, Search, AlertTriangle } from 'lucide-react';

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
                <p className="text-lg text-accent">Post-Quantum File Encryption with Hidden Volumes</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                High-performance file encryption combining CRYSTALS-Kyber (ML-KEM-768) with traditional
                algorithms for quantum-resistant data protection. Features hidden volumes and plausible deniability.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Hybrid encryption: ML-KEM-768 (post-quantum) + X25519 (classical)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Hidden volumes with plausible deniability protection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Cross-platform: Windows, macOS, Linux with GTK3 GUI</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Cloud sync support: S3, WebDAV, zero-knowledge providers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Hardware token support with Argon2id key derivation</span>
                </li>
              </ul>
              <div className="pt-4 flex items-center space-x-3">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
                <Link
                  href="/programs/kyberlock"
                  className="text-sm text-accent hover:underline"
                >
                  View Details →
                </Link>
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
                <p className="text-lg text-accent">APT-Level Secure Mobile Communications</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Military-grade secure messaging for Android/iOS with on-device real-time translation,
                post-quantum encryption, and hypervisor-level threat detection. Fully functional offline.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Kyber-1024 post-quantum encryption with forward secrecy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>EL2 hypervisor detection with adaptive countermeasures (99% accuracy)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>On-device Danish-English translation (no server required, optional network offload)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Signal Protocol-based with enhanced anti-surveillance features</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Intimate Protection Mode: per-contact maximum security</span>
                </li>
              </ul>
              <div className="pt-4 flex items-center space-x-3">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
                <Link
                  href="/programs/swordcomm"
                  className="text-sm text-accent hover:underline"
                >
                  View Details →
                </Link>
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
                <p className="text-lg text-accent">High-Performance Modular Data Indexing Engine</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Enterprise-grade data indexing tool for massive datasets (500+ TB) with AVX-512 optimizations,
                ML-powered content classification, and Elasticsearch integration.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Pure C implementation with AVX-512 optimized phrase search</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Plugin architecture: automatic module discovery and integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>OpenVINO ML integration for ambiguous content classification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>15+ file formats: text, office docs, databases, archives, medical imaging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Elasticsearch/Kibana integration with RBAC and E2E encryption</span>
                </li>
              </ul>
              <div className="pt-4 flex items-center space-x-3">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
                <Link
                  href="/programs/spindex"
                  className="text-sm text-accent hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>

          {/* KP14 */}
          <div className="p-8 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">KP14</h2>
                <p className="text-lg text-accent">Advanced Malware Analysis & Steganographic Intelligence</p>
              </div>
            </div>
            <div className="pl-16 space-y-4">
              <p className="text-muted leading-relaxed">
                Enterprise-grade platform for analyzing sophisticated malware and steganographic payloads.
                Originally designed for APT41's KeyPlug, now capable of decompiling most modern malware.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Static binary analysis: PE parsing, disassembly (Capstone + Radare2), entropy analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Steganography detection: LSB, DCT coefficients, polyglot files (ZIP/JAR, JPEG/PE)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Cryptographic analysis: XOR, AES, RC4, ChaCha20, custom APT41 algorithms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Hardware acceleration: Intel NPU (3-10× speedup), GPU support, OpenVINO integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>Detection rules: Auto-generate YARA, Suricata, Snort, Sigma with MITRE ATT&CK mapping</span>
                </li>
              </ul>
              <div className="pt-4 flex items-center space-x-3">
                <span className="inline-block px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  OPERATIONAL
                </span>
                <Link
                  href="/programs/kp14"
                  className="text-sm text-accent hover:underline"
                >
                  View Details →
                </Link>
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
