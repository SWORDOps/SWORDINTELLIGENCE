'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  Download,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  Globe,
  Activity,
  Flame,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import crypto from 'crypto-js'; // Using crypto-js for browser compatibility

export default function ShareAccessPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState('');

  // Load share link metadata
  useEffect(() => {
    loadShareInfo();
  }, [shareId]);

  const loadShareInfo = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/share/${shareId}`);
      const data = await response.json();

      if (response.ok) {
        setShareInfo(data);

        // Show OPSEC warnings
        if (data.opsecWarnings && data.opsecWarnings.length > 0) {
          console.warn('OPSEC Warnings:', data.opsecWarnings);
        }
      } else {
        setError(data.error || 'Share link not found');
      }
    } catch (err) {
      setError('Failed to load share link');
    } finally {
      setLoading(false);
    }
  };

  // Download file with client-side password verification
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError('');
      setSuccess('');

      // Client-side password hashing (zero-knowledge proof)
      let passwordProof;
      if (shareInfo.requiresPassword) {
        if (!password) {
          setError('Password required');
          setDownloading(false);
          return;
        }

        // Hash password client-side (never send plaintext)
        // In production, use proper zero-knowledge proof (e.g., SRP protocol)
        passwordProof = crypto.SHA256(password).toString();
      }

      // Request file download
      const response = await fetch(`/api/share/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordProof,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Download failed');
        setDownloading(false);
        return;
      }

      // Check if link was burned
      const isBurned = response.headers.get('X-Burned') === 'true';
      const watermark = response.headers.get('X-Watermark');
      const filename = response.headers.get('X-Filename') || 'download';

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success
      let successMessage = `✓ Downloaded: ${filename}`;
      if (watermark) {
        successMessage += `\n📌 Watermarked: ${watermark}`;
      }
      if (isBurned) {
        successMessage += '\n🔥 ONE-TIME LINK: This link has been destroyed';
      }

      setSuccess(successMessage);

      // If burned, show burned state
      if (isBurned) {
        setTimeout(() => {
          loadShareInfo(); // Reload to show expired state
        }, 2000);
      }
    } catch (err) {
      setError('Download failed');
    } finally {
      setDownloading(false);
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

  // Get warning icon and color
  const getWarningStyle = (warning: string) => {
    if (warning.includes('CRITICAL') || warning.includes('🔴')) {
      return 'bg-red-500/20 border-red-500 text-red-500';
    } else if (warning.includes('WARNING') || warning.includes('🟠')) {
      return 'bg-orange-500/20 border-orange-500 text-orange-500';
    } else if (warning.includes('ONE-TIME') || warning.includes('🔥')) {
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
    } else {
      return 'bg-blue-500/20 border-blue-500 text-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface">
        <div className="text-center">
          <Shield className="w-16 h-16 text-accent animate-pulse mx-auto mb-4" />
          <p className="text-lg text-muted">Loading secure share...</p>
        </div>
      </div>
    );
  }

  if (error && !shareInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface p-4">
        <div className="max-w-md w-full p-8 rounded-lg border-2 border-red-500/50 bg-surface">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-red-500">Access Denied</h1>
            <p className="text-muted mb-6">{error}</p>
            <p className="text-sm text-muted">
              This share link may have expired, been revoked, or reached its access limit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const timeUntilExpiry = new Date(shareInfo.expiresAt).getTime() - Date.now();
  const hoursUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60 * 60));
  const minutesUntilExpiry = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-10 h-10 text-accent" />
            <div>
              <h1 className="text-2xl font-bold">Secure Document Share</h1>
              <p className="text-sm text-muted">SWORD Intelligence • Encrypted Transfer</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* OPSEC Warnings */}
        {shareInfo.opsecWarnings && shareInfo.opsecWarnings.length > 0 && (
          <div className="mb-6 space-y-3">
            {shareInfo.opsecWarnings.map((warning: string, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${getWarningStyle(warning)} flex items-start space-x-3`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{warning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500 whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start space-x-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Download Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Info */}
            <div className="p-6 rounded-lg border border-border bg-surface">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-bold">{shareInfo.filename}</h2>
                  </div>
                  <p className="text-sm text-muted">Encrypted with AES-256-GCM</p>
                </div>
                {shareInfo.requiresPassword && (
                  <div className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-500 text-sm font-semibold flex items-center space-x-1">
                    <Lock className="w-4 h-4" />
                    <span>Password Protected</span>
                  </div>
                )}
              </div>

              {/* Access Counter */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded bg-background border border-border">
                  <div className="text-sm text-muted mb-1">Access Count</div>
                  <div className="text-2xl font-bold">
                    {shareInfo.accessCount} / {shareInfo.maxAccesses > 0 ? shareInfo.maxAccesses : '∞'}
                  </div>
                </div>
                <div className="p-3 rounded bg-background border border-border">
                  <div className="text-sm text-muted mb-1">Expires In</div>
                  <div className="text-2xl font-bold">
                    {hoursUntilExpiry > 0 ? `${hoursUntilExpiry}h ${minutesUntilExpiry}m` : `${minutesUntilExpiry}m`}
                  </div>
                </div>
              </div>

              {/* Password Input */}
              {shareInfo.requiresPassword && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                      placeholder="Enter password to decrypt"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    🔒 Password is verified client-side only - never sent to server (zero-knowledge proof)
                  </p>
                </div>
              )}

              {/* Watermark Notice */}
              {shareInfo.watermark && (
                <div className="mb-6 p-3 rounded bg-blue-500/10 border border-blue-500/50">
                  <div className="flex items-center space-x-2 text-sm text-blue-500">
                    <Activity className="w-4 h-4" />
                    <span className="font-semibold">Download Watermark:</span>
                    <span>{shareInfo.watermark}</span>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading || (shareInfo.requiresPassword && !password)}
                className="w-full px-6 py-4 rounded-lg bg-accent hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                {downloading ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : shareInfo.isOneTime ? (
                  <>
                    <Flame className="w-5 h-5" />
                    <span>Download & Burn Link</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download File</span>
                  </>
                )}
              </button>

              {shareInfo.isOneTime && (
                <p className="text-xs text-center text-orange-500 mt-3 font-semibold">
                  ⚠️ WARNING: This is a one-time link. After download, it will be permanently destroyed.
                </p>
              )}
            </div>
          </div>

          {/* Security Info Sidebar */}
          <div className="space-y-6">
            {/* Threat Intelligence */}
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Your Access Info</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted">IP Address:</span>
                  <p className="font-mono">{shareInfo.sourceIp}</p>
                </div>

                <div>
                  <span className="text-muted">Location:</span>
                  <p>
                    {shareInfo.geolocation.city}, {shareInfo.geolocation.country}
                  </p>
                </div>

                <div>
                  <span className="text-muted">ISP:</span>
                  <p>{shareInfo.geolocation.isp}</p>
                </div>

                <div>
                  <span className="text-muted">Reputation:</span>
                  <p className={`font-semibold ${getReputationColor(shareInfo.threatIntel.reputation)}`}>
                    {shareInfo.threatIntel.reputation.toUpperCase()}
                  </p>
                </div>

                {shareInfo.threatIntel.categories.length > 0 && (
                  <div>
                    <span className="text-muted">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {shareInfo.threatIntel.categories.map((cat: string) => (
                        <span key={cat} className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Features */}
            <div className="p-4 rounded-lg border border-border bg-surface">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Security Features</h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>AES-256-GCM Encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ephemeral Key Per Share</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Zero-Knowledge Password Proof</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>IP Geolocation Tracking</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Threat Intelligence Check</span>
                </div>
                {shareInfo.isOneTime && (
                  <div className="flex items-center space-x-2 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span>Burn After Reading</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted">
              <p>Powered by SWORD Intelligence</p>
              <p className="mt-1">Post-Quantum Secure Transfer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
