'use client';

/**
 * Admin Vault Oversight
 *
 * Monitor all documents and shares system-wide
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  FileText,
  Share2,
  Eye,
  Download,
  Users,
  Clock,
  AlertTriangle,
  Activity,
  HardDrive,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface VaultStats {
  totalDocuments: number;
  totalSize: number;
  byUser: Record<string, number>;
  byMimeType: Record<string, number>;
  totalShares: number;
  activeShares: number;
  totalAccesses: number;
}

interface Document {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  versionCount: number;
}

interface ShareLink {
  shareId: string;
  documentId: string;
  filename: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  accessCount: number;
  maxAccesses?: number;
  requirePassword: boolean;
  expired: boolean;
}

export default function VaultOversightPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'shares'>('documents');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadVaultData();
    }
  }, [status]);

  const loadVaultData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/vault');

      if (res.status === 403) {
        setError('Access Denied: Insufficient permissions');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load vault data');
      }

      const data = await res.json();
      setStats(data.stats);
      setDocuments(data.recentDocuments);
      setShares(data.recentShares);
      setError('');
    } catch (err: any) {
      console.error('Vault data load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div>Loading vault data...</div>
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
              <Lock className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Vault Oversight</h1>
            </div>
            <p className="text-green-500/70">
              Monitor all documents and secure shares
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
            <FileText className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-green-500/50">DOCUMENTS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalDocuments} />
          </div>
          <div className="text-sm text-green-500/70">
            Total stored
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <HardDrive className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-green-500/50">STORAGE</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            {formatBytes(stats.totalSize).split(' ')[0]}
          </div>
          <div className="text-sm text-green-500/70">
            {formatBytes(stats.totalSize).split(' ')[1]} used
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Share2 className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-green-500/50">SHARES</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.activeShares} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.totalShares} total
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Eye className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500/50">ACCESSES</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalAccesses} />
          </div>
          <div className="text-sm text-green-500/70">
            Total views
          </div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* By User */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Documents by User
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byUser)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([user, count]) => (
                <div key={user} className="flex items-center justify-between">
                  <span className="text-sm text-green-500/70 truncate">{user}</span>
                  <span className="text-sm font-mono font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* By Type */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Documents by Type
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byMimeType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-green-500/70 capitalize">{type}</span>
                  <span className="text-sm font-mono font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-green-500 text-black'
              : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Recent Documents
        </button>
        <button
          onClick={() => setActiveTab('shares')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'shares'
              ? 'bg-green-500 text-black'
              : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
          }`}
        >
          <Share2 className="w-4 h-4 inline mr-2" />
          Share Links
        </button>
      </div>

      {/* Documents Table */}
      {activeTab === 'documents' && (
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-500/10 border-b border-green-500/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Versions</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/20">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-green-500/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-500/50" />
                      <span className="font-medium truncate max-w-xs">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-500/70">{doc.uploadedBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{formatBytes(doc.size)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-green-500/10 px-2 py-1 rounded">
                      {doc.mimeType.split('/')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{doc.versionCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-green-500/50" />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shares Table */}
      {activeTab === 'shares' && (
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-500/10 border-b border-green-500/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Security</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Accesses</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/20">
              {shares.map((share) => (
                <tr key={share.shareId} className="hover:bg-green-500/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-green-500/50" />
                      <span className="font-medium truncate max-w-xs">{share.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-500/70">{share.createdBy}</span>
                  </td>
                  <td className="px-6 py-4">
                    {share.expired ? (
                      <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                        Expired
                      </span>
                    ) : (
                      <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {share.requirePassword && (
                      <Lock className="w-4 h-4 text-yellow-500" title="Password protected" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">
                      {share.accessCount}
                      {share.maxAccesses && ` / ${share.maxAccesses}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {share.expiresAt ? (
                      <div className="text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-green-500/50" />
                        {new Date(share.expiresAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-sm text-green-500/50">Never</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
