'use client';

/**
 * Admin Canary Token Monitoring
 *
 * Monitor all canary tokens and data exfiltration attempts
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  AlertTriangle,
  Activity,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface CanaryStats {
  totalTokens: number;
  activeTokens: number;
  totalTriggers: number;
  recentTriggers: number;
  byType: Record<string, number>;
  byUser: Record<string, number>;
  triggersByType: Record<string, number>;
}

interface CanaryToken {
  tokenId: string;
  type: string;
  label: string;
  userId: string;
  createdAt: string;
  active: boolean;
  triggerCount: number;
  documentId?: string;
}

interface CanaryTrigger {
  id: string;
  tokenId: string;
  triggeredAt: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  additionalData?: Record<string, any>;
  tokenLabel?: string;
  tokenType?: string;
  tokenOwner?: string;
}

export default function CanaryMonitoringPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CanaryStats | null>(null);
  const [tokens, setTokens] = useState<CanaryToken[]>([]);
  const [triggers, setTriggers] = useState<CanaryTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tokens' | 'triggers'>('triggers');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadCanaryData();
    }
  }, [status]);

  const loadCanaryData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/canary');

      if (res.status === 403) {
        setError('Access Denied: Insufficient permissions');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load canary data');
      }

      const data = await res.json();
      setStats(data.stats);
      setTokens(data.tokens);
      setTriggers(data.recentTriggers);
      setError('');
    } catch (err: any) {
      console.error('Canary data load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web_bug': return Eye;
      case 'pdf_beacon': return AlertTriangle;
      default: return Zap;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'dns': return 'text-blue-500';
      case 'web_bug': return 'text-purple-500';
      case 'pdf_beacon': return 'text-red-500';
      case 'honeytoken': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div>Loading canary data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push('/portal/admin')}
            className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20"
          >
            Return to Admin
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Canary Token Monitoring</h1>
            </div>
            <p className="text-green-500/70">
              Data exfiltration detection and alert monitoring
            </p>
          </div>

          <Link
            href="/portal/admin"
            className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20"
          >
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-green-500/50">TOKENS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalTokens} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.activeTokens} active
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-xs text-green-500/50">TRIGGERS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalTriggers} />
          </div>
          <div className="text-sm text-green-500/70">
            All time
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <span className="text-xs text-green-500/50">RECENT</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.recentTriggers} />
          </div>
          <div className="text-sm text-green-500/70">
            Last 24 hours
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-green-500/50">USERS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={Object.keys(stats.byUser).length} />
          </div>
          <div className="text-sm text-green-500/70">
            With tokens
          </div>
        </div>
      </div>

      {/* Token Type Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Tokens by Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-sm flex items-center ${getTypeColor(type)}`}>
                    {React.createElement(getTypeIcon(type), { className: 'w-4 h-4 mr-2' })}
                    {type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm font-mono font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Triggers by Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.triggersByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className={`text-sm flex items-center ${getTypeColor(type)}`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm font-mono font-semibold text-red-500">{count}</span>
                </div>
              ))}
            {Object.keys(stats.triggersByType).length === 0 && (
              <div className="text-sm text-green-500/50 text-center py-4">
                No triggers detected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('triggers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'triggers'
              ? 'bg-red-500/20 text-red-500 border border-red-500/30'
              : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Recent Triggers ({stats.recentTriggers})
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'tokens'
              ? 'bg-green-500 text-black'
              : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          All Tokens
        </button>
      </div>

      {/* Triggers List */}
      {activeTab === 'triggers' && (
        <div className="space-y-3">
          {triggers.length === 0 ? (
            <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <div className="text-green-500/70">No canary tokens triggered - System secure</div>
            </div>
          ) : (
            triggers.map((trigger) => (
              <div
                key={trigger.id}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold text-red-500">CANARY TRIGGERED</span>
                      <span className="text-xs text-green-500/50">•</span>
                      <span className={`text-xs ${getTypeColor(trigger.tokenType || '')}`}>
                        {trigger.tokenType?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Token Info */}
                    <div className="font-semibold mb-2">{trigger.tokenLabel}</div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-green-500/70">Owner: </span>
                        <span>{trigger.tokenOwner}</span>
                      </div>
                      <div>
                        <span className="text-green-500/70">Triggered: </span>
                        <span>{new Date(trigger.triggeredAt).toLocaleString()}</span>
                      </div>
                      {trigger.ipAddress && (
                        <div>
                          <span className="text-green-500/70">IP Address: </span>
                          <span className="font-mono">{trigger.ipAddress}</span>
                        </div>
                      )}
                      {trigger.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-green-500/50" />
                          <span>
                            {trigger.location.city && `${trigger.location.city}, `}
                            {trigger.location.country}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Agent */}
                    {trigger.userAgent && (
                      <div className="text-xs text-green-500/50 font-mono mt-2 p-2 bg-black/50 rounded">
                        {trigger.userAgent}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tokens Table */}
      {activeTab === 'tokens' && (
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-500/10 border-b border-green-500/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Label</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Triggers</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/20">
              {tokens.map((token) => (
                <tr key={token.tokenId} className="hover:bg-green-500/5">
                  <td className="px-6 py-4">
                    <span className="font-medium">{token.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(token.type)}`}>
                      {token.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-500/70">{token.userId}</span>
                  </td>
                  <td className="px-6 py-4">
                    {token.active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-mono font-semibold ${token.triggerCount > 0 ? 'text-red-500' : ''}`}>
                      {token.triggerCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-green-500/50" />
                      {new Date(token.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alert Notice */}
      {stats.recentTriggers > 0 && (
        <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-500/80">
              <strong>Security Alert:</strong> {stats.recentTriggers} canary token(s) triggered in the last 24 hours.
              This may indicate data exfiltration attempts or unauthorized access.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
