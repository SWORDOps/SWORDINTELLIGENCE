import { ServiceCard } from '@/components/service-card';
import { Search, Zap, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Services | SWORD Intelligence',
  description: 'Intelligence, Response, and Resilience services for Web3 and cyber threats.',
};

export default function ServicesPage() {
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
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-muted">
            Three integrated pillars covering the full lifecycle of threat management—
            from prevention to detection to recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-muted mb-6">
            Every engagement is different. We tailor our approach to your specific threat
            landscape, risk tolerance, and operational constraints.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-accent text-background font-medium hover:opacity-90 transition-opacity"
          >
            Schedule Briefing
          </a>
        </div>
      </div>
    </div>
  );
}
