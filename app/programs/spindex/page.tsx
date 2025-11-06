'use client';

import Link from 'next/link';
import {
  Search,
  Database,
  Cpu,
  Zap,
  Lock,
  FileText,
  Layers,
  Brain,
  HardDrive,
  Shield,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Code
} from 'lucide-react';

export default function SpindexPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-br from-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex items-start space-x-6 mb-8">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Search className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-4">SPINDEX</h1>
              <p className="text-2xl text-accent">
                High-Performance Modular Data Indexing Engine
              </p>
            </div>
          </div>
          <p className="text-xl text-muted leading-relaxed max-w-4xl">
            Enterprise-grade data indexing and search tool designed to efficiently handle, decompress,
            parse, and index massive datasets exceeding 500 terabytes. Built entirely in native C with
            AVX-512 optimizations, machine learning integration, and Elasticsearch/Kibana for
            unparalleled performance at scale.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold">
              Pure C Implementation
            </span>
            <span className="px-4 py-2 rounded-lg bg-accent/10 text-accent text-sm font-semibold">
              AVX-512 Optimized
            </span>
            <span className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-semibold">
              500+ TB Scale
            </span>
            <span className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 text-sm font-semibold">
              ML-Powered Classification
            </span>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-12">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Pure C Performance */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Pure C Implementation</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Native C codebase for maximum performance</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Direct hardware interaction and SIMD registers</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>No high-level language wrappers or overhead</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Minimal dependencies and optimal resource usage</span>
              </li>
            </ul>
          </div>

          {/* AVX-512 Optimizations */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">AVX-512 Acceleration</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>State-of-the-art AVX-512 phrase search algorithm</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Vectorized text processing with parallel comparisons</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Optimized memory access and cache utilization</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Hardware detection with adaptive code paths</span>
              </li>
            </ul>
          </div>

          {/* Machine Learning Integration */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">ML-Powered Classification</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>OpenVINO integration for optimized inference</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Automatic content classification and categorization</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>FP16 precision models with NPU/GPU acceleration</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Adaptive parsing based on detected content types</span>
              </li>
            </ul>
          </div>

          {/* Modular Plugin Architecture */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Modular Architecture</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Plugin-based framework with dynamic loading</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Automatic module discovery and integration</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>No recompilation needed for new plugins</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Configuration-driven customization</span>
              </li>
            </ul>
          </div>

          {/* Elasticsearch Integration */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Elasticsearch & Kibana</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Seamless Elasticsearch integration for distributed search</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Kibana dashboards for visualization and analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Vector search with SIMD optimization support</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Optimized data format for high-performance queries</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Security */}
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Role-Based Access Control (RBAC) with UI</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>End-to-end encryption with key management</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Data re-keying capabilities</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-2">•</span>
                <span>Credential analysis and breach detection plugins</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Supported File Formats */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Comprehensive Format Support</h2>
        <p className="text-muted mb-12 max-w-3xl">
          SPINDEX supports extensive file formats through modular parsers and preprocessors.
          Each format has dedicated processing and pre-processing modules for optimal handling.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Text & Structured Data</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Plain Text (.txt)</li>
              <li>• JSON (.json)</li>
              <li>• CSV (.csv)</li>
              <li>• SQL (.sql)</li>
              <li>• XML (.xml)</li>
              <li>• YAML (.yml)</li>
              <li>• HTML (.html, .htm)</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Office Documents</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Word (.doc, .docx)</li>
              <li>• Excel (.xls, .xlsx)</li>
              <li>• PDF (.pdf)</li>
              <li>• Rich Text (.rtf)</li>
              <li>• OpenDocument formats</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Databases & Archives</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted">
              <li>• SQLite (.sqlite, .db)</li>
              <li>• ZIP archives</li>
              <li>• GZIP compression</li>
              <li>• Zstandard (.zstd)</li>
              <li>• Nested archives</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="flex items-center space-x-3 mb-4">
              <HardDrive className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Specialized Formats</h3>
            </div>
            <ul className="space-y-1 text-sm text-muted">
              <li>• Medical Imaging (.dic)</li>
              <li>• DICOM files</li>
              <li>• Custom dictionaries</li>
              <li>• Log files</li>
              <li>• Configuration files</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Ambiguous Data Handling */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="p-8 rounded-lg bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-start space-x-4 mb-6">
            <Brain className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-4">Intelligent Content Classification</h2>
              <p className="text-muted leading-relaxed mb-6">
                SPINDEX excels at handling ambiguous datasets where file extensions don't tell the full
                story. A single <code className="px-2 py-1 rounded bg-background text-accent">.txt</code> file
                might contain process lists, user credentials, configuration data, or logs. Our ML-powered
                system automatically detects and classifies content for appropriate handling.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Content Analysis</div>
                <div className="text-sm text-muted">Beyond file extensions - analyzes actual content structure</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Real-Time Classification</div>
                <div className="text-sm text-muted">ML models classify during ingestion without manual intervention</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Adaptive Parsing</div>
                <div className="text-sm text-muted">Selects optimal parsing strategy based on detected content type</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plugin Architecture */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Modular Plugin Architecture</h2>
        <p className="text-muted mb-12 max-w-3xl">
          SPINDEX's plugin-based framework enables automatic detection and integration of new modules.
          All functionality is encapsulated in dynamically loadable shared objects (.so files).
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-accent" />
                Parser Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Format-specific parsers for extracting structured data from various file types.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/parsers/txt_parser.so</div>
                <div>plugins/parsers/json_parser.so</div>
                <div>plugins/parsers/pdf_parser.so</div>
                <div>plugins/parsers/sqlite_parser.so</div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-accent" />
                Preprocessor Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Data normalization, enrichment, and format conversion before indexing.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/preprocessors/content_analyzer.so</div>
                <div>plugins/preprocessors/txt_preprocessor.so</div>
                <div>plugins/preprocessors/json_preprocessor.so</div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-accent" />
                Classifier Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Machine learning modules for content classification and categorization.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/classifiers/ml_classifier.so</div>
                <div>plugins/classifiers/openvino_classifier.so</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-accent" />
                Indexer Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Integration with various indexing backends for distributed search.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/indexers/elasticsearch_indexer.so</div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-accent" />
                Search Algorithm Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Optimized search implementations leveraging hardware acceleration.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/search_algorithms/avx512_phrase_search.so</div>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-border bg-surface">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <HardDrive className="w-5 h-5 mr-2 text-accent" />
                Decompressor Plugins
              </h3>
              <p className="text-sm text-muted mb-3">
                Handle compressed archives and nested compression formats.
              </p>
              <div className="text-xs font-mono text-muted space-y-1">
                <div>plugins/decompressors/zip_decompressor.so</div>
                <div>plugins/decompressors/gzip_decompressor.so</div>
                <div>plugins/decompressors/zstd_decompressor.so</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Performance Characteristics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-green-500 mb-2">500+ TB</div>
            <div className="text-sm text-muted">Maximum Dataset Size</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-accent mb-2">15+</div>
            <div className="text-sm text-muted">File Format Categories</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-purple-500 mb-2">AVX-512</div>
            <div className="text-sm text-muted">Hardware Acceleration</div>
          </div>
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="text-4xl font-bold text-orange-500 mb-2">FP16</div>
            <div className="text-sm text-muted">ML Model Precision</div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Technical Architecture</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Core Components</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Plugin Loader:</strong> Dynamic module discovery and integration</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Ingestion Pipeline:</strong> Coordinated data flow through processing stages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Hardware Detection:</strong> Runtime CPU capability detection</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Elasticsearch Client:</strong> Optimized interaction with search backend</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Threading Manager:</strong> Multi-threaded processing with synchronization</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Enterprise Features</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>RBAC UI:</strong> Role, permission, and user-role management</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>E2E Encryption:</strong> Key management and data re-keying</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Vue.js GUI:</strong> User-friendly web interface</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Index Management:</strong> Create, view, and manage indexes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Query Interface:</strong> Advanced search with filtering</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Use Cases</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Threat Intelligence</h3>
            <p className="text-sm text-muted">
              Index and search massive breach databases, credential dumps, and threat actor
              communications for OSINT and incident response.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Enterprise Search</h3>
            <p className="text-sm text-muted">
              Full-text search across petabyte-scale document repositories with ML-powered
              classification and metadata extraction.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-surface">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-bold mb-3">Data Lake Indexing</h3>
            <p className="text-sm text-muted">
              Process and index diverse data sources in data lakes, enabling unified search
              across structured and unstructured data.
            </p>
          </div>
        </div>
      </section>

      {/* Compilation & Deployment */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <h2 className="text-3xl font-bold mb-8">Compilation & Deployment</h2>
        <div className="p-6 rounded-lg border border-border bg-surface">
          <h3 className="text-lg font-bold mb-4">Build Instructions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted mb-2">Build all components:</div>
              <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-sm">
                make all
              </code>
            </div>
            <div>
              <div className="text-sm text-muted mb-2">Build plugins only:</div>
              <code className="block px-4 py-3 rounded bg-background text-accent font-mono text-sm">
                make plugins
              </code>
            </div>
            <div>
              <div className="text-sm text-muted mb-2">AVX-512 optimization (requires compatible CPU):</div>
              <code className="block px-4 py-3 rounded bg-background text-muted font-mono text-sm">
                # Automatically applies -mavx512f -mavx512bw flags
              </code>
            </div>
          </div>
          <div className="mt-6 p-4 rounded bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted">
                <strong className="text-foreground">Hardware Requirements:</strong> AVX-512 optimized plugins
                require compatible CPU. The system includes runtime hardware detection to ensure features
                are available before use.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download/Access Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Enterprise Access</h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            SPINDEX is available to SWORD Intelligence clients for large-scale data indexing
            and search operations. Contact us for licensing, deployment assistance, and
            custom plugin development.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-semibold"
            >
              Request Access
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

      {/* Technical Notice */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-border">
        <div className="p-6 rounded-lg bg-surface border border-border">
          <h3 className="text-lg font-bold mb-4">⚙️ Technical Requirements</h3>
          <div className="text-sm text-muted space-y-2">
            <p>
              <strong>Compiler:</strong> GCC or Clang with C11 support. AVX-512 plugins require
              compiler support for -mavx512f and -mavx512bw flags.
            </p>
            <p>
              <strong>Dependencies:</strong> Elasticsearch 8.9.0+, Kibana (matching version),
              OpenVINO toolkit for ML inference, standard C libraries.
            </p>
            <p>
              <strong>Hardware:</strong> x86-64 architecture. AVX-512 support recommended for
              optimal performance. NPU or integrated GPU optional for ML acceleration.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
