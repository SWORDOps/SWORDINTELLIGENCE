'use client';

/**
 * Admin Dashboard
 *
 * Comprehensive system oversight and management
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Lock,
  Zap,
  MessageSquare,
  AlertTriangle,
  Activity,
  TrendingUp,
  Eye,
  Settings,
  BarChart3,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface SystemStats {
  audit: {
    totalEvents: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    successRate: number;
    highRiskEvents: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  vault: {
    totalDocuments: number;
    totalSize: number;
    byMimeType: Record<string, number>;
  };
  canary: {
    totalTokens: number;
    activeTokens: number;
    totalTriggers: number;
    recentTriggers: number;
    byType: Record<string, number>;
  };
  deadDrops: {
    total: number;
    active: number;
    pickedUp: number;
    expired: number;
  };
  messaging: {
    totalRooms: number;
    activeRooms: number;
    totalMembers: number;
    totalMessages: number;
  };
  threats: {
    total: number;
    active: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    totalIOCs: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadStats();
    }
  }, [status, timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats?days=${timeRange}`);

      if (res.status === 403) {
        setError('Access Denied: Admin privileges required');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load statistics');
      }

      const data = await res.json();
      setStats(data);
      setError('');
    } catch (err: any) {
      console.error('Stats load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div>Loading admin dashboard...</div>
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
            onClick={() => router.push('/portal/dashboard')}
            className="mt-4 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold">System Administration</h1>
            </div>
            <p className="text-green-500/70">
              Complete operational oversight and control
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-green-500/70">Period:</span>
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeRange === days
                    ? 'bg-green-500 text-black font-semibold'
                    : 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-green-500/50">USERS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.users.total} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.users.active} active • {stats.users.byRole.admin || 0} admins
          </div>
        </div>

        {/* Vault */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Lock className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-green-500/50">VAULT</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.vault.totalDocuments} />
          </div>
          <div className="text-sm text-green-500/70">
            {formatBytes(stats.vault.totalSize)} stored
          </div>
        </div>

        {/* Canary Tokens */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-green-500/50">CANARY</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.canary.totalTriggers} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.canary.recentTriggers} in last {timeRange}d
          </div>
        </div>

        {/* Threat Intel */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-xs text-green-500/50">THREATS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.threats.total} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.threats.active} active • {stats.threats.totalIOCs} IOCs
          </div>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Audit Events */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Audit Events
            </h3>
            <span className="text-2xl font-mono font-bold">
              <AnimatedCounter end={stats.audit.totalEvents} />
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Success Rate</span>
              <span className="text-sm font-semibold">{stats.audit.successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-green-500/10 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${stats.audit.successRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm pt-2">
              <span className="text-red-500 flex items-center">
                <AlertOctagon className="w-4 h-4 mr-1" />
                High Risk: {stats.audit.highRiskEvents}
              </span>
            </div>
          </div>
        </div>

        {/* Messaging */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Secure Messaging
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Active Rooms</span>
              <span className="text-xl font-mono font-bold">{stats.messaging.activeRooms}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Total Messages</span>
              <span className="text-xl font-mono font-bold">{stats.messaging.totalMessages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Members</span>
              <span className="text-xl font-mono font-bold">{stats.messaging.totalMembers}</span>
            </div>
          </div>
        </div>

        {/* Dead Drops */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Dead Drops
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Active</span>
              <span className="text-xl font-mono font-bold text-blue-500">{stats.deadDrops.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Picked Up</span>
              <span className="text-xl font-mono font-bold text-green-500">{stats.deadDrops.pickedUp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-500/70">Expired</span>
              <span className="text-xl font-mono font-bold text-yellow-500">{stats.deadDrops.expired}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Link
          href="/portal/admin/users"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">User Management</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Manage users, roles, and permissions
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.users.total} users</span>
            <span className="text-green-500/50">•</span>
            <span className="text-yellow-500">{stats.users.byRole.admin || 0} admins</span>
          </div>
        </Link>

        {/* Audit Logs */}
        <Link
          href="/portal/admin/audit"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <FileText className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Audit Logs</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Complete system activity audit trail
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.audit.totalEvents} events</span>
            <span className="text-green-500/50">•</span>
            <span className="text-red-500">{stats.audit.highRiskEvents} high-risk</span>
          </div>
        </Link>

        {/* Vault Oversight */}
        <Link
          href="/portal/admin/vault"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <Lock className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Vault Oversight</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Monitor all documents and access logs
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.vault.totalDocuments} docs</span>
            <span className="text-green-500/50">•</span>
            <span className="text-blue-500">{formatBytes(stats.vault.totalSize)}</span>
          </div>
        </Link>

        {/* Canary Tokens */}
        <Link
          href="/portal/admin/canary"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <Zap className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Canary Tokens</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Monitor data exfiltration attempts
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.canary.totalTokens} tokens</span>
            <span className="text-green-500/50">•</span>
            <span className="text-red-500">{stats.canary.totalTriggers} triggered</span>
          </div>
        </Link>

        {/* Messaging Oversight */}
        <Link
          href="/portal/admin/messaging"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <MessageSquare className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Messaging Oversight</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Monitor secure communications
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.messaging.activeRooms} rooms</span>
            <span className="text-green-500/50">•</span>
            <span className="text-blue-500">{stats.messaging.totalMessages} messages</span>
          </div>
        </Link>

        {/* Threat Intelligence */}
        <Link
          href="/portal/admin/threats"
          className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500 transition-colors group"
        >
          <div className="flex items-start justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-500/50">→</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Threat Intel Admin</h3>
          <p className="text-sm text-green-500/70 mb-4">
            Manage threat feed and IOCs
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-500">{stats.threats.total} threats</span>
            <span className="text-green-500/50">•</span>
            <span className="text-orange-500">{stats.threats.totalIOCs} IOCs</span>
          </div>
        </Link>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-500/80">
            <strong>Admin Access Logged:</strong> All administrative actions are logged in the audit trail.
            Unauthorized access attempts will trigger security alerts.
          </div>
        </div>
      </div>
    </div>
  );
}
