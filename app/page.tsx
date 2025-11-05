import { Hero } from '@/components/hero';
import { ServiceCard } from '@/components/service-card';
import { StatsShowcase } from '@/components/stats-showcase';
import { Search, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const services = [
    {
      title: 'Intelligence',
      description: 'Proactive threat hunting, OSINT, on-chain forensics, and adversary profiling. We map infrastructures, personas, and flows before they strike.',
      outcome: 'Attribution that stands up. Evidence aligned to evidentiary standards.',
      icon: Search,
      href: '/services/intelligence',
      features: [
        'OSINT & dark-web monitoring',
        'On-chain analytics & blockchain forensics',
        'Threat actor mapping & attribution',
        'Structured reporting for legal use',
      ],
    },
    {
      title: 'Response',
      description: 'When incidents hit, speed matters. DFIR, malware triage, takedown coordination, and lawful referrals to authorities through proper channels.',
      outcome: 'Rapid containment. Coordinated recovery. Admissible evidence.',
      icon: Zap,
      href: '/services/response',
      features: [
        'Digital forensics & incident response',
        'Malware analysis & reverse engineering',
        'Takedown coordination & asset recovery',
        'Law enforcement liaison (proper process)',
      ],
    },
    {
      title: 'Resilience',
      description: 'Hardened systems, secure operations, and executive protection. Memory-safe paths, namespace isolation, identity fragmentation for high-risk principals.',
      outcome: 'Defensible posture. Reduced attack surface. Operational continuity.',
      icon: ShieldCheck,
      href: '/services/resilience',
      features: [
        'Executive cyber protection (UHNWI/C-suite)',
        'Hardened infrastructure & secure enclaves',
        'Identity & operational security (OPSEC)',
        'Security audits & continuous monitoring',
      ],
    },
  ];

  return (
    <>
      <Hero />

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Pillars of Protection
            </h2>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Intelligence. Response. Resilience. A complete framework for managing
              high-stakes threats across Web3 and traditional infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Showcase */}
      <StatsShowcase />

      {/* Evidence Engine Section */}
      <section className="py-20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Evidence Engine</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Insights Feed</h3>
                <p className="text-muted">
                  Real-world case studies, threat intelligence, and operational guidance.
                  Learn from anonymized engagements and stay ahead of emerging tactics.
                </p>
                <Button asChild variant="outline">
                  <Link href="/insights">
                    Browse Insights →
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Case Snapshots</h3>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>$18M recovered via cross-chain tracing & asset freezes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>APT attribution leading to coordinated takedowns (3 jurisdictions)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">•</span>
                    <span>Executive protection: prevented targeted phishing campaign (Fortune 500 C-suite)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why SWORD When Stakes Are High
            </h2>
            <p className="text-lg text-muted">
              We blend real-world tradecraft knowledge with lawful methods and defensible
              reporting. Independent, not bound by government secrecy obligations—
              we answer to clients and applicable law.
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Lawful Cooperation</h3>
                <p className="text-sm text-muted">
                  We coordinate with authorities through proper legal channels when necessary,
                  ensuring evidence remains admissible.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Independent Posture</h3>
                <p className="text-sm text-muted">
                  No government secrecy acts or standing NDAs. Our commitments are to
                  clients, professional ethics, and the law.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-2">Defensible Methods</h3>
                <p className="text-sm text-muted">
                  Chain-of-custody, least-intrusive-means principle, and structured
                  reporting that stands up to scrutiny.
                </p>
              </div>
            </div>
            <div className="pt-8">
              <Button asChild size="lg">
                <Link href="/contact">
                  Schedule Secure Briefing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
