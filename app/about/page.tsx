import { Shield, Scale, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'About | SWORD Intelligence',
  description: 'Independent private intelligence firm specializing in Web3 and cyber threats. Not affiliated with government entities.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-border bg-surface">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-mono text-muted">ABOUT SWORD INTELLIGENCE</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Independent. Lawful. Effective.
            </h1>
            <p className="text-xl text-muted">
              We are a private intelligence firm specializing in Web3 and cyber threats.
              Our mission: help clients prevent loss, hunt adversaries, and respond to
              high-stakes incidents—within the law.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Approach */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Independence Statement - Safer Variant (Recommended) */}
            <div className="p-8 rounded-lg border border-accent/30 bg-surface">
              <div className="flex items-start space-x-4 mb-6">
                <Scale className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Independence</h2>
                  <p className="text-lg leading-relaxed mb-4">
                    We are an <strong>independent private firm</strong> and{' '}
                    <strong>not subject to government secrecy obligations</strong>. We operate
                    under <strong>client confidentiality</strong>, professional ethics, and{' '}
                    <strong>applicable laws</strong>—with <strong>wide latitude within the law</strong> to pursue complex investigations and operations.
                  </p>
                  <p className="text-lg leading-relaxed mb-4">
                    While independent, we maintain <strong>NATO alignment</strong> in values and operational philosophy. We are open to lawful business globally—including from clients in Russia, China, or other jurisdictions—provided engagements comply with applicable laws and ethical standards.
                  </p>
                  <p className="text-muted">
                    <em>
                      &quot;.air.force&quot; is a personal moniker. SWORD Intelligence is not affiliated
                      with the U.S. Air Force or any government entity.
                    </em>
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Areas */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Mission Areas</h2>
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-accent/30 bg-surface">
                  <h3 className="text-xl font-semibold mb-3 text-accent">Counter-Narcotics Intelligence</h3>
                  <p className="text-muted leading-relaxed">
                    We are actively engaged in fighting the <strong>flood of synthetic opioids</strong> and precursor chemicals. This includes tracking supply chains, identifying actors in fentanyl distribution networks, and supporting law enforcement operations targeting transnational criminal organizations. Our work in this space combines blockchain forensics (crypto-funded drug operations), OSINT (dark-web marketplaces), and strategic intelligence for interdiction efforts.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Web3 & Crypto Crime</h3>
                  <p className="text-muted">
                    Investigations into DeFi exploits, rug pulls, NFT fraud, ransomware payments, and crypto-enabled money laundering. We trace assets, identify perpetrators, and coordinate asset recovery with exchanges and authorities.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Cyber Threat Intelligence</h3>
                  <p className="text-muted">
                    APT tracking, ransomware campaigns, supply-chain attacks, and espionage operations targeting critical infrastructure, financial services, and high-value individuals.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Executive & UHNWI Protection</h3>
                  <p className="text-muted">
                    Comprehensive cyber protection programs for C-suite executives, family offices, and ultra-high-net-worth individuals facing elevated threat profiles.
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Capabilities */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Operational Capabilities</h2>
              <div className="p-8 rounded-lg border border-accent/30 bg-surface space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent flex items-center justify-center font-mono text-accent font-bold text-xl">
                    UK
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Global Rapid Response</h3>
                    <p className="text-muted leading-relaxed mb-3">
                      <strong>Based in the United Kingdom</strong> with the ability to deploy globally on short notice. I can travel to nearly anywhere within <strong>24 hours</strong>, depending on urgency and operational requirements.
                    </p>
                    <p className="text-muted leading-relaxed">
                      For critical incidents requiring immediate on-site response, all transport options are available—including <strong>private jet charter</strong>—to ensure I arrive when and where you need support.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted">
                    <strong>Response Philosophy:</strong> High-stakes situations often require physical presence—whether it's coordinating with local authorities, conducting on-site forensics, or providing face-to-face briefings to leadership. I prioritize flexibility and speed to meet client needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Market Access */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Strategic Market Access & Technical Intelligence</h2>
              <div className="space-y-6">
                <div className="p-8 rounded-lg border border-accent/30 bg-surface">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent flex items-center justify-center font-mono text-accent font-bold text-sm">
                      深圳
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Shenzhen Supply Chain Intelligence</h3>
                      <p className="text-muted leading-relaxed mb-3">
                        <strong>Full access</strong> to the Shenzhen electronics and manufacturing ecosystem—the world's hardware capital. This provides unique capability for:
                      </p>
                      <ul className="space-y-2 text-muted text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Counterfeit detection</strong>: Identify fake components, gray-market devices, and supply chain compromise</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Procurement intelligence</strong>: Track what threat actors are buying (surveillance tech, crypto mining hardware, IoT botnets)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Hardware implant analysis</strong>: Source and analyze suspected malicious modifications or backdoored devices</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Supply chain mapping</strong>: Trace components used in attacks back to manufacturers and distributors</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-lg border border-border bg-surface">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent/10 border border-accent flex items-center justify-center font-mono text-accent font-bold text-sm">
                      RU
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Russian Technology Access & Intelligence</h3>
                      <p className="text-muted leading-relaxed mb-3">
                        <strong>Full access</strong> to Russian technology markets and computing resources for legitimate research, analysis, and threat intelligence purposes. Available capabilities include:
                      </p>
                      <ul className="space-y-2 text-muted text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Advanced computing resources</strong>: Access to Russian-developed computing systems, AI accelerators, and high-performance platforms for testing and evaluation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Technical acquisition & analysis</strong>: Procurement of hardware and software for reverse engineering, vulnerability assessment, and capability analysis</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Market intelligence</strong>: Monitor dual-use technology developments, emerging capabilities, and gray-market distribution channels</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-accent">→</span>
                          <span><strong>Threat actor procurement patterns</strong>: Track what adversaries are acquiring and how they're circumventing controls</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-4 rounded bg-background border border-accent/20">
                        <p className="text-xs text-muted mb-2">
                          <strong>Compliance & Client Vetting:</strong> All engagements comply with applicable UK and U.S. law. This capability is available exclusively for legitimate research, defensive security analysis, law enforcement support, and threat intelligence purposes.
                        </p>
                        <p className="text-xs text-muted">
                          <strong>Clients undergo rigorous background checks.</strong> We do not facilitate sanctions evasion, proliferation, or unlawful activity. Engagements involving controlled technology are conducted in coordination with legal counsel and documented for compliance. Premium pricing reflects sourcing complexity and legal risk management.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="font-semibold mb-3">Why This Matters</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    Many threat actors operate in gray and black markets that Western firms struggle to access or understand. Our ability to gather intelligence from these ecosystems—while remaining fully compliant with applicable laws—provides clients with visibility into adversary capabilities, procurement patterns, and emerging threats that would otherwise remain opaque.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative: Assertive Variant (Optional - Comment out if using safer) */}
            {/*
            <div className="p-8 rounded-lg border border-accent/30 bg-surface">
              <div className="flex items-start space-x-4 mb-6">
                <Scale className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Independence</h2>
                  <p className="text-lg leading-relaxed">
                    We are independent. We are <strong>not bound by government secrecy acts</strong> or
                    standing government NDAs. Our commitments are to clients and the law.
                  </p>
                </div>
              </div>
            </div>
            */}

            {/* Lawful Cooperation */}
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Shield className="w-8 h-8 text-accent mr-3" />
                Lawful Cooperation
              </h2>
              <div className="bg-surface border border-border rounded-lg p-8 space-y-4">
                <p className="text-lg leading-relaxed">
                  We work <strong>within the law</strong>. Where matters escalate—fraud, coercion,
                  threats—we <strong>coordinate with competent authorities</strong> through{' '}
                  <strong>proper legal processes</strong> (e.g., client-authorized referrals,
                  counsel-managed disclosures, or responding to valid legal orders).
                </p>
                <p className="text-lg leading-relaxed">
                  Our role is to surface evidence that <strong>stands up</strong>, not to overreach.
                  When cases involve public-safety risk or criminal activity, we work with authorities
                  through the proper legal channels—typically via your counsel and documented
                  requests—so evidence remains admissible and your rights protected.
                </p>
              </div>
            </div>

            {/* Our Approach */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Our Approach</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Lawful Methodologies</h3>
                  <p className="text-muted">
                    We apply lawful methodologies, strict chain-of-custody, and a
                    least-intrusive-means principle. Every action is documented and defensible.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Evidentiary Standards</h3>
                  <p className="text-muted">
                    Our reporting aligns to ICD-203 analytic standards and legal requirements.
                    Attribution, timelines, and technical findings are structured for scrutiny.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Client Confidentiality</h3>
                  <p className="text-muted">
                    We protect client information through strict access controls, encryption,
                    and need-to-know principles. Engagements remain confidential unless disclosure
                    is legally required or authorized.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-border bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Independent Judgment</h3>
                  <p className="text-muted">
                    We provide objective analysis without political or commercial bias. Our
                    assessments reflect what the evidence shows—not what anyone wants to hear.
                  </p>
                </div>
                <div className="p-6 rounded-lg border border-accent/30 bg-surface">
                  <h3 className="text-xl font-semibold mb-3">Rigorous Client Vetting</h3>
                  <p className="text-muted">
                    All prospective clients undergo background checks and conflict screening. We verify
                    identity, business legitimacy, and ensure engagements comply with sanctions, export
                    controls, and anti-money laundering requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Client Vetting Process */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Client Vetting & Compliance</h2>
              <div className="p-8 rounded-lg border border-accent/30 bg-surface space-y-6">
                <p className="text-lg leading-relaxed">
                  Given the sensitive nature of our work—particularly access to strategic markets and
                  dual-use technologies—we maintain <strong>rigorous client vetting procedures</strong> to
                  ensure compliance with all applicable laws and prevent misuse of our services.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Vetting Process</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded border border-border bg-background">
                      <h4 className="font-semibold mb-2 text-sm">Deep Background Investigation</h4>
                      <p className="text-sm text-muted">
                        Multi-source intelligence checks drawing on commercial databases, government sources,
                        and partner networks across multiple jurisdictions. We find the truth—shell companies,
                        complex structures, and operational security are expected in this industry.
                      </p>
                    </div>
                    <div className="p-4 rounded border border-border bg-background">
                      <h4 className="font-semibold mb-2 text-sm">Sanctions & Watchlist Screening</h4>
                      <p className="text-sm text-muted">
                        Comprehensive screening against OFAC SDN, UK HM Treasury, EU sanctions, BIS denied
                        parties, and other relevant control lists. Coordination with appropriate authorities
                        where required.
                      </p>
                    </div>
                    <div className="p-4 rounded border border-border bg-background">
                      <h4 className="font-semibold mb-2 text-sm">Ultimate Beneficial Owner Analysis</h4>
                      <p className="text-sm text-muted">
                        Full ownership mapping through corporate veils, nominee directors, and offshore
                        structures. We assess true control and intent, not surface-level registrations.
                      </p>
                    </div>
                    <div className="p-4 rounded border border-border bg-background">
                      <h4 className="font-semibold mb-2 text-sm">End-Use & Intent Assessment</h4>
                      <p className="text-sm text-muted">
                        Intelligence-driven evaluation of stated use case against known patterns, technical
                        indicators, and geopolitical context. We assess likelihood of diversion to hostile
                        nation-state actors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded bg-background border border-accent/30">
                  <h4 className="font-semibold mb-3 text-accent">Threat Actor Protocol</h4>
                  <p className="text-sm text-muted leading-relaxed">
                    <strong>Anyone suspected of attempting to acquire technology on behalf of hostile
                    nation-state actors or for proliferation purposes will be treated as a threat actor.</strong> This
                    includes intelligence collection on the requester, documentation of TTPs, and coordination
                    with relevant counterintelligence and law enforcement authorities across allied jurisdictions.
                    We will not facilitate adversary capability development.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted">
                    Our vetting draws on relationships with government and intelligence community partners—we
                    maintain ongoing coordination with relevant authorities to ensure our operations support
                    rather than undermine national security interests. <strong>We reserve the right to decline
                    any engagement</strong> that presents unacceptable risk, violates sanctions, or lacks
                    defensible justification.
                  </p>
                </div>
              </div>
            </div>

            {/* Capabilities Overview */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Capabilities</h2>
              <div className="bg-surface border border-border rounded-lg p-8">
                <p className="text-lg leading-relaxed mb-6">
                  Hardened kernels, memory-safe paths, <strong>namespace isolation for image
                  processing</strong>; DFIR, on-chain analytics, OSINT, malware triage, dark-web
                  monitoring, takedown coordination; plus <strong>established liaison routes</strong> to
                  the right people when speed matters.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {[
                    'Digital Forensics & Incident Response',
                    'Blockchain Forensics & Tracing',
                    'OSINT & Dark Web Intelligence',
                    'Malware Analysis & Reverse Engineering',
                    'Threat Actor Attribution',
                    'Executive Cyber Protection',
                    'Secure Infrastructure Design',
                    'Takedown Coordination',
                    'Law Enforcement Liaison',
                  ].map((capability) => (
                    <div
                      key={capability}
                      className="flex items-start space-x-2 p-3 rounded border border-border"
                    >
                      <span className="text-accent">✓</span>
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team & Expertise (Placeholder) */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Users className="w-8 h-8 text-accent mr-3" />
                Team & Expertise
              </h2>
              <div className="bg-surface border border-border rounded-lg p-8">
                <p className="text-lg leading-relaxed mb-4">
                  Our team brings experience from cybersecurity, intelligence analysis, digital
                  forensics, and law enforcement liaison roles. We combine technical depth with
                  operational awareness—understanding both the &quot;how&quot; and the &quot;why&quot; behind
                  adversary behavior.
                </p>
                <p className="text-muted">
                  Specific backgrounds span: federal law enforcement cyber units, blockchain
                  forensics firms, UHNWI security programs, and security research. Continuous
                  training ensures we stay ahead of emerging techniques in Web3 and cyber domains.
                </p>
              </div>
            </div>

            {/* Certifications & Standards */}
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Award className="w-8 h-8 text-accent mr-3" />
                Standards & Compliance
              </h2>
              <div className="bg-surface border border-border rounded-lg p-8 space-y-4">
                <p className="text-lg">
                  We align our work to recognized standards and maintain rigorous internal controls:
                </p>
                <ul className="space-y-2 text-muted">
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>ICD-203</strong>: Analytic standards for structured intelligence
                      reporting
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>NIST Guidelines</strong>: Digital forensics, incident response, and
                      cybersecurity frameworks
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Chain-of-Custody</strong>: Tamper-evident logging and evidence
                      handling procedures
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-accent">→</span>
                    <span>
                      <strong>Privacy & Data Protection</strong>: U.S./Iowa baseline with opt-out
                      mechanisms; switchable to stricter regimes
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Discuss Your Needs?</h2>
              <p className="text-muted mb-6">
                Schedule a secure briefing to explore how we can help protect your operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/contact">Book Secure Briefing</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/methods">Methods & Compliance</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
