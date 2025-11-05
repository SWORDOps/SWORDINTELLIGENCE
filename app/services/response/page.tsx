import { Zap, AlertTriangle, Download, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Response Services | SWORD Intelligence',
  description: 'Rapid incident response, digital forensics, malware analysis, and takedown coordination.',
};

export default function ResponsePage() {
  return (
    <div className="min-h-screen">
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
              <Zap className="w-8 h-8 text-accent" />
              <span className="text-sm font-mono text-muted uppercase tracking-wider">Response</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Rapid Containment. Coordinated Recovery.</h1>
            <p className="text-xl text-muted mb-8">
              When incidents hit, speed matters. DFIR, malware triage, takedown coordination, and
              lawful referrals to authorities through proper channels. Evidence that stands up in
              court.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Activate Response Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Response Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg border border-border bg-surface">
                <AlertTriangle className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Digital Forensics & Incident Response</h3>
                <p className="text-muted mb-4">
                  Forensically sound acquisition, timeline reconstruction, and root-cause analysis.
                  We preserve evidence while containing the threat.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Live system forensics & memory acquisition</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Timeline analysis & artifact correlation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Chain-of-custody documentation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Expert witness testimony (if required)</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Download className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Malware Analysis & Reverse Engineering</h3>
                <p className="text-muted mb-4">
                  Static and dynamic analysis of malware samples. We identify C2 infrastructure, IOCs,
                  and attribution markers.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Sandbox detonation & behavior analysis</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Disassembly & code review (IDA, Ghidra)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>IOC extraction & threat intel sharing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Custom detection rule development</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Link2 className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Takedown Coordination</h3>
                <p className="text-muted mb-4">
                  Coordinated takedowns of phishing sites, C2 infrastructure, and fraudulent domains.
                  We work with registrars, hosting providers, and law enforcement.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Abuse reporting to registrars & hosts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>DNS sinkholing & domain seizures</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Social media account suspension</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Legal process support (subpoenas, court orders)</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-lg border border-border bg-surface">
                <Zap className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-2xl font-semibold mb-4">Law Enforcement Liaison</h3>
                <p className="text-muted mb-4">
                  When cases escalate to criminal activity, we coordinate with authorities through
                  proper legal channels—via your counsel and documented requests.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Evidence packaging for LE review</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Liaison with FBI, Secret Service, Interpol</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Mutual legal assistance treaty (MLAT) support</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>Grand jury & trial support (if needed)</span>
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
            <h2 className="text-3xl font-bold">Need Immediate Response?</h2>
            <p className="text-lg text-muted">
              Contact us immediately for incident triage and engagement scoping.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Response Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
