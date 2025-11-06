'use client';

/**
 * Steganography Interface
 *
 * Hide files inside images using LSB (Least Significant Bit) steganography.
 * Classic espionage technique: invisible to human eye, detectable only with analysis.
 *
 * Features:
 * - Embed files into carrier images (PNG)
 * - Extract hidden files from steganographic images
 * - Carrier image capacity analysis
 * - Password-based encryption
 * - Adjustable stealth/capacity tradeoff
 * - Visual comparison tools
 */

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Layers,
  Search,
  Key,
  BarChart3,
} from 'lucide-react';

interface ImageAnalysis {
  width: number;
  height: number;
  totalPixels: number;
  maxCapacityBytes: number;
  maxCapacityKB: number;
  maxCapacityMB: string;
  recommendedBitsPerChannel: number;
}

export default function SteganographyPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'embed' | 'extract'>('embed');

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2">
            <Layers className="w-8 h-8 mr-3" />
            Steganography
          </h1>
          <p className="text-green-500/70">
            Hide files inside images using LSB encoding - invisible to the human eye
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'embed'
                ? 'bg-green-500 text-black'
                : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Embed File
          </button>
          <button
            onClick={() => setActiveTab('extract')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'extract'
                ? 'bg-green-500 text-black'
                : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Extract File
          </button>
        </div>

        {/* Content */}
        {activeTab === 'embed' ? <EmbedInterface /> : <ExtractInterface />}
      </div>
    </div>
  );
}

/**
 * Embed Interface
 */
