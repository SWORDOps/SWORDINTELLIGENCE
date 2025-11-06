'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Upload,
  Download,
  Eye,
  Share2,
  Lock,
  FileText,
  Clock,
  AlertTriangle,
  Check,
  X,
  Filter,
  Search,
  History,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
type Classification = 'TOP SECRET' | 'SECRET' | 'CONFIDENTIAL' | 'RESTRICTED' | 'UNCLASSIFIED';
type TLP = 'RED' | 'AMBER' | 'GREEN' | 'WHITE';
type VersionStatus = 'DRAFT' | 'REVIEW' | 'FINAL' | 'AMENDED' | 'REDACTED' | 'SUPERSEDED';

interface Document {
  id: string;
  filename: string;
  classification: Classification;
  tlp: TLP;
  size: number;
  encryptedAt: string;
  expiresAt?: string;
  ownerId: string;
  allowedUsers: string[];
  tags: string[];
  engagementId?: string;
  encryptionMode: 'kyber' | 'hybrid';
  hasSignature: boolean;
}

interface Version {
  versionId: string;
  versionNumber: number;
  filename: string;
  fileSize: number;
  status: VersionStatus;
  createdAt: string;
  createdBy: string;
  comment?: string;
  contentHash: string;
  chainHash: string;
}

interface ShareLink {
  shareId: string;
  documentId: string;
  filename: string;
  url: string;
  expiresAt: string;
  maxAccesses: number;
  accessCount: number;
  requiresPassword: boolean;
  isRevoked: boolean;
}

