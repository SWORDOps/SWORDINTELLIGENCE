'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Skull, Globe, Filter, Search, Clock } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface ThreatEvent {
  id: string;
  timestamp: string;
  category: 'crypto-crime' | 'apt' | 'counter-narcotics' | 'dark-web';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: string;
  indicators?: string[];
}

export default function IntelFeedPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveTime, setLiveTime] = useState(new Date());

  // Update time every second for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sample threat data (in production, this would come from your backend)
  const threats: ThreatEvent[] = [
    {
      id: '1',
      timestamp: '2024-11-05T14:23:17Z',
      category: 'counter-narcotics',
      severity: 'critical',
      title: 'Fentanyl Precursor Payment Detected',
      description: '$47,200 USDT transfer from U.S.-based wallet to known Shenzhen chemical supplier. Payment routing through mixer, traced to final destination.',
      location: 'US → CN',
      indicators: ['0x7a4f...3e2d', 'Tornado Cash', 'Binance deposit'],
    },
    {
      id: '2',
      timestamp: '2024-11-05T13:47:22Z',
      category: 'crypto-crime',
      severity: 'high',
      title: 'DeFi Exploit in Progress',
      description: 'Flash loan attack detected on mid-cap DeFi protocol. Exploiter draining liquidity pools, current loss ~$2.1M. Tracking outflows across chains.',
      location: 'ETH/BSC',
      indicators: ['Flash loan', 'Price oracle manipulation', '0x9c3a...7f1b'],
    },
    {
      id: '3',
      timestamp: '2024-11-05T12:15:08Z',
      category: 'apt',
      severity: 'high',
      title: 'APT Infrastructure Change',
      description: 'Known APT28 C2 domain rotated to new hosting provider. Updated IOCs and infrastructure mapping available. Potential targeting of financial services sector.',
      location: 'RU → NL',
      indicators: ['cmd.3cx-services[.]net', 'AS51396', 'Cobalt Strike'],
    },
    {
      id: '4',
      timestamp: '2024-11-05T11:33:42Z',
      category: 'dark-web',
      severity: 'medium',
      title: 'Data Leak - Fortune 500',
      description: 'Employee database (~47K records) offered on dark web forum. Company not yet named publicly. Credentials being validated.',
      location: 'Underground forum',
      indicators: ['breachforums', 'SQL dump', 'bcrypt hashes'],
    },
    {
      id: '5',
      timestamp: '2024-11-05T10:22:19Z',
      category: 'crypto-crime',
      severity: 'critical',
      title: 'Ransomware Payment Tracked',
      description: '$1.8M Bitcoin payment traced through 14 intermediate wallets. Final destination identified at Russian exchange. Victim attribution in progress.',
      location: 'Victim: US / Destination: RU',
      indicators: ['bc1q...7h3m', 'Wasabi mixer', 'Garantex'],
    },
    {
      id: '6',
      timestamp: '2024-11-05T09:18:55Z',
      category: 'counter-narcotics',
      severity: 'high',
      title: 'Darknet Market Vendor Analysis',
      description: 'High-volume fentanyl vendor identified across 3 markets. Crypto payment flows mapped to logistics network. Coordinating with DEA field office.',
      location: 'Multi-market',
      indicators: ['XMR payments', 'Escrow pattern', 'Shipping OPSEC'],
    },
  ];

  const categories = [
    { value: 'all', label: 'All Threats', icon: Activity },
    { value: 'crypto-crime', label: 'Crypto Crime', icon: AlertTriangle },
    { value: 'apt', label: 'Nation-State APT', icon: Skull },
    { value: 'counter-narcotics', label: 'Counter-Narcotics', icon: AlertTriangle },
    { value: 'dark-web', label: 'Dark Web Intel', icon: Globe },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
      default: return 'text-muted border-border bg-surface';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crypto-crime': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'apt': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'counter-narcotics': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'dark-web': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default: return 'bg-accent/10 text-accent border-accent/30';
    }
  };

  const filteredThreats = threats.filter(threat => {
    const matchesCategory = selectedCategory === 'all' || threat.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      threat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = [
    { label: 'Active Threats', value: 247, change: '+12' },
    { label: 'Last 24h', value: 89, change: '+23' },
    { label: 'Critical', value: 14, change: '+3' },
    { label: 'Monitoring', value: 1834, change: '+47' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <h1 className="text-3xl font-bold">Live Threat Intelligence</h1>
              </div>
              <p className="text-sm text-muted font-mono">
                Last updated: {liveTime.toISOString().split('.')[0]}Z
              </p>
            </div>
            <div className="text-sm text-muted">
              <span className="font-semibold text-accent">SANITIZED FEED</span> - Sensitive details redacted
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold font-mono text-accent mb-1">
                <AnimatedCounter end={stat.value} />
                <span className="text-sm text-green-500 ml-2">{stat.change}</span>
              </div>
              <div className="text-xs text-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  ${selectedCategory === cat.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface text-muted hover:border-accent/50'
                  }
                `}
              >
                <cat.icon className="w-4 h-4 inline mr-2" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Threat Feed */}
        <div className="space-y-4">
          {filteredThreats.map((threat) => (
            <div
              key={threat.id}
              className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase border ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                    <span className={`px-3 py-1 rounded text-xs font-medium border ${getCategoryColor(threat.category)}`}>
                      {threat.category.replace('-', ' ')}
                    </span>
                    {threat.location && (
                      <span className="text-xs text-muted flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {threat.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{threat.title}</h3>
                  <p className="text-muted leading-relaxed">{threat.description}</p>
                </div>
                <div className="text-sm text-muted flex items-center whitespace-nowrap">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(threat.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Indicators */}
              {threat.indicators && threat.indicators.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted mb-2 uppercase tracking-wider">Indicators</div>
                  <div className="flex flex-wrap gap-2">
                    {threat.indicators.map((indicator, i) => (
                      <code key={i} className="px-2 py-1 rounded bg-background text-xs font-mono">
                        {indicator}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 rounded-lg border border-accent/30 bg-surface">
          <h3 className="font-semibold mb-2">About This Feed</h3>
          <p className="text-sm text-muted leading-relaxed">
            This threat intelligence feed displays <strong>sanitized, anonymized data</strong> from SWORD Intelligence operations.
            Sensitive attribution details, client information, and operational methods are redacted.
            Full intelligence reports with complete IOCs, technical analysis, and actionable recommendations
            are available to clients via our <a href="/contact" className="text-accent hover:underline">secure portal</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
