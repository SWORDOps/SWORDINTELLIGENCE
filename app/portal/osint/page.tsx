/**
 * OSINT Feed Dashboard
 *
 * Visualize threat intelligence from 18+ OSINT sources
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
  Database,
  RefreshCw,
  Search,
  Filter,
  Download,
  TrendingUp,
  Globe,
  Bug,
  Key,
  DollarSign,
  Eye,
} from 'lucide-react';

interface Feed {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  description: string;
}

interface Indicator {
  id: string;
  source: string;
  type: string;
  value: string;
  confidence: number;
  severity: string;
  tags: string[];
  firstSeen: string;
  description?: string;
}

interface Stats {
  totalFeeds: number;
  enabledFeeds: number;
  cachedIndicators: number;
  feedsByCategory: Record<string, number>;
}

export default function OSINTDashboard() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadFeeds();
    loadStats();
    loadIndicators();
  }, []);

  const loadFeeds = async () => {
    try {
      const response = await fetch('/api/osint/feeds');
      const data = await response.json();
      if (data.success) {
        setFeeds(data.feeds);
      }
    } catch (error) {
      console.error('Failed to load feeds:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/osint/feeds?action=stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadIndicators = async () => {
    setLoading(true);
    try {
      let url = '/api/osint/indicators';
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSeverity !== 'all') params.append('severity', selectedSeverity);
      if (searchTerm) params.append('search', searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setIndicators(data.indicators);
      }
    } catch (error) {
      console.error('Failed to load indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadIndicators();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'malware':
        return <Bug className="w-4 h-4" />;
      case 'phishing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'crypto':
        return <DollarSign className="w-4 h-4" />;
      case 'apt':
        return <Eye className="w-4 h-4" />;
      case 'darkweb':
        return <Globe className="w-4 h-4" />;
      case 'infrastructure':
        return <Database className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
        return '🌐';
      case 'domain':
        return '🔗';
      case 'url':
        return '🔗';
      case 'hash':
        return '🔐';
      case 'email':
        return '✉️';
      case 'wallet':
        return '💰';
      case 'onion':
        return '🧅';
      case 'cve':
        return '🛡️';
      default:
        return '📄';
    }
  };

  // Calculate charts data
  const bySeverity = indicators.reduce((acc, ind) => {
    acc[ind.severity] = (acc[ind.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byType = indicators.reduce((acc, ind) => {
    acc[ind.type] = (acc[ind.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const bySource = indicators.reduce((acc, ind) => {
    acc[ind.source] = (acc[ind.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = ['all', 'malware', 'phishing', 'crypto', 'apt', 'darkweb', 'infrastructure', 'narcotics'];
  const severities = ['all', 'critical', 'high', 'medium', 'low', 'info'];
  const types = ['all', 'ip', 'domain', 'url', 'hash', 'email', 'wallet', 'onion', 'cve'];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-green-500 mb-2">OSINT Threat Intelligence</h1>
        <p className="text-gray-400">Real-time threat data from 18+ open-source feeds</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-green-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400">Total Feeds</div>
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats?.totalFeeds || 0}</div>
          <div className="text-sm text-gray-500 mt-1">
            {stats?.enabledFeeds || 0} enabled
          </div>
        </div>

        <div className="bg-gray-900 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400">Critical</div>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-white">{bySeverity.critical || 0}</div>
          <div className="text-sm text-gray-500 mt-1">High priority threats</div>
        </div>

        <div className="bg-gray-900 border border-orange-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400">High Severity</div>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white">{bySeverity.high || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Significant threats</div>
        </div>

        <div className="bg-gray-900 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-400">Total Indicators</div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{indicators.length}</div>
          <div className="text-sm text-gray-500 mt-1">Cached IOCs</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* By Severity */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">By Severity</h3>
          <div className="space-y-3">
            {Object.entries(bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    severity === 'critical' ? 'bg-red-500' :
                    severity === 'high' ? 'bg-orange-500' :
                    severity === 'medium' ? 'bg-yellow-500' :
                    severity === 'low' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-gray-300 capitalize">{severity}</span>
                </div>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">By Type</h3>
          <div className="space-y-3">
            {Object.entries(byType).slice(0, 7).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(type)}</span>
                  <span className="text-gray-300 uppercase">{type}</span>
                </div>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Source */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Sources</h3>
          <div className="space-y-3">
            {Object.entries(bySource)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 7)
              .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate max-w-[150px]">{source}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Search Indicators</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by value, hash, domain..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setTimeout(() => loadIndicators(), 100);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Severity</label>
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setTimeout(() => loadIndicators(), 100);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              {severities.map((sev) => (
                <option key={sev} value={sev}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Actions</label>
            <button
              onClick={() => {
                loadFeeds();
                loadStats();
                loadIndicators();
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Threat Indicators</h2>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
            <p>Loading indicators...</p>
          </div>
        ) : indicators.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No indicators found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    First Seen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {indicators.slice(0, 100).map((indicator) => (
                  <tr key={indicator.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{getTypeIcon(indicator.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-white max-w-md truncate">
                        {indicator.value}
                      </div>
                      {indicator.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                          {indicator.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(indicator.severity)}`}>
                        {indicator.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {indicator.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 rounded-full h-2"
                            style={{ width: `${indicator.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{indicator.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {indicator.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {indicator.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-500 rounded text-xs">
                            +{indicator.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(indicator.firstSeen).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {indicators.length > 100 && (
          <div className="p-4 bg-gray-800/30 text-center text-sm text-gray-400">
            Showing 100 of {indicators.length} indicators
          </div>
        )}
      </div>

      {/* Feed Status */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Feed Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className={`p-4 rounded-lg border ${
                feed.enabled
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-gray-800/50 border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(feed.category)}
                  <span className="font-semibold text-white text-sm">{feed.name}</span>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    feed.enabled ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-gray-400">{feed.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  feed.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                }`}>
                  {feed.enabled ? 'Active' : 'Disabled'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 capitalize">
                  {feed.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
