'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Copy,
  ExternalLink,
  Map,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
type CanaryTokenType = 'dns' | 'web_bug' | 'honeytoken' | 'watermark' | 'qr_code' | 'pdf_beacon' | 'macro' | 'clonedsite';
type CanaryTokenStatus = 'active' | 'triggered' | 'expired' | 'revoked';
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface CanaryToken {
  tokenId: string;
  type: CanaryTokenType;
  status: CanaryTokenStatus;
  label: string;
  description?: string;
  tokenValue: string;
  documentId?: string;
  tags: string[];
  createdAt: string;
  expiresAt?: string;
  firstTriggeredAt?: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  alertOnFirstTrigger: boolean;
  alertOnEveryTrigger: boolean;
}

interface CanaryTrigger {
  triggerId: string;
  tokenId: string;
  triggeredAt: string;
  sourceIp: string;
  userAgent?: string;
  geolocation?: {
    ip: string;
    country?: string;
    city?: string;
  };
  threatIntel?: {
    reputation: 'clean' | 'suspicious' | 'malicious' | 'unknown';
    threatScore: number;
    categories: string[];
  };
  triggerType: string;
  severity: AlertSeverity;
  acknowledgedAt?: string;
  token?: {
    label: string;
    type: string;
    tags: string[];
  };
}