export default function VaultPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [classificationFilter, setClassificationFilter] = useState<Classification | ''>('');
  const [tlpFilter, setTlpFilter] = useState<TLP | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadClassification, setUploadClassification] = useState<Classification>('UNCLASSIFIED');
  const [uploadTlp, setUploadTlp] = useState<TLP>('WHITE');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadEngagement, setUploadEngagement] = useState('');
  const [uploadCaveats, setUploadCaveats] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);

  // Share form
  const [shareExpiration, setShareExpiration] = useState(86400); // 24 hours
  const [shareMaxAccesses, setShareMaxAccesses] = useState(1);
  const [sharePassword, setSharePassword] = useState('');
  const [shareAllowedIPs, setShareAllowedIPs] = useState('');

  // New version form
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [newVersionStatus, setNewVersionStatus] = useState<VersionStatus>('DRAFT');
  const [newVersionComment, setNewVersionComment] = useState('');
  const [newVersionReason, setNewVersionReason] = useState('');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    }
  }, [status, router]);

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (classificationFilter) params.append('classification', classificationFilter);
      if (tlpFilter) params.append('tlp', tlpFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/vault/documents?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDocuments(data.documents);
      } else {
        setError(data.error || 'Failed to load documents');
      }
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [classificationFilter, tlpFilter, searchQuery]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadDocuments();
    }
  }, [status, loadDocuments]);

  // Upload document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('classification', uploadClassification);
      formData.append('tlp', uploadTlp);
      formData.append('tags', uploadTags);
      if (uploadEngagement) formData.append('engagementId', uploadEngagement);
      if (uploadCaveats) formData.append('caveats', uploadCaveats);

      const response = await fetch('/api/vault/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Document encrypted successfully with ${data.encryption.algorithm}`);
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTags('');
        setUploadEngagement('');
        setUploadCaveats('');
        loadDocuments();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Download document
  const handleDownload = async (documentId: string, filename: string) => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch(`/api/vault/download/${documentId}`);

      if (response.ok) {
        const signatureVerified = response.headers.get('X-Signature-Verified') === 'true';
        const encryptionAlg = response.headers.get('X-Encryption-Algorithm');

        if (signatureVerified) {
          setSuccess(`Signature verified ✓ Decrypted with ${encryptionAlg}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        setError(data.error || 'Download failed');
      }
    } catch (err) {
      setError('Download failed');
    }
  };

  // Load versions
  const loadVersions = async (documentId: string) => {
    try {
      setError('');
      const response = await fetch(`/api/vault/versions/${documentId}?verifyChain=true`);
      const data = await response.json();

      if (response.ok) {
        setVersions(data.versions);
        if (data.chainVerification && data.chainVerification.valid) {
          setSuccess(`Chain-of-custody verified ✓ ${data.totalVersions} versions`);
        } else if (data.chainVerification) {
          setError(`Chain broken: ${data.chainVerification.brokenLinks.length} breaks`);
        }
      } else {
        setError(data.error || 'Failed to load versions');
      }
    } catch (err) {
      setError('Failed to load versions');
    }
  };

  // Create share link
  const handleCreateShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/vault/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          expiresIn: shareExpiration,
          maxAccesses: shareMaxAccesses,
          password: sharePassword || undefined,
          allowedIPs: shareAllowedIPs ? shareAllowedIPs.split(',').map(ip => ip.trim()) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Share link created: ${data.url}`);
        setShowShareModal(false);
        setSharePassword('');
        setShareAllowedIPs('');
        loadShareLinks(selectedDoc.id);
      } else {
        setError(data.error || 'Failed to create share link');
      }
    } catch (err) {
      setError('Failed to create share link');
    }
  };

  // Load share links
  const loadShareLinks = async (documentId: string) => {
    try {
      const response = await fetch(`/api/vault/share?documentId=${documentId}`);
      const data = await response.json();

      if (response.ok) {
        setShareLinks(data.shares);
      }
    } catch (err) {
      console.error('Failed to load share links:', err);
    }
  };

  // Upload new version
  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !newVersionFile) return;

    try {
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('documentId', selectedDoc.id);
      formData.append('file', newVersionFile);
      formData.append('status', newVersionStatus);
      if (newVersionComment) formData.append('comment', newVersionComment);
      if (newVersionReason) formData.append('changeReason', newVersionReason);

      const response = await fetch('/api/vault/version', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Version ${data.versionNumber} created with ${data.signature.algorithm}`);
        setShowNewVersionModal(false);
        setNewVersionFile(null);
        setNewVersionComment('');
        setNewVersionReason('');
        loadVersions(selectedDoc.id);
      } else {
        setError(data.error || 'Failed to create version');
      }
    } catch (err) {
      setError('Failed to create version');
    }
  };

  // Classification colors
  const getClassificationColor = (classification: Classification) => {
    switch (classification) {
      case 'TOP SECRET': return 'bg-red-500/20 text-red-500 border-red-500';
      case 'SECRET': return 'bg-orange-500/20 text-orange-500 border-orange-500';
      case 'CONFIDENTIAL': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'RESTRICTED': return 'bg-blue-500/20 text-blue-500 border-blue-500';
      case 'UNCLASSIFIED': return 'bg-green-500/20 text-green-500 border-green-500';
    }
  };

  // TLP colors
  const getTlpColor = (tlp: TLP) => {
    switch (tlp) {
      case 'RED': return 'bg-red-600 text-white';
      case 'AMBER': return 'bg-amber-600 text-white';
      case 'GREEN': return 'bg-green-600 text-white';
      case 'WHITE': return 'bg-gray-600 text-white';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-muted">Loading vault...</p>
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
                <Shield className="w-8 h-8 text-accent" />
                <h1 className="text-3xl font-bold">Post-Quantum Document Vault</h1>
              </div>
              <p className="text-muted">
                Kyber-768 encryption • Dilithium-3 signatures • Chain-of-custody verification
              </p>
            </div>
            <Button onClick={() => setShowUploadModal(true)} size="lg">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
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
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500">{success}</p>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-4 h-4 text-green-500" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="p-4 rounded-lg border border-border bg-surface">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-muted" />

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filenames..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Classification filter */}
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value as Classification | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Classifications</option>
              <option value="TOP SECRET">TOP SECRET</option>
              <option value="SECRET">SECRET</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="RESTRICTED">RESTRICTED</option>
              <option value="UNCLASSIFIED">UNCLASSIFIED</option>
            </select>

            {/* TLP filter */}
            <select
              value={tlpFilter}
              onChange={(e) => setTlpFilter(e.target.value as TLP | '')}
              className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All TLP</option>
              <option value="RED">TLP:RED</option>
              <option value="AMBER">TLP:AMBER</option>
              <option value="GREEN">TLP:GREEN</option>
              <option value="WHITE">TLP:WHITE</option>
            </select>

            <Button onClick={loadDocuments} variant="outline">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-accent animate-pulse mx-auto mb-4" />
            <p className="text-muted">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted mb-4">No documents found</p>
            <Button onClick={() => setShowUploadModal(true)}>
              Upload your first document
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-semibold">{doc.filename}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded border ${getClassificationColor(doc.classification)}`}>
                        {doc.classification}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getTlpColor(doc.tlp)}`}>
                        TLP:{doc.tlp}
                      </span>
                      {doc.hasSignature && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-500 border border-green-500">
                          ✓ Signed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-muted mt-4">
                      <div>
                        <strong>Size:</strong> {(doc.size / 1024).toFixed(2)} KB
                      </div>
                      <div>
                        <strong>Encrypted:</strong> {new Date(doc.encryptedAt).toLocaleString()}
                      </div>
                      <div>
                        <strong>Encryption:</strong> {doc.encryptionMode.toUpperCase()}
                      </div>
                    </div>

                    {doc.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 text-xs rounded bg-accent/10 text-accent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleDownload(doc.id, doc.filename)}
                      className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        loadVersions(doc.id);
                        setShowVersionsModal(true);
                      }}
                      className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                      title="Version History"
                    >
                      <History className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        loadShareLinks(doc.id);
                        setShowShareModal(true);
                      }}
                      className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Upload Encrypted Document</h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-6">
              {/* File input */}
              <div>
                <label className="block text-sm font-medium mb-2">Document File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Classification */}
              <div>
                <label className="block text-sm font-medium mb-2">Classification Level</label>
                <select
                  value={uploadClassification}
                  onChange={(e) => setUploadClassification(e.target.value as Classification)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="UNCLASSIFIED">UNCLASSIFIED</option>
                  <option value="RESTRICTED">RESTRICTED</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="SECRET">SECRET</option>
                  <option value="TOP SECRET">TOP SECRET</option>
                </select>
              </div>

              {/* TLP */}
              <div>
                <label className="block text-sm font-medium mb-2">Traffic Light Protocol</label>
                <select
                  value={uploadTlp}
                  onChange={(e) => setUploadTlp(e.target.value as TLP)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="WHITE">TLP:WHITE (No restrictions)</option>
                  <option value="GREEN">TLP:GREEN (Community only)</option>
                  <option value="AMBER">TLP:AMBER (Limited distribution)</option>
                  <option value="RED">TLP:RED (Eyes only)</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="malware, apt28, ransomware"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Engagement ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Engagement ID (optional)</label>
                <input
                  type="text"
                  value={uploadEngagement}
                  onChange={(e) => setUploadEngagement(e.target.value)}
                  placeholder="ENG-2024-001"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Caveats */}
              <div>
                <label className="block text-sm font-medium mb-2">Caveats (comma-separated, optional)</label>
                <input
                  type="text"
                  value={uploadCaveats}
                  onChange={(e) => setUploadCaveats(e.target.value)}
                  placeholder="NOFORN, ORCON"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading || !uploadFile}>
                  {uploading ? 'Encrypting...' : 'Encrypt & Upload'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Versions Modal */}
      {showVersionsModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Version History</h2>
                <p className="text-sm text-muted">{selectedDoc.filename}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setShowNewVersionModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Version
                </Button>
                <button onClick={() => setShowVersionsModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {versions.length === 0 ? (
                <p className="text-center text-muted py-8">No versions yet</p>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <div key={version.versionId} className="p-4 rounded-lg border border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-lg">v{version.versionNumber}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              version.status === 'FINAL' ? 'bg-green-500/20 text-green-500' :
                              version.status === 'DRAFT' ? 'bg-blue-500/20 text-blue-500' :
                              version.status === 'REVIEW' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-gray-500/20 text-gray-500'
                            }`}>
                              {version.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted mb-2">{version.filename}</p>
                          {version.comment && (
                            <p className="text-sm mb-2">
                              <strong>Comment:</strong> {version.comment}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                            <div><strong>Created:</strong> {new Date(version.createdAt).toLocaleString()}</div>
                            <div><strong>By:</strong> {version.createdBy}</div>
                            <div><strong>Size:</strong> {(version.fileSize / 1024).toFixed(2)} KB</div>
                            <div><strong>Chain Hash:</strong> {version.chainHash}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Download version via API
                            fetch(`/api/vault/versions/${selectedDoc.id}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ versionNumber: version.versionNumber }),
                            }).then(async (response) => {
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = version.filename;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              }
                            });
                          }}
                          className="p-2 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/10"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showNewVersionModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-2xl w-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Upload New Version</h2>
              <button onClick={() => setShowNewVersionModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadVersion} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">File</label>
                <input
                  type="file"
                  onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={newVersionStatus}
                  onChange={(e) => setNewVersionStatus(e.target.value as VersionStatus)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="FINAL">FINAL</option>
                  <option value="AMENDED">AMENDED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Version Comment</label>
                <input
                  type="text"
                  value={newVersionComment}
                  onChange={(e) => setNewVersionComment(e.target.value)}
                  placeholder="Fixed typos, updated analysis..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Change Reason</label>
                <input
                  type="text"
                  value={newVersionReason}
                  onChange={(e) => setNewVersionReason(e.target.value)}
                  placeholder="Why this version was created..."
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowNewVersionModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newVersionFile}>
                  Create Version
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg border border-border max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Secure Share Links</h2>
                <p className="text-sm text-muted">{selectedDoc.filename}</p>
              </div>
              <button onClick={() => setShowShareModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Create new share link form */}
              <form onSubmit={handleCreateShare} className="space-y-4 mb-6 p-4 rounded-lg border border-border bg-background">
                <h3 className="font-semibold">Create New Share Link</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expires In (seconds)</label>
                    <input
                      type="number"
                      value={shareExpiration}
                      onChange={(e) => setShareExpiration(parseInt(e.target.value))}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
                    />
                    <p className="text-xs text-muted mt-1">
                      {Math.floor(shareExpiration / 3600)}h {Math.floor((shareExpiration % 3600) / 60)}m
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Accesses</label>
                    <input
                      type="number"
                      value={shareMaxAccesses}
                      onChange={(e) => setShareMaxAccesses(parseInt(e.target.value))}
                      min={0}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
                    />
                    <p className="text-xs text-muted mt-1">0 = unlimited</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password (optional)</label>
                  <input
                    type="password"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Leave blank for no password"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Allowed IPs (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={shareAllowedIPs}
                    onChange={(e) => setShareAllowedIPs(e.target.value)}
                    placeholder="192.168.1.0/24, 10.0.0.1"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-surface"
                  />
                </div>

                <Button type="submit">Create Share Link</Button>
              </form>

              {/* Existing share links */}
              <div>
                <h3 className="font-semibold mb-4">Existing Share Links</h3>
                {shareLinks.length === 0 ? (
                  <p className="text-center text-muted py-4">No share links yet</p>
                ) : (
                  <div className="space-y-3">
                    {shareLinks.map((link) => (
                      <div key={link.shareId} className="p-4 rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <code className="text-xs bg-accent/10 px-2 py-1 rounded">{link.url}</code>
                              {link.requiresPassword && (
                                <span className="px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-500">
                                  <Lock className="w-3 h-3 inline mr-1" />
                                  Password
                                </span>
                              )}
                              {link.isRevoked && (
                                <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-500">
                                  Revoked
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                              <div><strong>Expires:</strong> {new Date(link.expiresAt).toLocaleString()}</div>
                              <div><strong>Accesses:</strong> {link.accessCount}/{link.maxAccesses || '∞'}</div>
                              <div><strong>ShareID:</strong> {link.shareId.substring(0, 8)}...</div>
                            </div>
                          </div>
                          {!link.isRevoked && (
                            <button
                              onClick={() => {
                                if (confirm('Revoke this share link?')) {
                                  fetch('/api/vault/share', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      shareId: link.shareId,
                                      reason: 'User revoked',
                                    }),
                                  }).then(() => loadShareLinks(selectedDoc.id));
                                }
                              }}
                              className="p-2 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
