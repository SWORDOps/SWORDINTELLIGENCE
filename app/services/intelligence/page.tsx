import { Search, Eye, Database, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Intelligence Services | SWORD Intelligence',
  description: 'Threat hunting, OSINT, blockchain forensics, and adversary profiling with lawful methodologies.',
};

export default function IntelligencePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
              <Search className="w-8 h-8 text-accent" />
              <span className="text-sm font-mono text-muted uppercase tracking-wider">
                Intelligence
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Attribution That Stands Up
            </h1>
            <p className="text-xl text-muted mb-8">
              Proactive threat hunting, OSINT, on-chain forensics, and adversary profiling.
              We map infrastructures, personas, and flows before they strike—and structure
              evidence to meet evidentiary standards.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Request Intelligence Brief
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Core Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border border-border bg-surface">
                <Eye className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">OSINT & Dark Web Monitoring</h3>
                <p className="text-muted mb-4">
                  Continuous monitoring of surface web, deep web, and dark-web forums for threat
                  indicators. We track adversary chatter, data leaks, and emerging tactics
                  targeting your sector.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Forum & marketplace reconnaissance</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Credential leak detection & alerting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Brand impersonation & domain monitoring</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Adversary infrastructure mapping</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Database className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Blockchain Forensics & Tracing</h3>
                <p className="text-muted mb-4">
                  On-chain analytics to trace stolen funds, identify wallet clusters, and map
                  transaction flows across chains. We work with exchanges and law enforcement
                  to freeze and recover assets.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Cross-chain transaction tracing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Wallet clustering & attribution</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Smart contract analysis (exploit detection)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Asset freeze coordination with exchanges</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <FileText className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Threat Actor Profiling</h3>
                <p className="text-muted mb-4">
                  Structured adversary profiles: TTPs, infrastructure, personas, and historical
                  campaigns. We assess capability, intent, and likelihood of future activity
                  against your organization.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>TTP mapping (MITRE ATT&CK framework)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Infrastructure attribution (domains, IPs, ASNs)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Persona linkage (social media, forums, wallets)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Historical campaign analysis & victimology</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <FileText className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Structured Intelligence Reporting</h3>
                <p className="text-muted mb-4">
                  All findings delivered in ICD-203 compliant reports: executive summaries,
                  analytic confidence assessments, sourcing transparency, and recommendations.
                  Designed for legal review and potential court use.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>ICD-203 analytic standards (confidence levels, sources)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Chain-of-custody documentation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Technical appendices with artifacts & hashes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Executive briefings & tactical playbooks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Common Engagements</h2>
            <div className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-background">
                <h3 className="text-xl font-semibold mb-2">Pre-Transaction Due Diligence</h3>
                <p className="text-muted">
                  M&A targets, investment candidates, or partnership prospects: we surface hidden
                  cyber risks, compromised credentials, and links to threat actors before you sign.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-background">
                <h3 className="text-xl font-semibold mb-2">Proactive Threat Hunting</h3>
                <p className="text-muted">
                  Continuous monitoring for your organization&apos;s name, executives, and infrastructure
                  across dark-web forums, paste sites, and credential dumps. Early warning of
                  planned attacks or leaked data.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-background">
                <h3 className="text-xl font-semibold mb-2">Post-Incident Attribution</h3>
                <p className="text-muted">
                  After a breach or fraud event: we attribute the activity to specific threat
                  actors, map their infrastructure, and provide actionable leads for law enforcement
                  referrals or civil litigation.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-background">
                <h3 className="text-xl font-semibold mb-2">Crypto Asset Recovery</h3>
                <p className="text-muted">
                  Trace stolen funds through mixers and cross-chain bridges, identify cash-out
                  points, and coordinate with exchanges to freeze assets. We&apos;ve recovered millions
                  through this process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Process</h2>
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Scoping & Tasking',
                  description:
                    'We clarify your priority intelligence requirements (PIRs), define scope, and establish reporting cadence.',
                },
                {
                  step: '02',
                  title: 'Collection & Analysis',
                  description:
                    'Multi-source collection: OSINT, blockchain data, malware samples, dark-web forums. Analysis follows structured tradecraft.',
                },
                {
                  step: '03',
                  title: 'Reporting & Brief',
                  description:
                    'Findings delivered in written reports (ICD-203 format) with optional in-person or secure video briefings.',
                },
                {
                  step: '04',
                  title: 'Action & Follow-On',
                  description:
                    'Recommendations for mitigation, referrals to authorities, or transition to Response/Resilience services.',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent flex items-center justify-center font-mono text-accent font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Hunting?</h2>
            <p className="text-lg text-muted">
              Schedule a secure briefing to discuss your threat landscape and intelligence needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Book Secure Briefing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/services">View All Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
