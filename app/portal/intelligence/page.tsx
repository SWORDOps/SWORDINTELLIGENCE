'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  Activity,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Users,
  Globe,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type ThreatType = 'malware' | 'ransomware' | 'phishing' | 'apt' | 'data_breach' | 'vulnerability' | 'ddos' | 'supply_chain' | 'insider_threat' | 'social_engineering';

interface ThreatIntelligence {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  type: ThreatType;
  confidence: number;
  threatActor?: string;
  actorGroup?: string;
  actorSophistication?: string;
  mitreTactics: string[];
  mitreTechniques: string[];
  iocs: IOC[];
  targetedSectors: string[];
  targetedCountries: string[];
  firstSeen: string;
  lastSeen: string;
  active: boolean;
  sources: ThreatSource[];
  sourceCount: number;
  impact?: {
    financialLoss?: string;
    affectedOrganizations?: number;
    dataExfiltrated?: string;
  };
  remediation?: string[];
  cveIds?: string[];
  tags: string[];
  tlp: 'red' | 'amber' | 'green' | 'white';
  references: string[];
}

interface IOC {
  type: string;
  value: string;
  description?: string;
  malicious: boolean;
  confidence: number;
}

interface ThreatSource {
  name: string;
  type: string;
  reliability: number;
}

export default function ThreatIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<ThreatSeverity | ''>('');
  const [typeFilter, setTypeFilter] = useState<ThreatType | ''>('');
  const [actorFilter, setActorFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [iocSearch, setIocSearch] = useState('');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    }
  }, [status, router]);

  // Load threats
  const loadThreats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (severityFilter) params.append('severity', severityFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (actorFilter) params.append('actor', actorFilter);
      if (activeFilter !== '') params.append('active', activeFilter.toString());
      if (iocSearch) params.append('ioc', iocSearch);

      const response = await fetch(`/api/intelligence/threats?${params}`);
      const data = await response.json();

      if (response.ok) {
        setThreats(data.threats);
        if (data.stats) setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load threats');
      }
    } catch (err) {
      setError('Failed to load threat intelligence');
    } finally {
      setLoading(false);
    }
  }, [severityFilter, typeFilter, actorFilter, activeFilter, iocSearch]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadThreats();
    }
  }, [status, loadThreats]);

  // Filter by search query (client-side)
  const filteredThreats = threats.filter(threat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      threat.title.toLowerCase().includes(query) ||
      threat.description.toLowerCase().includes(query) ||
      threat.threatActor?.toLowerCase().includes(query) ||
      threat.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Get severity color
  const getSeverityColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      case 'info': return 'bg-gray-600 text-white';
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical': return AlertOctagon;
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      case 'info': return Activity;
    }
  };

  // Get TLP color
  const getTlpColor = (tlp: string) => {
    switch (tlp) {
      case 'red': return 'bg-red-600 text-white';
      case 'amber': return 'bg-amber-600 text-white';
      case 'green': return 'bg-green-600 text-white';
      case 'white': return 'bg-gray-600 text-white';
    }
  };

  // Get type icon
  const getTypeIcon = (type: ThreatType) => {
    switch (type) {
      case 'apt': return Target;
      case 'ransomware': return AlertOctagon;
      case 'malware': return Zap;
      case 'phishing': return AlertTriangle;
      default: return Shield;
    }
  };

  // Format MITRE tactic
  const formatMitreTactic = (tactic: string) => {
    return tactic.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-muted">Loading threat intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-8 h-8 text-accent" />
                <h1 className="text-3xl font-bold">Threat Intelligence</h1>
              </div>
              <p className="text-muted">
                Real-time threat feed • MITRE ATT&CK mapping • IOC correlation
              </p>
            </div>
            <Button onClick={loadThreats} variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-accent">{stats.total}</div>
              <div className="text-sm text-muted">Total Threats</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-green-500">{stats.active}</div>
              <div className="text-sm text-muted">Active</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-red-500">{stats.bySeverity.critical}</div>
              <div className="text-sm text-muted">Critical</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-orange-500">{stats.bySeverity.high}</div>
              <div className="text-sm text-muted">High Severity</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-blue-500">{stats.totalIOCs}</div>
              <div className="text-sm text-muted">IOCs</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="p-4 rounded-lg border border-border bg-surface">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-muted" />

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threats..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* IOC Search */}
            <div className="flex-1 relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={iocSearch}
                onChange={(e) => setIocSearch(e.target.value)}
                placeholder="Search IOC (IP, domain, hash)..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as ThreatSeverity | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ThreatType | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Types</option>
              <option value="apt">APT</option>
              <option value="ransomware">Ransomware</option>
              <option value="malware">Malware</option>
              <option value="phishing">Phishing</option>
              <option value="data_breach">Data Breach</option>
              <option value="vulnerability">Vulnerability</option>
            </select>

            {/* Actor Filter */}
            <input
              type="text"
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              placeholder="Filter by actor..."
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />

            {/* Active Filter */}
            <select
              value={activeFilter.toString()}
              onChange={(e) => setActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <Button onClick={loadThreats}>Apply</Button>
          </div>
        </div>
      </div>

      {/* Threat Feed */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading threats...</p>
          </div>
        ) : filteredThreats.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No threats found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredThreats.map((threat) => {
              const SeverityIcon = getSeverityIcon(threat.severity);
              const TypeIcon = getTypeIcon(threat.type);

              return (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(threat.severity)} flex items-center space-x-1`}>
                          <SeverityIcon className="w-3 h-3" />
                          <span>{threat.severity}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getTlpColor(threat.tlp)}`}>
                          TLP:{threat.tlp.toUpperCase()}
                        </span>
                        {threat.active && (
                          <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-semibold flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                        <span className="text-xs text-muted">
                          {new Date(threat.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 flex items-center space-x-2">
                        <TypeIcon className="w-5 h-5 text-accent" />
                        <span>{threat.title}</span>
                      </h3>

                      <p className="text-sm text-muted mb-3 line-clamp-2">{threat.description}</p>

                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        {threat.threatActor && (
                          <div>
                            <strong className="text-muted">Actor:</strong>
                            <p className="text-red-500 font-semibold">{threat.threatActor}</p>
                          </div>
                        )}
                        <div>
                          <strong className="text-muted">Type:</strong>
                          <p className="font-semibold">{threat.type.toUpperCase()}</p>
                        </div>
                        <div>
                          <strong className="text-muted">Confidence:</strong>
                          <p className="font-semibold">{threat.confidence}%</p>
                        </div>
                        <div>
                          <strong className="text-muted">IOCs:</strong>
                          <p className="font-semibold">{threat.iocs.length}</p>
                        </div>
                      </div>

                      {/* MITRE ATT&CK Tactics */}
                      {threat.mitreTactics.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xs text-muted">MITRE ATT&CK:</span>
                          {threat.mitreTactics.slice(0, 5).map(tactic => (
                            <span key={tactic} className="px-2 py-1 rounded bg-blue-500/20 text-blue-500 text-xs font-semibold">
                              {formatMitreTactic(tactic)}
                            </span>
                          ))}
                          {threat.mitreTactics.length > 5 && (
                            <span className="text-xs text-muted">+{threat.mitreTactics.length - 5} more</span>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {threat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {threat.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedThreat(threat);
                      }}
                      className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedThreat(null)}>
          <div className="bg-surface rounded-lg border border-border max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-surface z-10">
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(selectedThreat.severity)}`}>
                  {selectedThreat.severity}
                </span>
                <h2 className="text-xl font-bold">{selectedThreat.title}</h2>
              </div>
              <button onClick={() => setSelectedThreat(null)}>
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted">{selectedThreat.description}</p>
              </div>

              {/* Attribution */}
              {selectedThreat.threatActor && (
                <div>
                  <h3 className="font-semibold mb-2">Attribution</h3>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted">Threat Actor:</span>
                        <p className="font-bold text-red-500">{selectedThreat.threatActor}</p>
                      </div>
                      {selectedThreat.actorGroup && (
                        <div>
                          <span className="text-muted">Group:</span>
                          <p className="font-bold">{selectedThreat.actorGroup}</p>
                        </div>
                      )}
                      {selectedThreat.actorSophistication && (
                        <div>
                          <span className="text-muted">Sophistication:</span>
                          <p className="font-bold">{selectedThreat.actorSophistication.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK */}
              <div>
                <h3 className="font-semibold mb-2">MITRE ATT&CK Framework</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted">Tactics:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedThreat.mitreTactics.map(tactic => (
                        <span key={tactic} className="px-2 py-1 rounded bg-blue-500/20 text-blue-500 text-xs font-semibold">
                          {formatMitreTactic(tactic)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted">Techniques:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedThreat.mitreTechniques.map(technique => (
                        <span key={technique} className="px-2 py-1 rounded bg-purple-500/20 text-purple-500 text-xs font-mono">
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* IOCs */}
              <div>
                <h3 className="font-semibold mb-2">Indicators of Compromise ({selectedThreat.iocs.length})</h3>
                <div className="space-y-2">
                  {selectedThreat.iocs.map((ioc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs font-semibold uppercase">
                              {ioc.type}
                            </span>
                            <code className="text-sm font-mono">{ioc.value}</code>
                          </div>
                          {ioc.description && (
                            <p className="text-xs text-muted">{ioc.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted">
                          Confidence: {ioc.confidence}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Targeting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Targeted Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedThreat.targetedSectors.map(sector => (
                      <span key={sector} className="px-2 py-1 rounded bg-orange-500/20 text-orange-500 text-xs">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Targeted Countries</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedThreat.targetedCountries.map(country => (
                      <span key={country} className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs">
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Impact */}
              {selectedThreat.impact && (
                <div>
                  <h3 className="font-semibold mb-2">Impact Assessment</h3>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {selectedThreat.impact.financialLoss && (
                        <div>
                          <span className="text-muted">Financial Loss:</span>
                          <p className="font-bold">{selectedThreat.impact.financialLoss}</p>
                        </div>
                      )}
                      {selectedThreat.impact.affectedOrganizations && (
                        <div>
                          <span className="text-muted">Organizations:</span>
                          <p className="font-bold">{selectedThreat.impact.affectedOrganizations}</p>
                        </div>
                      )}
                      {selectedThreat.impact.dataExfiltrated && (
                        <div>
                          <span className="text-muted">Data Exfiltrated:</span>
                          <p className="font-bold">{selectedThreat.impact.dataExfiltrated}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Remediation */}
              {selectedThreat.remediation && selectedThreat.remediation.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Remediation Steps</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {selectedThreat.remediation.map((step, i) => (
                      <li key={i} className="text-muted">{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              <div>
                <h3 className="font-semibold mb-2">Intelligence Sources ({selectedThreat.sources.length})</h3>
                <div className="grid grid-cols-3 gap-3">
                  {selectedThreat.sources.map((source, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background border border-border">
                      <div className="font-semibold text-sm">{source.name}</div>
                      <div className="text-xs text-muted">{source.type.toUpperCase()}</div>
                      <div className="text-xs mt-1">
                        Reliability: <span className="font-semibold">{source.reliability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* References */}
              {selectedThreat.references.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">References</h3>
                  <div className="space-y-2">
                    {selectedThreat.references.map((ref, i) => (
                      <a
                        key={i}
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-accent hover:underline flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{ref}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
