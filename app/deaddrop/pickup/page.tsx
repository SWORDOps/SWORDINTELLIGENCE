'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Download,
  Eye,
  EyeOff,
  Lock,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle,
  Activity,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeadDropPickupPage() {
  const router = useRouter();

  // State
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [dropInfo, setDropInfo] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load drop info
  const handleLoadInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codename) {
      setError('Codename required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/deaddrop/${codename.toUpperCase()}`);
      const data = await response.json();

      if (response.ok) {
        setDropInfo(data);
      } else {
        setError(data.error || 'Dead drop not found');
      }
    } catch (err) {
      setError('Failed to load dead drop');
    } finally {
      setLoading(false);
    }
  };

  // Download file
  const handleDownload = async () => {
    if (!password) {
      setError('Password required');
      return;
    }

    try {
      setDownloading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/deaddrop/${codename.toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Download failed');
        return;
      }

      // Check if burned
      const isBurned = response.headers.get('X-Burned') === 'true';
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

      let successMsg = `✓ Downloaded: ${filename}`;
      if (isBurned) {
        successMsg += '\n🔥 Dead drop has been burned and destroyed';
      }

      setSuccess(successMsg);

      // Reload info after download
      setTimeout(() => {
        handleLoadInfo(new Event('submit') as any);
      }, 1000);
    } catch (err) {
      setError('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Get warning style
  const getWarningStyle = (warning: string) => {
    if (warning.includes('URGENT') || warning.includes('LAST CHANCE')) {
      return 'bg-red-500/20 border-red-500 text-red-500';
    } else if (warning.includes('WARNING') || warning.includes('LIMITED')) {
      return 'bg-orange-500/20 border-orange-500 text-orange-500';
    } else if (warning.includes('BURN')) {
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
    } else {
      return 'bg-blue-500/20 border-blue-500 text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-10 h-10 text-accent" />
              <div>
                <h1 className="text-2xl font-bold">Dead Drop Pickup</h1>
                <p className="text-sm text-muted">Retrieve covert file transfer</p>
              </div>
            </div>
            <Button onClick={() => router.push('/deaddrop')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Drop
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/50">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-500">
              <strong>Intelligence Tradecraft:</strong> Enter the codename you received to retrieve the hidden file.
              The file was extracted from steganography-encoded image and decrypted with your password.
            </div>
          </div>
        </div>

        {/* Anonymity & Confidentiality Notice */}
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-500">
              <strong>Anonymity & Confidentiality:</strong> For maximum anonymity, we recommend accessing this service over the
              <strong> Onion Network (Tor)</strong> or <strong>I2P</strong>. All information submitted is treated with the utmost confidentiality
              and will be securely passed to relevant authorities when appropriate. Whistleblowers and sources are protected.
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-500 whitespace-pre-line">{success}</p>
          </div>
        )}

        {!dropInfo ? (
          /* Codename Entry Form */
          <form onSubmit={handleLoadInfo} className="space-y-6">
            <div className="p-8 rounded-lg border border-border bg-surface">
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-accent mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Enter Codename</h2>
                <p className="text-muted">Retrieve your dead drop using the codename</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Codename</label>
                <input
                  type="text"
                  value={codename}
                  onChange={(e) => setCodename(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g., DARK-WATER-7721"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-center text-xl font-mono tracking-wider"
                  autoCapitalize="characters"
                />
                <p className="text-xs text-muted mt-2 text-center">
                  Format: ADJECTIVE-NOUN-NNNN
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !codename}
                className="w-full mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Load Dead Drop
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Drop Info & Download */
          <div className="space-y-6">
            {/* Warnings */}
            {dropInfo.warnings && dropInfo.warnings.length > 0 && (
              <div className="space-y-3">
                {dropInfo.warnings.map((warning: string, i: number) => (
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

            {/* Drop Info Card */}
            <div className="p-6 rounded-lg border border-border bg-surface">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
                  <Lock className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{dropInfo.codename}</h2>
                <p className="text-sm text-muted">Dead Drop Status: {dropInfo.status.toUpperCase()}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-sm text-muted">Expires In</div>
                  <div className="text-lg font-bold">{dropInfo.timeRemaining.formatted}</div>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <Eye className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-sm text-muted">Accesses</div>
                  <div className="text-lg font-bold">
                    {dropInfo.retrievalCount} / {dropInfo.maxRetrievals > 0 ? dropInfo.maxRetrievals : '∞'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <Download className="w-6 h-6 text-accent mx-auto mb-2" />
                  <div className="text-sm text-muted">File Size</div>
                  <div className="text-lg font-bold">{(dropInfo.payloadSize / 1024).toFixed(2)} KB</div>
                </div>
              </div>

              {/* File Info */}
              <div className="p-4 rounded-lg bg-background border border-border mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Filename:</span>
                    <p className="font-semibold">{dropInfo.originalFilename}</p>
                  </div>
                  <div>
                    <span className="text-muted">Type:</span>
                    <p className="font-semibold">{dropInfo.mimeType}</p>
                  </div>
                  <div>
                    <span className="text-muted">Created:</span>
                    <p className="font-semibold">{new Date(dropInfo.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted">Steganography:</span>
                    <p className="font-semibold">{dropInfo.steganography.technique}</p>
                  </div>
                </div>
              </div>

              {/* Password Hint */}
              {dropInfo.passwordHint && (
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/50 mb-6">
                  <div className="text-sm">
                    <strong className="text-blue-500">Password Hint:</strong>
                    <p className="text-blue-500 mt-1">{dropInfo.passwordHint}</p>
                  </div>
                </div>
              )}

              {/* Password Input */}
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
                  🔒 Password is used to decrypt the file extracted from the steganography-encoded image
                </p>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={downloading || !password || dropInfo.status === 'burned'}
                className="w-full"
                size="lg"
              >
                {downloading ? (
                  <>
                    <Activity className="w-5 h-5 mr-2 animate-spin" />
                    Decrypting & Downloading...
                  </>
                ) : dropInfo.burnAfterReading ? (
                  <>
                    <Flame className="w-5 h-5 mr-2" />
                    Download & Burn
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </>
                )}
              </Button>

              {dropInfo.status === 'burned' && (
                <p className="text-center text-red-500 text-sm mt-4 font-semibold">
                  🔥 This dead drop has been burned and is no longer accessible
                </p>
              )}
            </div>

            {/* Security Info */}
            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent" />
                <span>Security Features</span>
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>LSB Steganography (Hidden in Image)</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>AES-256-GCM Encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>PBKDF2 Key Derivation (100,000 iterations)</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>No Authentication Required (Anonymous)</span>
                </div>
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span>Plausible Deniability</span>
                </div>
                {dropInfo.burnAfterReading && (
                  <div className="flex items-center space-x-2 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span>Burn After Reading</span>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            <Button
              onClick={() => {
                setDropInfo(null);
                setCodename('');
                setPassword('');
              }}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Enter Different Codename
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
