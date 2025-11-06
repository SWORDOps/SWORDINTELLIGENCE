'use client';

/**
 * Encrypted Message Search Modal
 *
 * Privacy-preserving search interface using searchable symmetric encryption.
 * Search messages without decrypting entire history.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  User,
  Hash,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface SearchResult {
  messageId: string;
  score: number;
  matchedTerms: string[];
  timestamp: number;
  roomId?: string;
  senderId?: string;
  snippet?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchKey: string;  // User's search key (derived from master key)
  onSelectResult?: (messageId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  searchKey,
  onSelectResult,
}: SearchModalProps) {
  const [searchTerms, setSearchTerms] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [fuzzySearch, setFuzzySearch] = useState(true);
  const [roomFilter, setRoomFilter] = useState('');
  const [senderFilter, setSenderFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Stats
  const [searchStats, setSearchStats] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/search/query/stats');
      const data = await res.json();
      if (data.success) {
        setSearchStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load search stats:', error);
    }
  };

  const executeSearch = async () => {
    if (!searchTerms.trim()) return;

    setSearching(true);
    setResults([]);

    try {
      const terms = searchTerms
        .split(/\s+/)
        .filter((t) => t.length >= 3); // Min 3 chars per term

      if (terms.length === 0) {
        return;
      }

      const res = await fetch('/api/search/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terms,
          searchKey,
          fuzzy: fuzzySearch,
          maxDistance: 2,
          roomId: roomFilter || undefined,
          senderId: senderFilter || undefined,
          dateFrom: dateFromFilter || undefined,
          dateTo: dateToFilter || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-green-500/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-green-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Search className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="text-2xl font-bold text-green-500">Encrypted Search</h2>
              <p className="text-sm text-green-500/70">
                Privacy-preserving message search - server never sees your queries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-500/50 hover:text-green-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-green-500/30">
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search encrypted messages... (minimum 3 characters per term)"
                className="w-full bg-green-500/5 border border-green-500/30 rounded-lg pl-10 pr-4 py-3 text-green-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <button
              onClick={executeSearch}
              disabled={searching || searchTerms.trim().length < 3}
              className="bg-green-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {searching ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-green-500/20 border-green-500 text-green-500'
                  : 'bg-green-500/5 border-green-500/30 text-green-500/70 hover:bg-green-500/10'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-6 text-sm">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={fuzzySearch}
                onChange={(e) => setFuzzySearch(e.target.checked)}
                className="rounded"
              />
              <Sparkles className="w-4 h-4 text-green-500/70" />
              <span className="text-green-500/70">
                Fuzzy Matching (typo tolerance, stemming, phonetic)
              </span>
            </label>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-green-500/5 border border-green-500/30 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-green-500/70 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  placeholder="Filter by room"
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-500/70 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Sender
                </label>
                <input
                  type="text"
                  value={senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value)}
                  placeholder="Filter by sender"
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-500/70 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-500/70 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date To
                </label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {!searching && results.length === 0 && searchTerms.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
              <p className="text-green-500/70 mb-2">Enter search terms to find messages</p>
              {searchStats && (
                <div className="mt-6 flex items-center justify-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-green-500/50" />
                    <span className="text-green-500/70">
                      {searchStats.totalIndexes.toLocaleString()} indexed messages
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-500/50" />
                    <span className="text-green-500/70">
                      {searchStats.totalKeywords.toLocaleString()} keywords
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500/50" />
                    <span className="text-green-500/70">
                      {searchStats.averageKeywordsPerMessage.toFixed(1)} avg/message
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!searching && results.length === 0 && searchTerms.length > 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500/50" />
              <p className="text-yellow-500/70">No results found</p>
              <p className="text-xs text-green-500/50 mt-2">
                Try different search terms or enable fuzzy matching
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-500">
                  {results.length} {results.length === 1 ? 'Result' : 'Results'}
                </h3>
                <span className="text-sm text-green-500/70">
                  Sorted by relevance and recency
                </span>
              </div>

              {results.map((result) => (
                <div
                  key={result.messageId}
                  onClick={() => {
                    if (onSelectResult) {
                      onSelectResult(result.messageId);
                      onClose();
                    }
                  }}
                  className="bg-green-500/5 border border-green-500/30 rounded-lg p-4 hover:border-green-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-green-500">
                          Message {result.messageId.substring(0, 8)}...
                        </span>
                        <div
                          className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-500"
                          title={`Relevance: ${(result.score * 100).toFixed(0)}%`}
                        >
                          {(result.score * 100).toFixed(0)}% match
                        </div>
                      </div>

                      {/* Matched Terms */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {result.matchedTerms.map((term, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-500"
                          >
                            {term}
                          </span>
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-green-500/50">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(result.timestamp).toLocaleString()}</span>
                        </span>
                        {result.roomId && (
                          <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span>{result.roomId.substring(0, 8)}...</span>
                          </span>
                        )}
                        {result.senderId && (
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{result.senderId}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500/50" />
                  </div>

                  {result.snippet && (
                    <div className="text-sm text-green-500/70 italic mt-2 border-l-2 border-green-500/30 pl-3">
                      {result.snippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-green-500/30 bg-green-500/5">
          <div className="flex items-center justify-between text-xs text-green-500/70">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Privacy-preserving search</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Queries never leave client encrypted</span>
              </span>
            </div>
            <span>Press ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
