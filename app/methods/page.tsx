import { Scale, FileCheck, Shield, Database, Lock, Eye } from 'lucide-react';

export const metadata = {
  title: 'Methods & Compliance | SWORD Intelligence',
  description: 'Lawful methodologies, chain-of-custody, and U.S./Iowa privacy baseline.',
};

export default function MethodsPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-border bg-surface">
              <Scale className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted">METHODS & COMPLIANCE</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Lawful. Defensible. Auditable.
            </h1>
            <p className="text-xl text-muted">
              Our methodologies align with legal requirements, evidentiary standards, and
              professional ethics. Every action is documented, every finding defensible.
            </p>
          </div>
        </div>
      </section>

      {/* Lawful Methodologies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <FileCheck className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Lawful Methodologies</h2>
              </div>
              <div className="bg-surface border border-border rounded-lg p-8 space-y-4">
                <p className="text-lg leading-relaxed">
                  We apply <strong>lawful methodologies</strong>, strict{' '}
                  <strong>chain-of-custody</strong>, and a{' '}
                  <strong>least-intrusive-means principle</strong>. Every investigation and
                  intelligence operation adheres to applicable laws and professional standards.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>No illegal methods</strong>: We do not hack, wiretap, or breach
                      systems without authorization. All technical collection is lawful.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Open-source primacy</strong>: We start with OSINT and publicly
                      available data before escalating to more invasive techniques.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Authorization gates</strong>: Client authorization and legal review
                      required for sensitive operations.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Documentation</strong>: All actions logged with timestamps,
                      operators, and justifications.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Lawful Cooperation */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Lawful Cooperation</h2>
              </div>
              <div className="bg-surface border border-accent/30 rounded-lg p-8 space-y-4">
                <p className="text-lg leading-relaxed">
                  We work <strong>within the law</strong>. Where matters escalate—fraud,
                  coercion, threats—we <strong>coordinate with competent authorities</strong>{' '}
                  through <strong>proper legal processes</strong> (e.g., client-authorized
                  referrals, counsel-managed disclosures, or responding to valid legal orders).
                </p>
                <p className="text-lg leading-relaxed">
                  Our role is to surface evidence that <strong>stands up</strong>, not to
                  overreach. When cases involve public-safety risk or criminal activity, we work
                  with authorities through the proper legal channels—typically via your counsel
                  and documented requests—so evidence remains admissible and your rights
                  protected.
                </p>
              </div>
            </div>

            {/* Evidentiary Standards */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Evidentiary Standards</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">ICD-203 Compliance</h3>
                  <p className="text-muted">
                    All intelligence reports follow ICD-203 analytic standards: confidence
                    assessments, source transparency, alternative hypotheses, and structured
                    judgments.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Chain-of-Custody</h3>
                  <p className="text-muted">
                    Digital evidence handling follows NIST guidelines. Hashes, timestamps, and
                    tamper-evident logging ensure evidence integrity from collection to court.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Technical Rigor</h3>
                  <p className="text-muted">
                    Findings include technical appendices with artifacts, IOCs, hashes, and
                    packet captures. Peer review before client delivery.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Legal Review</h3>
                  <p className="text-muted">
                    High-stakes reports receive legal review to ensure admissibility and
                    compliance with discovery obligations.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy & Data Protection */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Privacy & Data Protection</h2>
              </div>
              <div className="bg-surface border border-border rounded-lg p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">U.S./Iowa Baseline</h3>
                  <p className="text-muted mb-4">
                    Our privacy practices align with U.S. and Iowa law as a baseline. We provide:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2 text-muted">
                      <span className="text-accent">→</span>
                      <span>
                        Clear <strong>Privacy Notice</strong> explaining data collection and use
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-muted">
                      <span className="text-accent">→</span>
                      <span>
                        <strong>Opt-out mechanisms</strong> for targeted advertising and data
                        sharing (if any)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-muted">
                      <span className="text-accent">→</span>
                      <span>
                        <strong>First-party analytics</strong> preferred; additional tracking
                        disclosed and optional
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-muted">
                      <span className="text-accent">→</span>
                      <span>
                        Server-side <strong>consent/opt-out state</strong> with audit logs
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-muted">
                      <span className="text-accent">→</span>
                      <span>
                        Honor <strong>Do-Not-Track</strong> and GPC signals where feasible
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Regional Compliance</h3>
                  <p className="text-muted">
                    Our architecture is <strong>switchable</strong> to stricter regimes (GDPR,
                    CCPA) via feature flags. We can layer consent banners, EEA routing, and
                    enhanced data subject rights as needed—without redesigning the platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Audit & Logging */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-8 h-8 text-accent" />
                <h2 className="text-3xl font-bold">Audit & Logging</h2>
              </div>
              <div className="bg-surface border border-border rounded-lg p-8 space-y-4">
                <p className="text-lg">
                  We maintain <strong>signed, tamper-evident logs</strong> for all critical
                  operations:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2 text-muted">
                    <span className="text-accent">→</span>
                    <span>Request metadata (timestamp, source IP, user agent)</span>
                  </li>
                  <li className="flex items-start space-x-2 text-muted">
                    <span className="text-accent">→</span>
                    <span>Consent/opt-out state changes</span>
                  </li>
                  <li className="flex items-start space-x-2 text-muted">
                    <span className="text-accent">→</span>
                    <span>Authentication events and privilege escalations</span>
                  </li>
                  <li className="flex items-start space-x-2 text-muted">
                    <span className="text-accent">→</span>
                    <span>Evidence handling (collection, transfer, access)</span>
                  </li>
                  <li className="flex items-start space-x-2 text-muted">
                    <span className="text-accent">→</span>
                    <span>
                      Administrative actions (user provisioning, configuration changes)
                    </span>
                  </li>
                </ul>
                <p className="text-muted mt-4">
                  Logs use <strong>WORM-style retention</strong> (write-once, read-many) and are
                  subject to routine internal review. Available for client audit upon request.
                </p>
              </div>
            </div>

            {/* Security Headers & Infrastructure */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Security Posture</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Security Headers</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Strict CSP with nonce-based script execution</li>
                    <li>• HSTS with preload directive</li>
                    <li>• COOP/COEP for process isolation</li>
                    <li>• Minimal Permissions-Policy</li>
                    <li>• strict-origin-when-cross-origin referrers</li>
                  </ul>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Infrastructure</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• U.S.-based hosting with SOC2 providers</li>
                    <li>• Encrypted data at rest (AES-256) and in transit (TLS 1.3+)</li>
                    <li>• No third-party analytics or ad networks by default</li>
                    <li>• Automated vulnerability scanning & patching</li>
                    <li>• Annual penetration testing</li>
                  </ul>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">SBOM & Supply Chain</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Software Bill of Materials (SBOM) maintained</li>
                    <li>• CVE monitoring for dependencies</li>
                    <li>• Sub-resource integrity (SRI) for third-party assets</li>
                    <li>• No third-party fonts without hash verification</li>
                  </ul>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Access Controls</h3>
                  <ul className="space-y-1 text-sm text-muted">
                    <li>• Multi-factor authentication (MFA) required</li>
                    <li>• Principle of least privilege (PoLP)</li>
                    <li>• Role-based access control (RBAC)</li>
                    <li>• Regular access reviews and de-provisioning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
