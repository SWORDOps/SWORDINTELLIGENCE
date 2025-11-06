/**
 * Advanced Threat Intelligence Feed
 *
 * Production-quality threat intelligence aggregation and analysis system.
 * Demonstrates real OSINT techniques and intelligence tradecraft.
 */

import crypto from 'crypto';

/**
 * Threat severity levels
 */
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Threat types
 */
export type ThreatType =
  | 'malware'
  | 'ransomware'
  | 'phishing'
  | 'apt'
  | 'data_breach'
  | 'vulnerability'
  | 'ddos'
  | 'supply_chain'
  | 'insider_threat'
  | 'social_engineering'
  | 'narcotics_trafficking';

/**
 * MITRE ATT&CK tactics
 */
export type MitreTactic =
  | 'initial_access'
  | 'execution'
  | 'persistence'
  | 'privilege_escalation'
  | 'defense_evasion'
  | 'credential_access'
  | 'discovery'
  | 'lateral_movement'
  | 'collection'
  | 'exfiltration'
  | 'command_and_control'
  | 'impact';

/**
 * Threat actor sophistication
 */
export type ActorSophistication = 'nation_state' | 'organized_crime' | 'hacktivist' | 'script_kiddie' | 'insider';

/**
 * IOC (Indicator of Compromise) types
 */
export type IOCType = 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file' | 'registry' | 'mutex' | 'crypto_wallet' | 'onion';

/**
 * Threat Intelligence Entry
 */
export interface ThreatIntelligence {
  id: string;
  timestamp: Date;

  // Classification
  title: string;
  description: string;
  severity: ThreatSeverity;
  type: ThreatType;
  confidence: number; // 0-100

  // Attribution
  threatActor?: string;
  actorGroup?: string;
  actorSophistication?: ActorSophistication;
  attribution: {
    confidence: number;
    sources: string[];
  };

  // MITRE ATT&CK mapping
  mitreTactics: MitreTactic[];
  mitreTechniques: string[]; // e.g., T1566.001

  // Indicators of Compromise
  iocs: IOC[];

  // Targeting
  targetedSectors: string[];
  targetedCountries: string[];
  targetedTechnologies: string[];

  // Timeline
  firstSeen: Date;
  lastSeen: Date;
  active: boolean;

  // Intelligence sources
  sources: ThreatSource[];
  sourceCount: number;

  // Impact assessment
  impact: {
    financialLoss?: string;
    affectedOrganizations?: number;
    dataExfiltrated?: string;
    downtime?: string;
  };

  // Remediation
  remediation?: string[];
  cveIds?: string[];

  // Metadata
  tags: string[];
  tlp: 'red' | 'amber' | 'green' | 'white';
  references: string[];
}

/**
 * Indicator of Compromise
 */
export interface IOC {
  type: IOCType;
  value: string;
  description?: string;
  firstSeen: Date;
  lastSeen: Date;
  malicious: boolean;
  confidence: number;
}

/**
 * Threat source
 */
export interface ThreatSource {
  name: string;
  type: 'osint' | 'commercial' | 'government' | 'internal' | 'community';
  url?: string;
  reliability: number; // 0-100
  timestamp: Date;
}

/**
 * Threat actor profile
 */
export interface ThreatActorProfile {
  id: string;
  name: string;
  aliases: string[];
  sophistication: ActorSophistication;
  motivation: string[];
  sponsored: boolean;
  sponsorCountry?: string;

  // Capabilities
  capabilities: string[];
  preferredTactics: MitreTactic[];
  preferredTargets: string[];

  // Activity
  firstObserved: Date;
  lastActivity: Date;
  campaignCount: number;
  victimCount: number;

  // Attribution confidence
  attributionConfidence: number;

  // Related threats
  relatedThreats: string[];
}

/**
 * Threat Intelligence Feed Store
 */
class ThreatIntelligenceFeed {
  private threats: Map<string, ThreatIntelligence> = new Map();
  private actors: Map<string, ThreatActorProfile> = new Map();
  private iocIndex: Map<string, Set<string>> = new Map(); // IOC value -> threat IDs

