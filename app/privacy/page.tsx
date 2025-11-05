import { Shield, Eye, Database, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Notice | SWORD Intelligence',
  description: 'Our privacy practices, data handling, and your rights.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <span className="text-sm font-mono text-muted uppercase">Privacy Notice</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Notice</h1>
            <p className="text-muted">
              Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12 p-6 rounded-lg border border-border bg-surface">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p className="text-muted leading-relaxed">
              SWORD Intelligence (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Notice explains how we collect, use, disclose, and safeguard your
              information when you visit our website or engage our services. Our practices align
              with U.S. and Iowa law as a baseline, with options for stricter protections where
              applicable.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Database className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Information You Provide</h3>
                <ul className="space-y-2 text-muted">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Contact Information:</strong> Name, email, phone number, organization
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Inquiry Details:</strong> Information you provide in contact forms or
                      secure communications
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Engagement Data:</strong> If you become a client, information related
                      to your engagement (subject to separate engagement agreements)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
                <ul className="space-y-2 text-muted">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Technical Data:</strong> IP address, browser type, device information,
                      operating system
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Usage Data:</strong> Pages visited, time spent, click patterns (via
                      first-party analytics)
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>
                      <strong>Security Logs:</strong> Request metadata, authentication events, and
                      abuse prevention signals
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <div className="flex items-center space-x-2 mb-6">
              <Eye className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            </div>

            <ul className="space-y-3 text-muted">
              <li className="flex items-start space-x-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Service Delivery:</strong> To respond to inquiries, provide consultations,
                  and deliver intelligence services
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Security:</strong> To protect our services, detect abuse, and prevent
                  unauthorized access
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Analytics:</strong> To understand how our website is used and improve
                  performance (first-party analytics preferred)
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Legal Obligations:</strong> To comply with applicable laws, regulations,
                  and legal processes
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">→</span>
                <span>
                  <strong>Business Operations:</strong> For internal record-keeping, quality
                  assurance, and operational continuity
                </span>
              </li>
            </ul>
          </section>

          {/* Sharing and Disclosure */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Sharing and Disclosure</h2>

            <div className="space-y-4 text-muted">
              <p>
                We do <strong>not</strong> sell your personal information. We may share information
                in the following limited circumstances:
              </p>

              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Service Providers:</strong> Trusted vendors who assist with hosting,
                    analytics, or communications (under strict confidentiality agreements)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Legal Requirements:</strong> When required by law, court order, or to
                    respond to lawful requests from authorities
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Protection:</strong> To protect our rights, safety, or property, or that
                    of our clients or the public
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                    sale of assets (with notice to affected parties)
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-12 p-6 rounded-lg border border-accent/30 bg-surface">
            <div className="flex items-center space-x-2 mb-6">
              <Lock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>
            </div>

            <div className="space-y-4 text-muted">
              <div>
                <h3 className="font-semibold text-foreground mb-2">U.S./Iowa Baseline Rights</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Opt-Out:</strong> You may opt out of certain data collection and
                      processing (see below)
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Access:</strong> Request information about what personal data we hold
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Correction:</strong> Request correction of inaccurate information
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Deletion:</strong> Request deletion of your information (subject to
                      legal retention requirements)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">How to Exercise Your Rights</h3>
                <p>
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@sword-intel.example" className="text-accent hover:underline">
                    privacy@sword-intel.example
                  </a>
                  . We will respond within 30 days.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Do-Not-Track & GPC</h3>
                <p>
                  We honor Do-Not-Track (DNT) and Global Privacy Control (GPC) signals where
                  technically feasible. When these signals are detected, we disable non-essential
                  tracking.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Data Security</h2>
            <div className="p-6 rounded-lg border border-border bg-surface space-y-4 text-muted">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Encryption in transit (TLS 1.3+) and at rest (AES-256)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Strict access controls (multi-factor authentication, least privilege)
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Tamper-evident audit logs with WORM retention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Regular security audits and penetration testing</span>
                </li>
              </ul>
              <p className="text-sm">
                <em>
                  No system is perfectly secure. If you become aware of a security issue, please
                  contact us immediately.
                </em>
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Data Retention</h2>
            <p className="text-muted">
              We retain personal information for as long as necessary to fulfill the purposes
              outlined in this Privacy Notice, unless a longer retention period is required or
              permitted by law. Typical retention periods:
            </p>
            <ul className="space-y-2 mt-4 text-muted">
              <li className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>
                  <strong>Inquiry Data:</strong> 2 years from last contact
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>
                  <strong>Client Engagement Data:</strong> 7 years post-engagement (or longer if
                  required by law or litigation holds)
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>
                  <strong>Security Logs:</strong> 1 year (audit logs retained longer for compliance)
                </span>
              </li>
            </ul>
          </section>

          {/* International Users */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">International Users</h2>
            <p className="text-muted">
              Our services are operated from the United States. If you are accessing our website
              from outside the U.S., please be aware that your information may be transferred to,
              stored, and processed in the U.S., where data protection laws may differ from those
              in your jurisdiction. For users in the European Economic Area (EEA) or other
              jurisdictions with stricter requirements, we can implement additional safeguards upon
              request.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Children&apos;s Privacy</h2>
            <p className="text-muted">
              Our services are not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children. If we learn that we have collected
              information from a child under 18, we will delete it promptly.
            </p>
          </section>

          {/* Changes to This Notice */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Changes to This Privacy Notice</h2>
            <p className="text-muted">
              We may update this Privacy Notice from time to time. Changes will be posted on this
              page with an updated effective date. Material changes will be communicated via email
              or prominent notice on our website.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-lg border border-accent/30 bg-surface">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted mb-4">
              If you have questions or concerns about this Privacy Notice or our privacy practices:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@sword-intel.example" className="text-accent hover:underline">
                  privacy@sword-intel.example
                </a>
              </p>
              <p>
                <strong>Secure Contact:</strong>{' '}
                <a href="/contact" className="text-accent hover:underline">
                  Use our encrypted contact form
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
