import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Resilience Services | SWORD Intelligence',
  description: 'Executive protection, hardened infrastructure, and continuous security operations.',
};

export default function ResiliencePage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldCheck className="w-8 h-8 text-accent" />
              <span className="text-sm font-mono text-muted uppercase tracking-wider">Resilience</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Defensible Posture. Operational Continuity.</h1>
            <p className="text-xl text-muted mb-8">
              Hardened systems, secure operations, and executive protection. Memory-safe paths,
              namespace isolation, identity fragmentation for high-risk principals. Reduce attack
              surface before adversaries strike.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Assess Your Posture</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Resilience Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border border-border bg-surface">
                <Eye className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Executive Cyber Protection</h3>
                <p className="text-muted mb-4">
                  Tailored protection for UHNWIs, C-suite executives, and high-risk individuals.
                  Identity fragmentation, secure device enclaves, and continuous threat monitoring.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Identity fragmentation & OPSEC tradecraft</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Hardened devices (secure boot, full-disk encryption)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>PII exposure assessment & remediation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Family member digital hygiene training</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Server className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Hardened Infrastructure</h3>
                <p className="text-muted mb-4">
                  Secure-by-design systems with memory-safe paths, namespace isolation for image
                  processing, and defense-in-depth architecture.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Kernel hardening & secure boot chains</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Container & VM isolation (namespace, cgroup limits)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Zero-trust network segmentation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Secure image processing pipelines</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Lock className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Operational Security (OPSEC)</h3>
                <p className="text-muted mb-4">
                  Comprehensive OPSEC assessments and training. We identify information leakage
                  vectors and implement countermeasures.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>OPSEC audits (PII exposure, metadata leaks)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Secure communications (Signal, Matrix, PGP)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Travel security & hostile environment prep</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Social engineering resistance training</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <ShieldCheck className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Security Audits & Monitoring</h3>
                <p className="text-muted mb-4">
                  Continuous security posture monitoring, penetration testing, and compliance
                  validation. Proactive threat hunting on your infrastructure.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Penetration testing (web, network, physical)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Continuous vulnerability management</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>SIEM deployment & threat hunting</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Compliance audits (SOC2, ISO 27001, NIST CSF)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Build a Defensible Posture</h2>
            <p className="text-lg text-muted">
              Schedule a security assessment to identify gaps and prioritize hardening efforts.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Request Assessment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
