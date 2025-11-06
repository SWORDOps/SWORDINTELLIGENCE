'use client';

/**
 * Admin Audit Logs Viewer
 *
 * Complete system activity audit trail
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  userId: string;
  action: string;
  description: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  errorMessage?: string;
  riskScore?: number;
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadLogs();
    }
  }, [status, eventTypeFilter, severityFilter, successFilter, offset]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append('q', searchQuery);
      if (eventTypeFilter) params.append('eventType', eventTypeFilter);
      if (severityFilter) params.append('severity', severityFilter);
      if (successFilter) params.append('success', successFilter);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const res = await fetch(`/api/admin/audit?${params}`);

      if (res.status === 403) {
        setError('Access Denied: Insufficient permissions');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load audit logs');
      }

      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      setError('');
    } catch (err: any) {
      console.error('Logs load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            eventType: eventTypeFilter || undefined,
            severity: severityFilter || undefined,
            success: successFilter ? successFilter === 'true' : undefined,
            searchQuery: searchQuery || undefined,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.json`;
      a.click();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'error': return 'text-orange-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getSeverityBg = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      case 'error': return 'bg-orange-500/10 border-orange-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-green-500/10 border-green-500/30';
    }
  };

  const getRiskColor = (score?: number): string => {
    if (!score) return 'text-green-500';
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

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

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Audit Logs</h1>
            </div>
            <p className="text-green-500/70">
              Complete system activity audit trail
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <Link
              href="/portal/admin"
              className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadLogs()}
            className="w-full bg-green-500/5 border border-green-500/30 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Event Type */}
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="">All Events</option>
          <option value="auth.login">Login</option>
          <option value="vault.document_uploaded">Document Upload</option>
          <option value="vault.document_downloaded">Document Download</option>
          <option value="canary.token_triggered">Canary Triggered</option>
          <option value="message.sent">Message Sent</option>
          <option value="admin.access">Admin Access</option>
        </select>

        {/* Severity */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>

        {/* Success */}
        <select
          value={successFilter}
          onChange={(e) => setSuccessFilter(e.target.value)}
          className="bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="">All Status</option>
          <option value="true">Success</option>
          <option value="false">Failed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1">{total}</div>
          <div className="text-sm text-green-500/70">Total Events</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1">
            {logs.filter(l => l.success).length}
          </div>
          <div className="text-sm text-green-500/70">Successful</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1 text-red-500">
            {logs.filter(l => !l.success).length}
          </div>
          <div className="text-sm text-green-500/70">Failed</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1 text-yellow-500">
            {logs.filter(l => l.riskScore && l.riskScore >= 70).length}
          </div>
          <div className="text-sm text-green-500/70">High Risk</div>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
            <div className="text-sm text-green-500/70">Loading logs...</div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
            <div className="text-green-500/70">No audit logs found</div>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`bg-green-500/5 border rounded-lg p-4 ${getSeverityBg(log.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-xs font-semibold uppercase ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                    <span className="text-xs text-green-500/50">•</span>
                    <span className="text-xs font-mono text-green-500/70">{log.eventType}</span>
                    <span className="text-xs text-green-500/50">•</span>
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    {log.riskScore && log.riskScore >= 40 && (
                      <>
                        <span className="text-xs text-green-500/50">•</span>
                        <span className={`text-xs font-semibold ${getRiskColor(log.riskScore)}`}>
                          Risk: {log.riskScore}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action */}
                  <div className="font-semibold mb-1">{log.action}</div>

                  {/* Description */}
                  <div className="text-sm text-green-500/80 mb-2">{log.description}</div>

                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-xs text-green-500/50">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {log.userId}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    {log.resource && (
                      <span>
                        Resource: {log.resource}
                        {log.resourceId && ` (${log.resourceId})`}
                      </span>
                    )}
                  </div>

                  {/* Error Message */}
                  {log.errorMessage && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-500">
                      Error: {log.errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-green-500/70">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} logs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