  constructor() {
    // Seed with sample data
    this.seedData();
  }

  /**
   * Add threat intelligence
   */
  addThreat(threat: ThreatIntelligence): void {
    this.threats.set(threat.id, threat);

    // Index IOCs
    for (const ioc of threat.iocs) {
      if (!this.iocIndex.has(ioc.value)) {
        this.iocIndex.set(ioc.value, new Set());
      }
      this.iocIndex.get(ioc.value)!.add(threat.id);
    }
  }

  /**
   * Get threat by ID
   */
  getThreat(id: string): ThreatIntelligence | undefined {
    return this.threats.get(id);
  }

  /**
   * Search threats by IOC
   */
  searchByIOC(iocValue: string): ThreatIntelligence[] {
    const threatIds = this.iocIndex.get(iocValue);
    if (!threatIds) return [];

    return Array.from(threatIds)
      .map(id => this.threats.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get recent threats
   */
  getRecentThreats(limit: number = 50): ThreatIntelligence[] {
    return Array.from(this.threats.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Filter threats
   */
  filterThreats(filters: {
    severity?: ThreatSeverity;
    type?: ThreatType;
    actor?: string;
    active?: boolean;
    minConfidence?: number;
    tags?: string[];
  }): ThreatIntelligence[] {
    let results = Array.from(this.threats.values());

    if (filters.severity) {
      results = results.filter(t => t.severity === filters.severity);
    }

    if (filters.type) {
      results = results.filter(t => t.type === filters.type);
    }

    if (filters.actor) {
      results = results.filter(t =>
        t.threatActor?.toLowerCase().includes(filters.actor!.toLowerCase()) ||
        t.actorGroup?.toLowerCase().includes(filters.actor!.toLowerCase())
      );
    }

    if (filters.active !== undefined) {
      results = results.filter(t => t.active === filters.active);
    }

    if (filters.minConfidence) {
      results = results.filter(t => t.confidence >= filters.minConfidence!);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      );
    }

    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get threat statistics
   */
  getStats() {
    const threats = Array.from(this.threats.values());

    const bySeverity: Record<ThreatSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const byType: Partial<Record<ThreatType, number>> = {};

    for (const threat of threats) {
      bySeverity[threat.severity]++;
      byType[threat.type] = (byType[threat.type] || 0) + 1;
    }

    return {
      total: threats.length,
      active: threats.filter(t => t.active).length,
      bySeverity,
      byType,
      totalIOCs: Array.from(this.iocIndex.keys()).length,
      threatActors: this.actors.size,
    };
  }

  /**
   * Add threat actor profile
   */
  addActor(actor: ThreatActorProfile): void {
    this.actors.set(actor.id, actor);
  }

  /**
   * Get threat actor
   */
  getActor(id: string): ThreatActorProfile | undefined {
    return this.actors.get(id);
  }

  /**
   * Get all actors
   */
  getAllActors(): ThreatActorProfile[] {
    return Array.from(this.actors.values());
  }

  /**
   * Seed with realistic threat data
   */
  private seedData(): void {
    // APT28 (Fancy Bear) - Russian nation-state actor
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      title: 'APT28 Phishing Campaign Targeting NATO Members',
      description:
        'Russian state-sponsored APT28 group launching sophisticated spear-phishing campaign against NATO military personnel. ' +
        'Campaign uses zero-day vulnerabilities in Microsoft Office to deliver custom malware.',
      severity: 'critical',
      type: 'apt',
      confidence: 95,
      threatActor: 'APT28',
      actorGroup: 'Fancy Bear',
      actorSophistication: 'nation_state',
      attribution: {
        confidence: 95,
        sources: ['MITRE', 'CrowdStrike', 'FireEye'],
      },
      mitreTactics: ['initial_access', 'execution', 'persistence', 'credential_access'],
      mitreTechniques: ['T1566.001', 'T1203', 'T1547.001', 'T1003'],
      iocs: [
        {
          type: 'domain',
          value: 'nato-defense-update.com',
          description: 'Phishing domain mimicking NATO',
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 98,
        },
        {
          type: 'ip',
          value: '45.142.212.61',
          description: 'C2 server',
          firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 95,
        },
        {
          type: 'hash',
          value: '7c3f5b8d2e1a9f4e6d3c8b5a1e7f9d2c',
          description: 'Malicious Office document hash',
          firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 100,
        },
      ],
      targetedSectors: ['Military', 'Government', 'Defense Contractors'],
      targetedCountries: ['United States', 'United Kingdom', 'Poland', 'Ukraine'],
      targetedTechnologies: ['Microsoft Office', 'Windows', 'Outlook'],
      firstSeen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(),
      active: true,
      sources: [
        {
          name: 'MITRE ATT&CK',
          type: 'osint',
          url: 'https://attack.mitre.org',
          reliability: 98,
          timestamp: new Date(),
        },
        {
          name: 'CrowdStrike',
          type: 'commercial',
          reliability: 95,
          timestamp: new Date(),
        },
      ],
      sourceCount: 2,
      impact: {
        affectedOrganizations: 47,
        dataExfiltrated: 'Classified military communications',
      },
      remediation: [
        'Block IOCs at network perimeter',
        'Enable Office macro blocking',
        'Deploy endpoint detection',
        'Conduct security awareness training',
      ],
      tags: ['APT', 'Nation-State', 'Russia', 'Phishing', 'Zero-Day'],
      tlp: 'amber',
      references: [
        'https://attack.mitre.org/groups/G0007/',
        'https://www.crowdstrike.com/adversaries/fancy-bear/',
      ],
    });

    // Lazarus Group - North Korean ransomware
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      title: 'Lazarus Group Deploying WannaCry 2.0 Ransomware',
      description:
        'North Korean state-sponsored Lazarus Group deploying new variant of WannaCry ransomware targeting cryptocurrency exchanges and financial institutions. ' +
        'Leveraging EternalBlue exploit with improved encryption and wiper functionality.',
      severity: 'critical',
      type: 'ransomware',
      confidence: 90,
      threatActor: 'Lazarus Group',
      actorGroup: 'HIDDEN COBRA',
      actorSophistication: 'nation_state',
      attribution: {
        confidence: 88,
        sources: ['US-CERT', 'Kaspersky', 'Symantec'],
      },
      mitreTactics: ['initial_access', 'execution', 'impact'],
      mitreTechniques: ['T1190', 'T1486', 'T1490'],
      iocs: [
        {
          type: 'hash',
          value: 'a1b2c3d4e5f67890abcdef1234567890',
          description: 'WannaCry 2.0 payload hash',
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 100,
        },
        {
          type: 'ip',
          value: '175.45.176.2',
          description: 'Payment server',
          firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 92,
        },
      ],
      targetedSectors: ['Financial Services', 'Cryptocurrency', 'Healthcare'],
      targetedCountries: ['South Korea', 'United States', 'Japan', 'Singapore'],
      targetedTechnologies: ['Windows Server', 'SMB', 'RDP'],
      firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'US-CERT',
          type: 'government',
          reliability: 100,
          timestamp: new Date(),
        },
      ],
      sourceCount: 1,
      impact: {
        financialLoss: '$12M - $45M estimated',
        affectedOrganizations: 23,
        downtime: '72+ hours average',
      },
      remediation: [
        'Patch MS17-010 immediately',
        'Disable SMBv1',
        'Isolate infected systems',
        'Restore from offline backups',
      ],
      cveIds: ['CVE-2017-0144', 'CVE-2017-0145'],
      tags: ['Ransomware', 'Nation-State', 'North Korea', 'Cryptocurrency', 'EternalBlue'],
      tlp: 'amber',
      references: ['https://www.us-cert.gov/ncas/alerts/TA17-132A'],
    });

    // Add more threats for demo...
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      title: 'Emotet Botnet Resurgence with Banking Trojan Payloads',
      description:
        'Emotet botnet infrastructure reactivated after 10-month dormancy. New campaign delivering TrickBot and Qbot banking trojans via malspam.',
      severity: 'high',
      type: 'malware',
      confidence: 92,
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 85,
        sources: ['CISA', 'Proofpoint'],
      },
      mitreTactics: ['initial_access', 'execution', 'persistence', 'collection'],
      mitreTechniques: ['T1566.001', 'T1204.002', 'T1547.001', 'T1114'],
      iocs: [
        {
          type: 'domain',
          value: 'invoice-payment-2024.net',
          description: 'Malspam distributor',
          firstSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 95,
        },
      ],
      targetedSectors: ['Finance', 'Healthcare', 'Manufacturing'],
      targetedCountries: ['United States', 'Germany', 'United Kingdom'],
      targetedTechnologies: ['Email', 'Windows', 'Office Macros'],
      firstSeen: new Date(Date.now() - 48 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'CISA',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
      ],
      sourceCount: 1,
      impact: {
        affectedOrganizations: 156,
        financialLoss: '$2.5M+',
      },
      remediation: [
        'Block IOCs',
        'Disable macros',
        'Email filtering',
        'User training',
      ],
      tags: ['Emotet', 'Banking Trojan', 'Botnet', 'Malspam'],
      tlp: 'white',
      references: [],
    });

    // ============================================================
    // NARCOTICS TRAFFICKING INTELLIGENCE
    // ============================================================

    // AlphaBay 2.0 - Dark web marketplace
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      title: 'AlphaBay 2.0 Marketplace Facilitating Ultra-Potent Opioid Sales',
      description:
        'Resurrected AlphaBay dark web marketplace identified as primary distribution hub for carfentanil and novel fentanyl analogues. ' +
        'Marketplace processes $2.5M+ daily in Monero transactions, facilitating international trafficking of ultra-potent synthetic opioids. ' +
        'Intelligence indicates Chinese precursor suppliers directly vending to US-based distributors. OPSEC includes PGP encryption, ' +
        'multisig escrow, and decoy parcel techniques.',
      severity: 'critical',
      type: 'narcotics_trafficking',
      confidence: 95,
      threatActor: 'DeSnake',
      actorGroup: 'AlphaBay Admin Team',
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 88,
        sources: ['DEA', 'FBI Cyber Division', 'EUROPOL', 'Blockchain Analytics'],
      },
      mitreTactics: ['initial_access', 'command_and_control', 'exfiltration'],
      mitreTechniques: ['T1071.001', 'T1573', 'T1048.002'],
      iocs: [
        {
          type: 'onion',
          value: 'alphabay7dxdoq7irvjfsd43iabz4hjfdjwzvjpjuhcdjqfkzpfzfgqd.onion',
          description: 'AlphaBay 2.0 v3 onion address',
          firstSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 100,
        },
        {
          type: 'crypto_wallet',
          value: '48QLJHLrA9aVQWNvDqZqN3KGF3j3h8LbZLKFRxRY5kFE3HqQpWJxK9VQMqRxZiYBNvDqZqN3KGF3j3h8LbZLKF',
          description: 'Primary Monero escrow wallet',
          firstSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000),
          malicious: true,
          confidence: 92,
        },
        {
          type: 'crypto_wallet',
          value: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
          description: 'Bitcoin tumbler address',
          firstSeen: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(),
          malicious: true,
          confidence: 87,
        },
        {
          type: 'email',
          value: 'desnake_admin@protonmail.com',
          description: 'Administrator contact (PGP: 0x7A8B9C1D)',
          firstSeen: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 75,
        },
      ],
      targetedSectors: ['Public Health', 'Law Enforcement', 'Border Security'],
      targetedCountries: ['United States', 'Canada', 'United Kingdom', 'Australia'],
      targetedTechnologies: ['Tor', 'Monero', 'PGP', 'Tails OS'],
      firstSeen: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'DEA Cyber Investigations',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
        {
          name: 'FBI Dark Web Task Force',
          type: 'government',
          reliability: 100,
          timestamp: new Date(),
        },
        {
          name: 'Chainalysis',
          type: 'commercial',
          url: 'https://www.chainalysis.com',
          reliability: 93,
          timestamp: new Date(),
        },
      ],
      sourceCount: 3,
      impact: {
        financialLoss: '$900M+ annual transaction volume',
        affectedOrganizations: 15000,
        dataExfiltrated: 'Vendor PGP keys, customer addresses, transaction histories',
      },
      remediation: [
        'Monitor Tor exit nodes for marketplace access patterns',
        'Blockchain analysis to trace Monero conversions',
        'Controlled delivery operations',
        'International law enforcement coordination',
        'Chemical precursor supply chain interdiction',
      ],
      tags: [
        'Dark Web',
        'Fentanyl',
        'Carfentanil',
        'Cryptocurrency',
        'AlphaBay',
        'Monero',
        'Opioids',
        'Chinese Precursors',
      ],
      tlp: 'red',
      references: [
        'https://www.dea.gov/press-releases/2024/dark-web-marketplace',
        'https://www.europol.europa.eu/operations-services-and-innovation/operations/alphabay-takedown',
      ],
    });

    // Carfentanil trafficking network
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
      title: 'International Carfentanil Network: Chinese Suppliers to US Distribution',
      description:
        'Sophisticated carfentanil trafficking operation linking Chinese chemical manufacturers to US-based distribution cells. ' +
        'Network uses dead drops, encrypted communications (Signal, Wickr), and cryptocurrency payments. Carfentanil is 10,000x more potent ' +
        'than morphine and 100x more potent than fentanyl. Seized packages indicate masking as "research chemicals" and "industrial solvents." ' +
        'Intelligence suggests 2.5kg seized in Phoenix represents enough carfentanil for 100 million lethal doses.',
      severity: 'critical',
      type: 'narcotics_trafficking',
      confidence: 93,
      threatActor: 'Operation Dragon Fang Task Force',
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 90,
        sources: ['DEA', 'HSI', 'CBP', 'Chinese MPS'],
      },
      mitreTactics: ['initial_access', 'execution', 'command_and_control'],
      mitreTechniques: ['T1071.001', 'T1573.002', 'T1132.001'],
      iocs: [
        {
          type: 'domain',
          value: 'chemresearch-supply.cn',
          description: 'Chinese precursor supplier front website',
          firstSeen: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 95,
        },
        {
          type: 'crypto_wallet',
          value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          description: 'Bitcoin payment address for bulk orders',
          firstSeen: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 100,
        },
        {
          type: 'email',
          value: 'sales@chemresearch-supply.cn',
          description: 'Customer service email for wholesale orders',
          firstSeen: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 98,
        },
        {
          type: 'ip',
          value: '218.75.102.198',
          description: 'Server hosting in Guangdong Province',
          firstSeen: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 92,
        },
      ],
      targetedSectors: ['Public Health', 'Emergency Services', 'Border Security'],
      targetedCountries: ['United States', 'Mexico', 'Canada'],
      targetedTechnologies: ['Encrypted Messaging', 'Cryptocurrency', 'Parcel Services'],
      firstSeen: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'DEA Special Operations Division',
          type: 'government',
          reliability: 100,
          timestamp: new Date(),
        },
        {
          name: 'Homeland Security Investigations',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
      ],
      sourceCount: 2,
      impact: {
        financialLoss: '$45M+ in seized product value',
        affectedOrganizations: 87,
        dataExfiltrated: 'Supplier lists, shipping manifests, customer databases',
      },
      remediation: [
        'Enhanced screening of Chinese parcels',
        'Chemical precursor import controls',
        'Cryptocurrency transaction monitoring',
        'International supplier interdiction',
        'Fentanyl test strip distribution to first responders',
      ],
      tags: [
        'Carfentanil',
        'Fentanyl Analogue',
        'China',
        'Chemical Precursors',
        'Cryptocurrency',
        'Public Health Crisis',
        'Ultra-Potent Opioids',
      ],
      tlp: 'red',
      references: [
        'https://www.dea.gov/press-releases/2024/carfentanil-seizure',
        'https://www.ice.gov/news/releases/international-operation-targets-carfentanil',
      ],
    });

    // Sinaloa Cartel cryptocurrency laundering
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
      title: 'Sinaloa Cartel Cryptocurrency Laundering Network for Fentanyl Proceeds',
      description:
        'Cártel de Sinaloa operating sophisticated cryptocurrency laundering infrastructure to clean fentanyl trafficking proceeds. ' +
        'Network leverages chain-hopping (BTC → XMR → BTC), mixing services, and Chinese underground banking connections. ' +
        'Intelligence indicates $180M+ laundered quarterly through this infrastructure. Key figures include "El Contador" (The Accountant), ' +
        'coordinating between cartel leadership and crypto brokers in Dubai and Hong Kong.',
      severity: 'high',
      type: 'narcotics_trafficking',
      confidence: 88,
      threatActor: 'Cártel de Sinaloa',
      actorGroup: 'Los Chapitos Faction',
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 92,
        sources: ['DEA', 'FinCEN', 'IRS-CI', 'Treasury OFAC'],
      },
      mitreTactics: ['command_and_control', 'exfiltration'],
      mitreTechniques: ['T1573', 'T1048.002', 'T1041'],
      iocs: [
        {
          type: 'crypto_wallet',
          value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          description: 'Primary Bitcoin collection wallet',
          firstSeen: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 94,
        },
        {
          type: 'crypto_wallet',
          value: '4AdUndXHHZ6cfufTMvppY6JwXNouMBzSkbLYfpAV5Usx3skxNgYeYTRj5UzqtReoS44qo9mtmXCqY45DJ852K5Jv2684Rge',
          description: 'Monero intermediate wallet (chain-hopping)',
          firstSeen: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 48 * 60 * 60 * 1000),
          malicious: true,
          confidence: 89,
        },
        {
          type: 'domain',
          value: 'crypto-consulting-hk.com',
          description: 'Hong Kong crypto broker front company',
          firstSeen: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 86,
        },
        {
          type: 'email',
          value: 'el.contador.ops@protonmail.com',
          description: 'Financial coordinator contact',
          firstSeen: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 78,
        },
      ],
      targetedSectors: ['Financial Services', 'Cryptocurrency Exchanges', 'Banking'],
      targetedCountries: ['Mexico', 'United States', 'Hong Kong', 'United Arab Emirates'],
      targetedTechnologies: ['Bitcoin', 'Monero', 'ChipMixer', 'Bisq', 'LocalBitcoins'],
      firstSeen: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'FinCEN',
          type: 'government',
          reliability: 100,
          timestamp: new Date(),
        },
        {
          name: 'IRS Criminal Investigation',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
        {
          name: 'Elliptic',
          type: 'commercial',
          url: 'https://www.elliptic.co',
          reliability: 90,
          timestamp: new Date(),
        },
      ],
      sourceCount: 3,
      impact: {
        financialLoss: '$720M+ annual laundering volume',
        affectedOrganizations: 34,
        dataExfiltrated: 'Exchange KYC records, wallet addresses, transaction graphs',
      },
      remediation: [
        'Cryptocurrency exchange compliance audits',
        'Blockchain forensics and wallet clustering',
        'OFAC sanctions enforcement',
        'International asset seizure coordination',
        'Chinese underground banking disruption',
      ],
      tags: [
        'Money Laundering',
        'Cryptocurrency',
        'Sinaloa Cartel',
        'Fentanyl',
        'Bitcoin',
        'Monero',
        'Underground Banking',
        'Los Chapitos',
      ],
      tlp: 'amber',
      references: [
        'https://www.treasury.gov/press-center/press-releases/sanctions-sinaloa-cartel',
        'https://www.dea.gov/press-releases/2024/cryptocurrency-laundering-network',
      ],
    });

    // Dark web vendor network
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      title: 'Dark Web Super-Vendor Network: "Blue Magic" Ultra-Potent Fentanyl Distribution',
      description:
        'Multi-marketplace dark web vendor collective operating under brand "Blue Magic" distributing novel fentanyl analogues ' +
        '(fluorofentanyl, benzodioxole fentanyl, cyclopropyl fentanyl). Network spans AlphaBay 2.0, Tor Market, and Archetyp. ' +
        'Vendors maintain 99.8% positive feedback across 47,000+ transactions. OPSEC includes: steganographic order forms, ' +
        'PGP-encrypted shipping labels, vacuum-sealed Mylar, decoy packages with legitimate items. Recent seizures show pressed pills ' +
        'marked "M30" containing pure fentanyl analogues with no oxycodone.',
      severity: 'critical',
      type: 'narcotics_trafficking',
      confidence: 91,
      threatActor: 'Blue Magic Vendor Collective',
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 85,
        sources: ['FBI', 'DEA', 'USPS Inspection Service'],
      },
      mitreTactics: ['initial_access', 'persistence', 'defense_evasion'],
      mitreTechniques: ['T1071.001', 'T1027', 'T1140'],
      iocs: [
        {
          type: 'onion',
          value: 'bluemagicvendor7dxdoq7irvjfsd43iabz4hjfdjwzvjpjuhcdjqfkzpfzfgqd.onion',
          description: 'Blue Magic vendor portal',
          firstSeen: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
          malicious: true,
          confidence: 97,
        },
        {
          type: 'crypto_wallet',
          value: '49HQFdMfKvEFRR87csusfC5PkDgpqo3yvW6JdQvBVx6fX8YfJjm8MqRZiUx3MbQpWJxK9VQMqRxZiYB',
          description: 'Monero payment address',
          firstSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 12 * 60 * 60 * 1000),
          malicious: true,
          confidence: 100,
        },
        {
          type: 'email',
          value: 'bluemagic.vendor@protonmail.com',
          description: 'Customer service contact (PGP: 0x9F8E7D6C)',
          firstSeen: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 88,
        },
      ],
      targetedSectors: ['Public Health', 'Postal Service', 'Border Security'],
      targetedCountries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'],
      targetedTechnologies: ['Tor', 'Tails', 'PGP', 'Monero', 'Steganography'],
      firstSeen: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'FBI Cyber Division',
          type: 'government',
          reliability: 95,
          timestamp: new Date(),
        },
        {
          name: 'DEA Darknet Investigations',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
        {
          name: 'USPS Inspection Service',
          type: 'government',
          reliability: 92,
          timestamp: new Date(),
        },
      ],
      sourceCount: 3,
      impact: {
        financialLoss: '$25M+ estimated annual revenue',
        affectedOrganizations: 47000,
        dataExfiltrated: 'Customer shipping addresses, purchase histories, PGP keys',
      },
      remediation: [
        'Controlled delivery operations',
        'Postal interdiction and package profiling',
        'Dark web marketplace infiltration',
        'Cryptocurrency transaction tracing',
        'Public health alerts for counterfeit M30 pills',
        'Fentanyl test strip distribution',
      ],
      tags: [
        'Dark Web',
        'Fentanyl Analogues',
        'Blue Magic',
        'Counterfeit Pills',
        'M30',
        'Monero',
        'Steganography',
        'Public Health',
      ],
      tlp: 'red',
      references: [
        'https://www.dea.gov/press-releases/2024/fake-prescription-pills-fentanyl',
        'https://www.fbi.gov/news/press-releases/dark-web-vendor-network-takedown',
      ],
    });

    // Chinese synthetic opioid supply chain
    this.addThreat({
      id: crypto.randomUUID(),
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      title: 'Chinese Synthetic Opioid Manufacturing: Wuhan-Mexico Pipeline',
      description:
        'Extensive intelligence on Chinese chemical companies producing fentanyl precursors and complete synthetic opioids for export ' +
        'to Mexican cartels. Primary manufacturers located in Wuhan, Guangzhou, and Shanghai. Companies operate as legitimate " +
        "pharmaceutical suppliers" while fulfilling cartel orders. Recent seizures at Port of Los Angeles intercepted 2,800kg of ' +
        '4-ANPP (fentanyl precursor) labeled as "industrial coating." Intelligence indicates Chinese government aware but enforcement ' +
        'limited. Supply chain enables cartels to produce 50kg+ fentanyl daily in Mexican super-labs.',
      severity: 'critical',
      type: 'narcotics_trafficking',
      confidence: 96,
      actorSophistication: 'organized_crime',
      attribution: {
        confidence: 94,
        sources: ['DEA', 'CBP', 'State Department INL', 'Chinese MPS'],
      },
      mitreTactics: ['supply_chain', 'command_and_control'],
      mitreTechniques: ['T1195.002', 'T1071.001'],
      iocs: [
        {
          type: 'domain',
          value: 'wuhan-pharma-exports.com',
          description: 'Wuhan-based precursor supplier',
          firstSeen: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 96,
        },
        {
          type: 'domain',
          value: 'guangzhou-chem-industrial.cn',
          description: 'Guangzhou chemical manufacturer front',
          firstSeen: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 93,
        },
        {
          type: 'email',
          value: 'export.sales@wuhan-pharma-exports.com',
          description: 'Bulk order contact',
          firstSeen: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 98,
        },
        {
          type: 'ip',
          value: '112.64.138.219',
          description: 'Wuhan server infrastructure',
          firstSeen: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 91,
        },
        {
          type: 'crypto_wallet',
          value: '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy',
          description: 'Bitcoin payment address for 4-ANPP orders',
          firstSeen: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000),
          lastSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          malicious: true,
          confidence: 97,
        },
      ],
      targetedSectors: ['Border Security', 'Customs', 'Port Operations', 'Public Health'],
      targetedCountries: ['Mexico', 'United States', 'Canada'],
      targetedTechnologies: ['Shipping Manifests', 'Cryptocurrency', 'Encrypted Email'],
      firstSeen: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 18 * 60 * 60 * 1000),
      active: true,
      sources: [
        {
          name: 'DEA International Operations',
          type: 'government',
          reliability: 100,
          timestamp: new Date(),
        },
        {
          name: 'U.S. Customs and Border Protection',
          type: 'government',
          reliability: 98,
          timestamp: new Date(),
        },
        {
          name: 'State Department Bureau of INL',
          type: 'government',
          url: 'https://www.state.gov/inl/',
          reliability: 95,
          timestamp: new Date(),
        },
      ],
      sourceCount: 3,
      impact: {
        financialLoss: '$3B+ annual economic impact from opioid crisis',
        affectedOrganizations: 250,
        dataExfiltrated: 'Supplier lists, shipping routes, cartel contacts, production methods',
      },
      remediation: [
        'Enhanced port screening for chemical precursors',
        'International chemical control agreements',
        'Diplomatic pressure on Chinese enforcement',
        'Super-lab interdiction in Mexico',
        'Financial sanctions on Chinese suppliers',
        'Supply chain intelligence sharing',
      ],
      tags: [
        'Fentanyl Precursors',
        '4-ANPP',
        'China',
        'Mexico',
        'Chemical Supply Chain',
        'Cartels',
        'Super-Labs',
        'Public Health Crisis',
        'Wuhan',
      ],
      tlp: 'red',
      references: [
        'https://www.dea.gov/press-releases/2024/chinese-fentanyl-supply-chain',
        'https://www.cbp.gov/newsroom/stats/drug-seizure-statistics',
        'https://www.state.gov/international-narcotics-control-strategy-report/',
      ],
    });

    console.log(`✓ Threat intelligence feed initialized with ${this.threats.size} threats`);
  }
}

// Singleton instance
export const threatFeed = new ThreatIntelligenceFeed();
