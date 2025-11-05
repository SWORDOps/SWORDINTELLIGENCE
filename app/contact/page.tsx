'use client';

import { useState } from 'react';
import { Shield, Mail, MessageSquare, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    urgency: 'normal',
    service: '',
    message: '',
    pgpKey: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to a secure API endpoint
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry. We will respond via secure channels within 24 hours.');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-border bg-surface">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted">SECURE CONTACT</span>
            </div>
            <h1 className="text-5xl font-bold">Book a Secure Briefing</h1>
            <p className="text-xl text-muted">
              All inquiries are handled with strict confidentiality. We offer multiple secure
              communication channels for sensitive matters.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Initial Contact Form</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-2">
                    Your Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select...</option>
                    <option value="executive">Executive / C-Suite</option>
                    <option value="security">Security Leader</option>
                    <option value="legal">Legal / GC</option>
                    <option value="operations">Operations</option>
                    <option value="investor">Investor / Fund</option>
                    <option value="individual">Individual / UHNWI</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium mb-2">
                    Urgency *
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    required
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="normal">Normal (response within 24h)</option>
                    <option value="high">High (response within 4h)</option>
                    <option value="critical">Critical / Active Incident (immediate)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium mb-2">
                    Service Interest
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select...</option>
                    <option value="intelligence">Intelligence / Threat Hunting</option>
                    <option value="response">Incident Response</option>
                    <option value="resilience">Resilience / Executive Protection</option>
                    <option value="multiple">Multiple Services</option>
                    <option value="consultation">General Consultation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Brief description of your needs (detailed information can be shared via secure channels after initial contact)"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="pgpKey" className="block text-sm font-medium mb-2">
                    PGP Public Key (Optional)
                  </label>
                  <textarea
                    id="pgpKey"
                    name="pgpKey"
                    rows={3}
                    value={formData.pgpKey}
                    onChange={handleChange}
                    placeholder="Paste your PGP public key here for encrypted responses"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent resize-none font-mono text-sm"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Submit Secure Inquiry
                </Button>

                <p className="text-xs text-muted">
                  By submitting, you acknowledge our{' '}
                  <a href="/privacy" className="text-accent hover:underline">
                    Privacy Notice
                  </a>{' '}
                  and{' '}
                  <a href="/terms" className="text-accent hover:underline">
                    Terms of Service
                  </a>
                  .
                </p>
              </form>
            </div>

            {/* Secure Channels & Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Secure Communication Channels</h2>
                <div className="space-y-4">
                  <div className="p-6 rounded-lg border border-border bg-surface">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Encrypted Email</h3>
                        <p className="text-sm text-muted mb-2">
                          For sensitive communications, use our PGP-encrypted email:
                        </p>
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          secure@sword-intel.example
                        </code>
                        <p className="text-xs text-muted mt-2">
                          <a href="#" className="text-accent hover:underline">
                            Download our PGP public key
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-surface">
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Signal / Matrix</h3>
                        <p className="text-sm text-muted">
                          For real-time encrypted messaging, we support Signal and Matrix. Contact
                          details provided after initial verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-surface">
                    <div className="flex items-start space-x-3">
                      <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Emergency Hotline</h3>
                        <p className="text-sm text-muted mb-2">
                          For active incidents requiring immediate response:
                        </p>
                        <p className="text-lg font-mono text-accent">+1 (XXX) XXX-XXXX</p>
                        <p className="text-xs text-muted mt-1">24/7 availability</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border border-border bg-surface">
                    <div className="flex items-start space-x-3">
                      <Lock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Secure File Transfer</h3>
                        <p className="text-sm text-muted">
                          For large files or sensitive documents, we provide end-to-end encrypted
                          file transfer. Links provided after initial contact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border border-accent/30 bg-surface">
                <h3 className="font-semibold mb-3">What Happens Next?</h3>
                <ol className="space-y-2 text-sm text-muted">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">1.</span>
                    <span>
                      We review your inquiry and perform initial conflict checks
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">2.</span>
                    <span>
                      Senior team member contacts you via your preferred secure channel
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">3.</span>
                    <span>
                      We conduct a secure briefing to understand your specific needs
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">4.</span>
                    <span>
                      Scoping, engagement letter, and work begins (typically within 48h)
                    </span>
                  </li>
                </ol>
              </div>

              <div className="p-6 rounded-lg border border-border bg-surface mt-6">
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span>Operational Note</span>
                </h3>
                <p className="text-sm text-muted">
                  If I don&apos;t respond immediately, maximum response time is <strong>7 days</strong>.
                  I sometimes go dark when on active operations. For critical/time-sensitive matters,
                  use the emergency hotline above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