export default function CanaryTokensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [tokens, setTokens] = useState<CanaryToken[]>([]);
  const [triggers, setTriggers] = useState<CanaryTrigger[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<CanaryTokenStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<CanaryTokenType | ''>('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTriggerDetails, setShowTriggerDetails] = useState<CanaryTrigger | null>(null);

  // Create form
  const [createType, setCreateType] = useState<CanaryTokenType>('web_bug');
  const [createLabel, setCreateLabel] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createTags, setCreateTags] = useState('');
  const [createExpiresIn, setCreateExpiresIn] = useState(2592000); // 30 days

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    }
  }, [status, router]);

  // Load tokens and triggers
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load tokens
      const tokensParams = new URLSearchParams();
      if (statusFilter) tokensParams.append('status', statusFilter);
      if (typeFilter) tokensParams.append('type', typeFilter);

      const tokensResponse = await fetch(`/api/canary/tokens?${tokensParams}`);
      const tokensData = await tokensResponse.json();

      if (tokensResponse.ok) {
        setTokens(tokensData.tokens);
        setStats(tokensData.stats);
      } else {
        setError(tokensData.error || 'Failed to load tokens');
      }

      // Load triggers
      const triggersParams = new URLSearchParams();
      if (severityFilter) triggersParams.append('severity', severityFilter);

      const triggersResponse = await fetch(`/api/canary/triggers?${triggersParams}`);
      const triggersData = await triggersResponse.json();

      if (triggersResponse.ok) {
        setTriggers(triggersData.triggers);
      }
    } catch (err) {
      setError('Failed to load canary tokens');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, severityFilter]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, loadData]);

  // Create canary token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/canary/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: createType,
          label: createLabel,
          description: createDescription,
          tags: createTags.split(',').map(t => t.trim()).filter(Boolean),
          expiresIn: createExpiresIn,
          alertOnFirstTrigger: true,
          alertOnEveryTrigger: createType === 'web_bug' || createType === 'pdf_beacon',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Canary token created! Token value: ${data.token.tokenValue}`);
        setShowCreateModal(false);
        setCreateLabel('');
        setCreateDescription('');
        setCreateTags('');
        loadData();
      } else {
        setError(data.error || 'Failed to create token');
      }
    } catch (err) {
      setError('Failed to create token');
    }
  };

  // Revoke token
  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm('Revoke this canary token? It will no longer trigger alerts.')) return;

    try {
      const response = await fetch('/api/canary/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      if (response.ok) {
        setSuccess('Token revoked');
        loadData();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to revoke token');
      }
    } catch (err) {
      setError('Failed to revoke token');
    }
  };

  // Acknowledge trigger
  const handleAcknowledgeTrigger = async (trigger: CanaryTrigger) => {
    try {
      const response = await fetch('/api/canary/triggers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerId: trigger.triggerId,
          tokenId: trigger.tokenId,
        }),
      });

      if (response.ok) {
        setSuccess('Trigger acknowledged');
        loadData();
      } else {
        setError('Failed to acknowledge trigger');
      }
    } catch (err) {
      setError('Failed to acknowledge trigger');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
  };

  // Get type icon
  const getTypeIcon = (type: CanaryTokenType) => {
    switch (type) {
      case 'dns': return '🌐';
      case 'web_bug': return '🐛';
      case 'honeytoken': return '🍯';
      case 'watermark': return '💧';
      case 'qr_code': return '📱';
      case 'pdf_beacon': return '📄';
      case 'macro': return '📊';
      case 'clonedsite': return '🎣';
    }
  };

  // Get status color
  const getStatusColor = (status: CanaryTokenStatus) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500';
      case 'triggered': return 'bg-orange-500/20 text-orange-500 border-orange-500';
      case 'expired': return 'bg-gray-500/20 text-gray-500 border-gray-500';
      case 'revoked': return 'bg-red-500/20 text-red-500 border-red-500';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-blue-600 text-white';
      case 'info': return 'bg-gray-600 text-white';
    }
  };

  // Get reputation color
  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case 'malicious': return 'text-red-500';
      case 'suspicious': return 'text-orange-500';
      case 'clean': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-muted">Loading canary tokens...</p>
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
                <Zap className="w-8 h-8 text-yellow-500" />
                <h1 className="text-3xl font-bold">Canary Tokens</h1>
              </div>
              <p className="text-muted">
                Deploy tripwires to detect unauthorized document access & data exfiltration
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Token
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <XCircle className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500 break-all">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <XCircle className="w-4 h-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-green-500">{stats.activeTokens}</div>
              <div className="text-sm text-muted">Active Tokens</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-orange-500">{stats.triggeredTokens}</div>
              <div className="text-sm text-muted">Triggered</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-red-500">{stats.totalTriggers}</div>
              <div className="text-sm text-muted">Total Alerts</div>
            </div>
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="text-2xl font-bold text-accent">{stats.uniqueIPs}</div>
              <div className="text-sm text-muted">Unique IPs</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Triggers */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Alerts</h2>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | '')}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>

        {triggers.length === 0 ? (
          <div className="p-8 rounded-lg border border-border bg-surface text-center">
            <Bell className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No alerts yet - your canary tokens are waiting...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div
                key={trigger.triggerId}
                className={`p-6 rounded-lg border ${trigger.acknowledgedAt ? 'border-border bg-surface/50' : 'border-orange-500/50 bg-orange-500/5'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(trigger.severity)}`}>
                        {trigger.severity}
                      </span>
                      <span className="text-sm text-muted">{new Date(trigger.triggeredAt).toLocaleString()}</span>
                      {trigger.acknowledgedAt && (
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 text-xs font-semibold">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <strong className="text-lg">{trigger.token?.label}</strong>
                      <span className="ml-2 text-sm text-muted">
                        {getTypeIcon(trigger.token?.type as CanaryTokenType)} {trigger.triggerType}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong className="text-muted">Source IP:</strong>
                        <p className="font-mono">{trigger.sourceIp}</p>
                      </div>
                      <div>
                        <strong className="text-muted">Location:</strong>
                        <p>
                          {trigger.geolocation?.city || 'Unknown'}, {trigger.geolocation?.country || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-muted">Threat Level:</strong>
                        <p className={`font-semibold ${getReputationColor(trigger.threatIntel?.reputation || 'unknown')}`}>
                          {trigger.threatIntel?.reputation?.toUpperCase() || 'UNKNOWN'}
                          {trigger.threatIntel?.threatScore ? ` (${trigger.threatIntel.threatScore}/100)` : ''}
                        </p>
                      </div>
                    </div>

                    {trigger.userAgent && (
                      <div className="mt-3 text-sm">
                        <strong className="text-muted">User Agent:</strong>
                        <p className="font-mono text-xs mt-1">{trigger.userAgent}</p>
                      </div>
                    )}

                    {trigger.threatIntel?.categories && trigger.threatIntel.categories.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2">
                        {trigger.threatIntel.categories.map(cat => (
                          <span key={cat} className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-xs">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setShowTriggerDetails(trigger)}
                      className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {!trigger.acknowledgedAt && (
                      <button
                        onClick={() => handleAcknowledgeTrigger(trigger)}
                        className="p-2 rounded-lg border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-500 transition-colors"
                        title="Acknowledge"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tokens List */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Tokens</h2>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CanaryTokenStatus | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="triggered">Triggered</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CanaryTokenType | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Types</option>
              <option value="dns">DNS</option>
              <option value="web_bug">Web Bug</option>
              <option value="honeytoken">Honeytoken</option>
              <option value="watermark">Watermark</option>
              <option value="qr_code">QR Code</option>
              <option value="pdf_beacon">PDF Beacon</option>
              <option value="macro">Macro</option>
              <option value="clonedsite">Cloned Site</option>
            </select>

            <Button onClick={loadData} variant="outline">Refresh</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
            <p className="text-muted">Loading tokens...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-8 rounded-lg border border-border bg-surface text-center">
            <Zap className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No canary tokens yet</p>
            <Button onClick={() => setShowCreateModal(true)}>Create your first token</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tokens.map((token) => (
              <div
                key={token.tokenId}
                className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(token.type)}</span>
                      <h3 className="text-lg font-semibold">{token.label}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(token.status)}`}>
                        {token.status}
                      </span>
                      {token.triggerCount > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-500/20 text-orange-500">
                          🚨 {token.triggerCount} alert{token.triggerCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {token.description && (
                      <p className="text-sm text-muted mb-3">{token.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <strong className="text-muted">Type:</strong> {token.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div>
                        <strong className="text-muted">Created:</strong> {new Date(token.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <strong className="text-muted">Expires:</strong> {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                      </div>
                    </div>

                    {token.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        {token.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded bg-background border border-border">
                      <div className="flex items-center justify-between">
                        <code className="text-xs break-all">{token.tokenValue}</code>
                        <button
                          onClick={() => copyToClipboard(token.tokenValue)}
                          className="ml-2 p-1 rounded hover:bg-accent/10"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {token.status === 'active' && (
                      <button
                        onClick={() => handleRevokeToken(token.tokenId)}
                        className="p-2 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Revoke"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Token Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Canary Token</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Token Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as CanaryTokenType)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="web_bug">🐛 Web Bug (Tracking Pixel)</option>
                  <option value="dns">🌐 DNS Canary</option>
                  <option value="honeytoken">🍯 Honeytoken (Fake Credentials)</option>
                  <option value="watermark">💧 Watermark</option>
                  <option value="qr_code">📱 QR Code</option>
                  <option value="pdf_beacon">📄 PDF Beacon</option>
                  <option value="macro">📊 Office Macro</option>
                  <option value="clonedsite">🎣 Cloned Site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Label</label>
                <input
                  type="text"
                  value={createLabel}
                  onChange={(e) => setCreateLabel(e.target.value)}
                  required
                  placeholder="e.g., Sensitive document tracker"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="What this token is for..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={createTags}
                  onChange={(e) => setCreateTags(e.target.value)}
                  placeholder="TOP SECRET, CONFIDENTIAL, etc"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expires In (seconds)</label>
                <input
                  type="number"
                  value={createExpiresIn}
                  onChange={(e) => setCreateExpiresIn(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted mt-1">
                  {Math.floor(createExpiresIn / 86400)} days, {Math.floor((createExpiresIn % 86400) / 3600)} hours
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Token</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Details Modal */}
      {showTriggerDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Alert Details</h2>
              <button onClick={() => setShowTriggerDetails(null)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm text-muted">Severity</strong>
                  <p className={`text-lg font-bold mt-1 ${getSeverityColor(showTriggerDetails.severity)} inline-block px-3 py-1 rounded`}>
                    {showTriggerDetails.severity.toUpperCase()}
                  </p>
                </div>
                <div>
                  <strong className="text-sm text-muted">Triggered At</strong>
                  <p className="mt-1">{new Date(showTriggerDetails.triggeredAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <strong className="text-sm text-muted">Token</strong>
                <p className="text-lg mt-1">{showTriggerDetails.token?.label}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-sm text-muted">Source IP</strong>
                  <p className="font-mono mt-1">{showTriggerDetails.sourceIp}</p>
                </div>
                <div>
                  <strong className="text-sm text-muted">Location</strong>
                  <p className="mt-1">
                    {showTriggerDetails.geolocation?.city || 'Unknown'}, {showTriggerDetails.geolocation?.country || 'Unknown'}
                  </p>
                </div>
              </div>

              {showTriggerDetails.userAgent && (
                <div>
                  <strong className="text-sm text-muted">User Agent</strong>
                  <p className="font-mono text-sm mt-1 p-3 rounded bg-background border border-border">
                    {showTriggerDetails.userAgent}
                  </p>
                </div>
              )}

              {showTriggerDetails.threatIntel && (
                <div>
                  <strong className="text-sm text-muted">Threat Intelligence</strong>
                  <div className="mt-2 p-4 rounded border border-border bg-background">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted">Reputation:</span>
                        <p className={`font-bold ${getReputationColor(showTriggerDetails.threatIntel.reputation)}`}>
                          {showTriggerDetails.threatIntel.reputation.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted">Threat Score:</span>
                        <p className="font-bold">{showTriggerDetails.threatIntel.threatScore}/100</p>
                      </div>
                    </div>
                    {showTriggerDetails.threatIntel.categories.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-muted">Categories:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {showTriggerDetails.threatIntel.categories.map(cat => (
                            <span key={cat} className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-xs">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border flex justify-end space-x-3">
                {!showTriggerDetails.acknowledgedAt && (
                  <Button onClick={() => {
                    handleAcknowledgeTrigger(showTriggerDetails);
                    setShowTriggerDetails(null);
                  }}>
                    Acknowledge Alert
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowTriggerDetails(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
