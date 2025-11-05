'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle,
  Copy,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeadDropPage() {
  const router = useRouter();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ttl, setTtl] = useState(86400); // 24 hours
  const [maxRetrievals, setMaxRetrievals] = useState(1);
  const [burnAfterReading, setBurnAfterReading] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [tags, setTags] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !password) {
      setError('File and password are required');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      if (passwordHint) formData.append('passwordHint', passwordHint);
      formData.append('ttl', ttl.toString());
      formData.append('maxRetrievals', maxRetrievals.toString());
      formData.append('burnAfterReading', burnAfterReading.toString());
      if (coverImage) formData.append('coverImage', coverImage);
      if (tags) formData.append('tags', tags);

      const response = await fetch('/api/deaddrop', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Format TTL display
  const formatTTL = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
        {/* Header */}
        <div className="border-b border-border bg-surface/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold">Dead Drop Created</h1>
                <p className="text-sm text-muted">File hidden using steganography</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Success Card */}
          <div className="p-8 rounded-lg border-2 border-green-500/50 bg-surface">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                <Lock className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Codename: {result.codename}</h2>
              <p className="text-muted">Share this codename and password with the recipient</p>
            </div>

            {/* Codename Box */}
            <div className="p-6 rounded-lg bg-background border border-border mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted">CODENAME</span>
                <button
                  onClick={() => copyToClipboard(result.codename)}
                  className="text-accent hover:text-accent/80 flex items-center space-x-1 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="text-3xl font-bold font-mono text-center tracking-wider">
                {result.codename}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-background border border-border text-center">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-sm text-muted">Expires In</div>
                <div className="text-lg font-bold">{result.ttl.formatted}</div>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border text-center">
                <Eye className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-sm text-muted">Max Access</div>
                <div className="text-lg font-bold">
                  {result.maxRetrievals > 0 ? result.maxRetrievals : '∞'}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border text-center">
                <ImageIcon className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="text-sm text-muted">Image Size</div>
                <div className="text-lg font-bold">{result.steganography.imageSize}</div>
              </div>
            </div>

            {/* Steganography Info */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/50 mb-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-500">
                  <strong>Steganography Active:</strong> Your file ({(result.steganography.payloadSize / 1024).toFixed(2)} KB)
                  has been encrypted and hidden inside an innocent-looking image. Capacity utilization: {result.steganography.utilization}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Instructions for Recipient</h3>

              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="font-semibold mb-2 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-sm">1</span>
                  <span>Visit the dead drop pickup page</span>
                </div>
                <p className="text-sm text-muted ml-8">
                  Navigate to: <code className="px-2 py-1 rounded bg-surface">
                    {window.location.origin}/deaddrop/pickup
                  </code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="font-semibold mb-2 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-sm">2</span>
                  <span>Enter the codename</span>
                </div>
                <p className="text-sm text-muted ml-8">
                  Codename: <code className="px-2 py-1 rounded bg-surface font-mono">{result.codename}</code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background border border-border">
                <div className="font-semibold mb-2 flex items-center space-x-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-sm">3</span>
                  <span>Provide the password</span>
                </div>
                <p className="text-sm text-muted ml-8">
                  Password must be communicated through a separate secure channel
                  {passwordHint && ` (Hint: ${passwordHint})`}
                </p>
              </div>
            </div>

            {/* Warnings */}
            {result.burnAfterReading && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/50 mb-6">
                <div className="flex items-start space-x-3">
                  <Flame className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-500">
                    <strong>BURN AFTER READING:</strong> This dead drop will self-destruct after {result.maxRetrievals} retrieval{result.maxRetrievals > 1 ? 's' : ''}.
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-500">
                  <strong>OPSEC WARNING:</strong> {result.instructions.expiration} Communicate codename and password through separate secure channels.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <Button onClick={() => setResult(null)} variant="outline">
                Create Another Drop
              </Button>
              <Button onClick={() => router.push('/deaddrop/pickup')}>
                Go to Pickup Page
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-10 h-10 text-accent" />
              <div>
                <h1 className="text-2xl font-bold">Steganographic Dead Drop</h1>
                <p className="text-sm text-muted">Anonymous covert file transfer • Hide in plain sight</p>
              </div>
            </div>
            <Button onClick={() => router.push('/deaddrop/pickup')} variant="outline">
              Pickup Drop
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
              <strong>Intelligence Tradecraft:</strong> Your file will be encrypted and hidden inside an innocent-looking image using LSB steganography.
              No authentication required - perfect for anonymous drops and covert communication.
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

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Upload */}
          <div className="p-6 rounded-lg border-2 border-dashed border-border bg-surface hover:border-accent/50 transition-colors">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block text-center">
              {file ? (
                <div>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-muted mx-auto mb-3" />
                  <p className="font-semibold mb-1">Click to upload file</p>
                  <p className="text-sm text-muted">Any file type supported</p>
                </div>
              )}
            </label>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Strong password for encryption"
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
            <p className="text-xs text-muted mt-1">
              File will be encrypted with this password before embedding
            </p>
          </div>

          {/* Password Hint */}
          <div>
            <label className="block text-sm font-medium mb-2">Password Hint (optional)</label>
            <input
              type="text"
              value={passwordHint}
              onChange={(e) => setPasswordHint(e.target.value)}
              placeholder="e.g., Name of your first pet"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Advanced Options */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <h3 className="font-semibold mb-4">Advanced Options</h3>

            <div className="space-y-4">
              {/* TTL */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Time to Live: {formatTTL(ttl)}
                </label>
                <input
                  type="range"
                  min="3600"
                  max="604800"
                  step="3600"
                  value={ttl}
                  onChange={(e) => setTtl(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>1 hour</span>
                  <span>1 week</span>
                </div>
              </div>

              {/* Max Retrievals */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Retrievals: {maxRetrievals === 0 ? 'Unlimited' : maxRetrievals}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={maxRetrievals}
                  onChange={(e) => setMaxRetrievals(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>Unlimited</span>
                  <span>10 times</span>
                </div>
              </div>

              {/* Burn After Reading */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center space-x-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="font-semibold">Burn After Reading</div>
                    <div className="text-sm text-muted">Self-destruct after first retrieval</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={burnAfterReading}
                    onChange={(e) => setBurnAfterReading(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/png"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm"
                />
                <p className="text-xs text-muted mt-1">
                  {coverImage ? `Using: ${coverImage.name}` : 'Leave empty to auto-generate a decoy image'}
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="classified, operation-thunder, urgent"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={uploading || !file || !password}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Embedding with Steganography...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Create Dead Drop
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
