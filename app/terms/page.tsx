import { FileText, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | SWORD Intelligence',
  description: 'Terms governing use of our website and services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-6 h-6 text-accent" />
              <span className="text-sm font-mono text-muted uppercase">Terms of Service</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted">
              Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-12 p-6 rounded-lg border border-accent/30 bg-surface">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Important Notice</h2>
                <p className="text-muted">
                  These Terms of Service govern your access to and use of the SWORD Intelligence
                  website. By accessing or using our website, you agree to be bound by these Terms.
                  If you do not agree, do not use our website.
                </p>
              </div>
            </div>
          </section>

          {/* Website Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">1. Website Use</h2>
            <div className="space-y-4 text-muted">
              <p>
                This website provides information about our services and allows you to contact us
                for consultations. You may use our website only for lawful purposes and in
                accordance with these Terms.
              </p>
              <p>You agree not to:</p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Use our website in any way that violates applicable laws or regulations
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Attempt to gain unauthorized access to any portion of our website or systems
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Introduce viruses, malware, or other malicious code
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Engage in automated data collection (scraping, crawling) without permission
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>
                    Impersonate any person or entity or misrepresent your affiliation
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Service Engagement */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">2. Service Engagement</h2>
            <div className="space-y-4 text-muted">
              <p>
                Information on this website is for general informational purposes only and does
                not constitute an offer of services or create a client relationship. Actual
                service engagements are governed by separate written agreements.
              </p>
              <p>
                Initial consultations or inquiries do not create a client relationship or
                obligations of confidentiality until a formal engagement agreement is signed.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">3. Intellectual Property</h2>
            <div className="space-y-4 text-muted">
              <p>
                All content on this website—including text, graphics, logos, code, and design—is
                the property of SWORD Intelligence or its licensors and is protected by copyright,
                trademark, and other intellectual property laws.
              </p>
              <p>
                You may view and use website content for personal, non-commercial purposes only.
                You may not reproduce, distribute, modify, or create derivative works without our
                written permission.
              </p>
            </div>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">4. Disclaimer of Warranties</h2>
            <div className="p-6 rounded-lg border border-border bg-surface space-y-4 text-muted">
              <p>
                THIS WEBSITE AND ITS CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
                NON-INFRINGEMENT.
              </p>
              <p>
                We do not warrant that our website will be uninterrupted, error-free, or free of
                viruses or other harmful components. We make no representations about the accuracy,
                completeness, or timeliness of information on this website.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">5. Limitation of Liability</h2>
            <div className="p-6 rounded-lg border border-border bg-surface space-y-4 text-muted">
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, SWORD INTELLIGENCE SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
                OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
                DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Your access to or use of (or inability to access or use) this website</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Any conduct or content of any third party on the website</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-accent">•</span>
                  <span>Unauthorized access, use, or alteration of your data</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">6. Indemnification</h2>
            <p className="text-muted">
              You agree to indemnify, defend, and hold harmless SWORD Intelligence and its
              officers, employees, and agents from any claims, liabilities, damages, losses, and
              expenses (including reasonable attorneys&apos; fees) arising out of or related to your
              violation of these Terms or your use of our website.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">7. Governing Law and Jurisdiction</h2>
            <p className="text-muted">
              These Terms are governed by the laws of the State of Iowa and the United States,
              without regard to conflict-of-law principles. Any disputes arising from these Terms
              or your use of our website shall be resolved exclusively in the state or federal
              courts located in Iowa, and you consent to personal jurisdiction in those courts.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">8. Changes to These Terms</h2>
            <p className="text-muted">
              We reserve the right to modify these Terms at any time. Changes will be posted on
              this page with an updated effective date. Your continued use of our website after
              changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          {/* Severability */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">9. Severability</h2>
            <p className="text-muted">
              If any provision of these Terms is found to be unenforceable or invalid, that
              provision will be limited or eliminated to the minimum extent necessary, and the
              remaining provisions will remain in full force and effect.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-lg border border-accent/30 bg-surface">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted mb-4">
              Questions about these Terms? Contact us at:
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:legal@sword-intel.example" className="text-accent hover:underline">
                  legal@sword-intel.example
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
