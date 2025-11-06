'use client';

import Link from 'next/link';
import {
  Shield,
  Eye,
  Cpu,
  Zap,
  Search,
  Lock,
  FileCode,
  Image,
  Database,
  AlertTriangle,
  CheckCircle2,
  Code,
  Download,
  BarChart3,
  Layers
} from 'lucide-react';

export default function Kp14Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-br from-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-4">KP14</h1>
              <p className="text-2xl text-accent">
                Advanced Malware Analysis & Steganographic Intelligence Platform
              </p>
            </div>
          </div>
          <p className="text-xl text-muted leading-relaxed max-w-4xl">
            Enterprise-grade platform for analyzing sophisticated malware and steganographic payloads.
            Originally designed for APT41's KeyPlug malware, now capable of decompiling and analyzing
            most modern malware families with hardware-accelerated machine learning and comprehensive
            threat intelligence extraction.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-semibold">
              APT41 Analysis
            </span>
            <span className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 text-sm font-semibold">
              Steganography Detection
            </span>
            <span className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-semibold">
              96.2/100 Quality
            </span>
            <span className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-semibold">
              NPU Accelerated
            </span>
          </div>
        </div>
      </section>

      {/* Quality Metrics */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Enterprise Quality Metrics</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-green-500 mb-2">96.2/100</div>
            <div className="text-sm text-muted">Overall Quality (A+)</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-green-500 mb-2">98/100</div>
            <div className="text-sm text-muted">Security Rating</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-accent mb-2">82%</div>
            <div className="text-sm text-muted">Test Coverage</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-purple-500 mb-2">3-10×</div>
            <div className="text-sm text-muted">NPU Performance Gain</div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-12">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Static Binary Analysis */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <FileCode className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Static Binary Analysis</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>PE/PE32+ executable parsing with complete header analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Import Address Table (IAT) reconstruction</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>x86/x64 disassembly with Capstone + Radare2</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Entropy analysis to identify packed/encrypted code</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Digital signature verification and certificate chain</span>
              </li>
            </ul>
          </div>

          {/* Steganographic Analysis */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Steganography Detection</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>LSB extraction from PNG/BMP images</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>DCT coefficient analysis for JPEG (F5, J-STEG, OutGuess)</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Polyglot detection: ZIP/JAR, JPEG/PE, PDF hybrids</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Recursive payload extraction with circular reference protection</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>EXIF/IPTC/XMP metadata analysis</span>
              </li>
            </ul>
          </div>

          {/* Cryptographic Analysis */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cryptographic Analysis</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Multi-layer decryption: XOR, AES (all modes), RC4, ChaCha20</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Custom APT41 algorithm decryption</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Algorithm fingerprinting and S-box identification</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Key derivation: PBKDF2, scrypt, custom routines</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Round constant detection and cipher identification</span>
              </li>
            </ul>
          </div>

          {/* Hardware Acceleration */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hardware Acceleration</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Intel NPU: 3-10× performance improvement</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>GPU acceleration for Intel Iris Xe and Arc</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>INT8 quantization and FP16 precision optimization</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Automatic device selection with CPU fallback</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>OpenVINO 2025.3.0+ runtime support</span>
              </li>
            </ul>
          </div>

          {/* Threat Intelligence */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Threat Intelligence</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>C2 infrastructure extraction (IPv4/IPv6, domains, onion)</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Automated severity scoring and family identification</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>MITRE ATT&CK mapping: 30+ technique identification</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Campaign attribution and tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Detection rule generation (YARA, Suricata, Snort, Sigma)</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Features */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Features</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Multi-threaded batch processing with worker pools</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>REST API with OpenAPI documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Output: JSON, CSV, STIX 2.1, MISP, OpenIOC, HTML</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>CI/CD integration (GitHub Actions, Jenkins, GitLab)</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Docker support with GPU/NPU passthrough</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* APT41 Focus */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="p-8 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="flex items-start space-x-4 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-4">APT41 KeyPlug Malware Analysis</h2>
              <p className="text-muted leading-relaxed mb-6">
                KP14 was originally developed to analyze APT41's sophisticated KeyPlug malware, one of
                the most advanced backdoors used by Chinese nation-state threat actors. The platform
                has since evolved to handle a wide range of modern malware families with similar
                steganographic and obfuscation techniques.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Custom Decryption</div>
                <div className="text-sm text-muted">APT41-specific encryption algorithm support</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Polyglot Detection</div>
                <div className="text-sm text-muted">Identifies multi-format files used for evasion</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">C2 Extraction</div>
                <div className="text-sm text-muted">Automatic command-and-control infrastructure discovery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Platform Architecture</h2>
        <p className="text-muted mb-12 max-w-3xl">
          KP14 uses a modular pipeline architecture with specialized analyzers and a hardware abstraction
          layer for optimal performance across different computing platforms.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-accent" />
              Core Components
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Configuration Manager:</strong> Centralized settings with validation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Pipeline Manager:</strong> Orchestrates analysis workflow</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Analyzer Modules:</strong> Specialized detection engines</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Hardware Abstraction Layer:</strong> Automatic device optimization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Report Generator:</strong> Multi-format output with configurable detail</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-accent" />
              Output Formats
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>JSON/JSONL:</strong> Machine-readable structured data</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>CSV:</strong> Spreadsheet-compatible tabular data</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>STIX 2.1:</strong> Structured threat information exchange</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>MISP Events:</strong> Malware Information Sharing Platform</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>OpenIOC 1.1:</strong> Indicators of compromise format</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>HTML/Markdown:</strong> Human-readable reports</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Usage Examples</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-accent" />
              Command Line Interface
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted mb-2">Single file analysis:</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  python main.py samples/keyplug.exe
                </code>
              </div>
              <div>
                <div className="text-sm text-muted mb-2">HTML report generation:</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  python main.py --format html samples/keyplug.exe
                </code>
              </div>
              <div>
                <div className="text-sm text-muted mb-2">Batch processing (8 workers):</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  python batch_analyzer.py --input samples/ --workers 8
                </code>
              </div>
              <div>
                <div className="text-sm text-muted mb-2">JSON output with jq:</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  python main.py --json samples/malware.exe | jq
                </code>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-accent" />
              Docker Deployment
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted mb-2">Build Docker image:</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  docker build -t kp14:latest .
                </code>
              </div>
              <div>
                <div className="text-sm text-muted mb-2">Run with GPU/NPU passthrough:</div>
                <code className="block px-4 py-3 rounded bg-background text-muted font-mono text-xs whitespace-pre-wrap">
{`docker run --rm --device=/dev/dri \\
  -v $(pwd)/samples:/samples:ro \\
  -v $(pwd)/results:/output \\
  kp14:latest /samples/suspicious.exe`}
                </code>
              </div>
              <div>
                <div className="text-sm text-muted mb-2">Docker Compose orchestration:</div>
                <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-xs">
                  docker-compose up -d
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Requirements */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Technical Requirements</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">System Requirements</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Python:</strong> 3.11+ required</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>RAM:</strong> 8GB minimum (16GB+ recommended)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Operating System:</strong> Ubuntu 22.04+, Debian 12+, Windows 10+, macOS 12+</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Storage:</strong> Variable (depends on sample size)</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Optional Acceleration</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Intel NPU:</strong> Neural Processing Unit (3-10× speedup)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Intel GPU:</strong> Iris Xe or Arc graphics</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>OpenVINO:</strong> 2025.3.0+ runtime for hardware acceleration</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Fallback:</strong> Automatic CPU mode if hardware unavailable</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Detection Rule Generation */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Automated Detection Rule Generation</h2>
        <p className="text-muted mb-8 max-w-3xl">
          KP14 automatically generates detection rules in multiple formats with false positive
          reduction, enabling rapid deployment of IOCs and behavioral signatures.
        </p>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface text-center">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">YARA Rules</h3>
            <p className="text-sm text-muted">Binary pattern matching</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface text-center">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Suricata</h3>
            <p className="text-sm text-muted">Network IDS signatures</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface text-center">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Snort</h3>
            <p className="text-sm text-muted">Packet inspection rules</p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface text-center">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Sigma</h3>
            <p className="text-sm text-muted">SIEM detection rules</p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Use Cases</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Incident Response</h3>
            <p className="text-sm text-muted">
              Rapidly analyze suspicious executables during active incidents. Extract C2
              infrastructure, identify malware families, and generate detection signatures
              for network-wide protection.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Threat Intelligence</h3>
            <p className="text-sm text-muted">
              Build comprehensive threat profiles by analyzing APT campaigns. Track malware
              evolution, identify infrastructure patterns, and map techniques to MITRE
              ATT&CK framework.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Malware Research</h3>
            <p className="text-sm text-muted">
              Deep-dive analysis of advanced malware samples. Understand obfuscation
              techniques, cryptographic implementations, and steganographic payload
              delivery mechanisms.
            </p>
          </div>
        </div>
      </section>

      {/* Download/Access Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Enterprise & Government Access</h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            KP14 is available to SWORD Intelligence clients and government agencies for malware
            analysis and threat intelligence operations. Contact us for enterprise licensing,
            custom deployment, and integration support.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://github.com/SWORDIntel/KP14"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-semibold"
            >
              View on GitHub →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors font-semibold"
            >
              Request Enterprise Access
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors font-semibold"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-border">
        <div className="p-6 rounded-lg bg-surface border border-border">
          <h3 className="text-lg font-bold mb-4">⚠️ Responsible Use Notice</h3>
          <div className="text-sm text-muted space-y-2">
            <p>
              <strong>Purpose:</strong> KP14 is designed for lawful malware analysis, incident response,
              and threat intelligence operations by authorized personnel only.
            </p>
            <p>
              <strong>Legal Compliance:</strong> Users are responsible for complying with all applicable
              laws and regulations in their jurisdiction. Unauthorized malware analysis may be illegal.
            </p>
            <p>
              <strong>Ethical Use:</strong> This tool should only be used for defensive security purposes,
              security research, and authorized penetration testing with explicit permission.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