function EmbedInterface() {
  const [carrierImage, setCarrierImage] = useState<File | null>(null);
  const [carrierPreview, setCarrierPreview] = useState<string | null>(null);
  const [payloadFile, setPayloadFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptPayload, setEncryptPayload] = useState(true);
  const [bitsPerChannel, setBitsPerChannel] = useState<1 | 2 | 3 | 4>(2);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [embedding, setEmbedding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const carrierInputRef = useRef<HTMLInputElement>(null);
  const payloadInputRef = useRef<HTMLInputElement>(null);

  const handleCarrierSelect = async (file: File) => {
    setCarrierImage(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setCarrierPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Analyze capacity
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/steganography/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEmbed = async () => {
    if (!carrierImage || !payloadFile) return;

    if (encryptPayload && !password) {
      setResult({ success: false, message: 'Password required for encryption' });
      return;
    }

    setEmbedding(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('carrier', carrierImage);
      formData.append('payload', payloadFile);
      formData.append('password', password);
      formData.append('bitsPerChannel', bitsPerChannel.toString());
      formData.append('encryptPayload', encryptPayload.toString());

      const res = await fetch('/api/steganography/embed', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stego_${carrierImage.name}`;
        a.click();

        setResult({ success: true, message: 'File embedded successfully!' });
      } else {
        const error = await res.json();
        setResult({ success: false, message: error.error || 'Failed to embed file' });
      }
    } catch (error) {
      console.error('Failed to embed file:', error);
      setResult({ success: false, message: 'Failed to embed file' });
    } finally {
      setEmbedding(false);
    }
  };

  const capacityPercentage = analysis && payloadFile
    ? (payloadFile.size / analysis.maxCapacityBytes) * 100
    : 0;

  const canEmbed = carrierImage && payloadFile && capacityPercentage <= 100;

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-500/80">
          <strong>LSB Steganography:</strong> Hides files by modifying the least significant
          bits of pixel data. Higher bits per channel = more capacity but more detectable.
          2 bits per channel is recommended for stealth.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Carrier Image */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Carrier Image
          </h3>

          <input
            ref={carrierInputRef}
            type="file"
            accept="image/png"
            onChange={(e) => e.target.files && handleCarrierSelect(e.target.files[0])}
            className="hidden"
          />

          {!carrierImage ? (
            <button
              onClick={() => carrierInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors flex flex-col items-center justify-center"
            >
              <Upload className="w-12 h-12 mb-3 text-green-500/50" />
              <p className="text-green-500/70">Click to select PNG image</p>
              <p className="text-xs text-green-500/50 mt-1">Carrier for hidden file</p>
            </button>
          ) : (
            <div className="space-y-4">
              <img
                src={carrierPreview || ''}
                alt="Carrier"
                className="w-full h-64 object-contain border border-green-500/30 rounded-lg"
              />
              <button
                onClick={() => {
                  setCarrierImage(null);
                  setCarrierPreview(null);
                  setAnalysis(null);
                }}
                className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
              >
                Change Image
              </button>

              {/* Image Analysis */}
              {analysis && (
                <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Dimensions:</span>
                    <span>{analysis.width} × {analysis.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Total Pixels:</span>
                    <span>{analysis.totalPixels.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Max Capacity:</span>
                    <span className="font-semibold">{analysis.maxCapacityMB} MB</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payload File */}
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Payload File
          </h3>

          <input
            ref={payloadInputRef}
            type="file"
            onChange={(e) => {
              setPayloadFile(e.target.files?.[0] || null);
              setResult(null);
            }}
            className="hidden"
          />

          {!payloadFile ? (
            <button
              onClick={() => payloadInputRef.current?.click()}
              className="w-full h-64 border-2 border-dashed border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors flex flex-col items-center justify-center"
            >
              <FileText className="w-12 h-12 mb-3 text-green-500/50" />
              <p className="text-green-500/70">Click to select file to hide</p>
              <p className="text-xs text-green-500/50 mt-1">Any file type supported</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="h-64 flex flex-col items-center justify-center bg-green-500/5 border border-green-500/30 rounded-lg">
                <FileText className="w-16 h-16 mb-4 text-green-500/70" />
                <p className="font-semibold mb-1">{payloadFile.name}</p>
                <p className="text-sm text-green-500/70">
                  {(payloadFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setPayloadFile(null)}
                className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
              >
                Change File
              </button>

              {/* Capacity Check */}
              {analysis && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500/70">Capacity Used:</span>
                    <span className={capacityPercentage > 100 ? 'text-red-500' : ''}>
                      {capacityPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-green-500/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        capacityPercentage > 100 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                  {capacityPercentage > 100 && (
                    <p className="text-xs text-red-500">
                      File too large! Try a larger carrier image or fewer bits per channel.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration */}
      {carrierImage && payloadFile && (
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Embedding Configuration
          </h3>

          {/* Encryption */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={encryptPayload}
                onChange={(e) => setEncryptPayload(e.target.checked)}
                className="rounded"
              />
              <Lock className="w-4 h-4" />
              <span>Encrypt payload (AES-256-GCM)</span>
            </label>

            {encryptPayload && (
              <div className="pl-6 space-y-2">
                <label className="block text-sm text-green-500/70">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Strong password for encryption"
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500/50 hover:text-green-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bits Per Channel */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Bits Per Channel: {bitsPerChannel}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={bitsPerChannel}
              onChange={(e) => setBitsPerChannel(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-green-500/70">
              <span>1 (Stealthy)</span>
              <span>2 (Balanced)</span>
              <span>3 (More Capacity)</span>
              <span>4 (Max Capacity)</span>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`border rounded-lg p-4 flex items-start space-x-3 ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={result.success ? 'text-green-500' : 'text-red-500'}>
            {result.message}
          </p>
        </div>
      )}

      {/* Embed Button */}
      <button
        onClick={handleEmbed}
        disabled={!canEmbed || embedding}
        className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {embedding ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            Embedding...
          </>
        ) : (
          <>
            <Layers className="w-5 h-5 mr-2" />
            Embed File into Image
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Extract Interface
 */
function ExtractInterface() {
  const [stegoImage, setStegoImage] = useState<File | null>(null);
  const [stegoPreview, setStegoPreview] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState(true);
  const [bitsPerChannel, setBitsPerChannel] = useState<1 | 2 | 3 | 4>(2);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setStegoImage(file);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setStegoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!stegoImage) return;

    if (encryptedPayload && !password) {
      setResult({ success: false, message: 'Password required for encrypted payload' });
      return;
    }

    setExtracting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', stegoImage);
      formData.append('password', password);
      formData.append('bitsPerChannel', bitsPerChannel.toString());
      formData.append('encrypted', encryptedPayload.toString());

      const res = await fetch('/api/steganography/extract', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const filename = res.headers.get('X-Original-Filename') || 'extracted_file';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        setResult({ success: true, message: `File extracted successfully: ${filename}` });
      } else {
        const error = await res.json();
        setResult({ success: false, message: error.error || 'Failed to extract file' });
      }
    } catch (error) {
      console.error('Failed to extract file:', error);
      setResult({ success: false, message: 'Failed to extract file' });
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-500/80">
          <strong>Extraction:</strong> Recovers hidden files from steganographic images.
          Use the same bits per channel setting that was used during embedding.
        </div>
      </div>

      {/* Steganographic Image */}
      <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Steganographic Image
        </h3>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png"
          onChange={(e) => e.target.files && handleImageSelect(e.target.files[0])}
          className="hidden"
        />

        {!stegoImage ? (
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-full h-96 border-2 border-dashed border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors flex flex-col items-center justify-center"
          >
            <ImageIcon className="w-16 h-16 mb-4 text-green-500/50" />
            <p className="text-green-500/70 mb-1">Click to select steganographic image</p>
            <p className="text-xs text-green-500/50">PNG image with hidden file</p>
          </button>
        ) : (
          <div className="space-y-4">
            <img
              src={stegoPreview || ''}
              alt="Steganographic"
              className="w-full h-96 object-contain border border-green-500/30 rounded-lg"
            />
            <button
              onClick={() => {
                setStegoImage(null);
                setStegoPreview(null);
              }}
              className="w-full bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
            >
              Change Image
            </button>
          </div>
        )}
      </div>

      {/* Configuration */}
      {stegoImage && (
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Extraction Configuration
          </h3>

          {/* Encryption */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={encryptedPayload}
                onChange={(e) => setEncryptedPayload(e.target.checked)}
                className="rounded"
              />
              <Lock className="w-4 h-4" />
              <span>Payload is encrypted</span>
            </label>

            {encryptedPayload && (
              <div className="pl-6 space-y-2">
                <label className="block text-sm text-green-500/70">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password used during embedding"
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500/50 hover:text-green-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bits Per Channel */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Bits Per Channel: {bitsPerChannel}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={bitsPerChannel}
              onChange={(e) => setBitsPerChannel(parseInt(e.target.value) as 1 | 2 | 3 | 4)}
              className="w-full"
            />
            <p className="text-xs text-green-500/70">
              Must match the setting used during embedding
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`border rounded-lg p-4 flex items-start space-x-3 ${
            result.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p className={result.success ? 'text-green-500' : 'text-red-500'}>
            {result.message}
          </p>
        </div>
      )}

      {/* Extract Button */}
      <button
        onClick={handleExtract}
        disabled={!stegoImage || extracting}
        className="w-full bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {extracting ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
            Extracting...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Extract Hidden File
          </>
        )}
      </button>
    </div>
  );
}
