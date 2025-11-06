'use client';

/**
 * Dead Drop Management Dashboard
 *
 * Cold War tradecraft for delayed message delivery:
 * - Time-based delivery (deliver after delay or at specific time)
 * - Dead man's switch (deliver if no heartbeat received)
 * - Geographic triggers (deliver when entering/exiting region)
 * - Composite triggers (combine multiple conditions)
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Clock,
  Heart,
  MapPin,
  GitBranch,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Timer,
  Globe,
  Activity,
  Shield,
  Flame,
  Eye,
} from 'lucide-react';

interface DeadDrop {
  id: string;
  creatorId: string;
  recipientId: string;
  roomId?: string;
  status: 'pending' | 'delivered' | 'cancelled' | 'failed';
  createdAt: string;
  deliveredAt?: string;
  cancelledAt?: string;
  expiresAt?: string;
  trigger: any;
  triggerSummary: string;
  requireConfirmation?: boolean;
  selfDestruct?: boolean;
  deliveryAttempts: number;
  lastEvaluatedAt?: string;
}

interface Stats {
  total: number;
  pending: number;
  delivered: number;
  cancelled: number;
  failed: number;
}

type TriggerType = 'time' | 'heartbeat' | 'geographic' | 'composite';

export default function DeadDropsPage() {
  const { data: session } = useSession();
  const [drops, setDrops] = useState<DeadDrop[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (session) {
      loadDeadDrops();
      loadStats();
    }
  }, [session, filterStatus]);

  const loadDeadDrops = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const res = await fetch(`/api/messages/dead-drop?${params}`);
      const data = await res.json();
      setDrops(data.drops || []);
    } catch (error) {
      console.error('Failed to load dead drops:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch('/api/messages/dead-drop/stats');
      const data = await res.json();
      setStats(data.user);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const cancelDeadDrop = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this dead drop?')) return;

    try {
      const res = await fetch(`/api/messages/dead-drop?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadDeadDrops();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to cancel dead drop:', error);
    }
  };

  const getTriggerIcon = (trigger: any) => {
    switch (trigger.type) {
      case 'time':
        return <Clock className="w-4 h-4" />;
      case 'heartbeat':
        return <Heart className="w-4 h-4" />;
      case 'geographic':
        return <MapPin className="w-4 h-4" />;
      case 'composite':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = 'px-2 py-1 rounded text-xs font-semibold';
    switch (status) {
      case 'pending':
        return <span className={`${baseClass} bg-yellow-500/20 text-yellow-500`}>Pending</span>;
      case 'delivered':
        return <span className={`${baseClass} bg-green-500/20 text-green-500`}>Delivered</span>;
      case 'cancelled':
        return <span className={`${baseClass} bg-gray-500/20 text-gray-500`}>Cancelled</span>;
      case 'failed':
        return <span className={`${baseClass} bg-red-500/20 text-red-500`}>Failed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500">Loading dead drops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="w-8 h-8 mr-3" />
              Dead Drops
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Dead Drop
            </button>
          </div>
          <p className="text-green-500/70">
            Schedule encrypted messages for delayed delivery using time-based, event-based, or geographic triggers
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-green-500/70">Total Drops</div>
            </div>
            <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-sm text-yellow-500/70">Pending</div>
            </div>
            <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <div className="text-sm text-green-500/70">Delivered</div>
            </div>
            <div className="bg-gray-500/5 border border-gray-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-500">{stats.cancelled}</div>
              <div className="text-sm text-gray-500/70">Cancelled</div>
            </div>
            <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-sm text-red-500/70">Failed</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {['all', 'pending', 'delivered', 'cancelled', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-green-500 text-black'
                  : 'bg-green-500/10 text-green-500/70 hover:bg-green-500/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Dead Drops List */}
        {drops.length === 0 ? (
          <div className="text-center py-12 bg-green-500/5 border border-green-500/30 rounded-lg">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-green-500/70">No dead drops found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
            >
              Create your first dead drop
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {drops.map((drop) => (
              <div
                key={drop.id}
                className="bg-green-500/5 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTriggerIcon(drop.trigger)}
                      <span className="font-semibold">{drop.triggerSummary}</span>
                      {getStatusBadge(drop.status)}
                    </div>
                    <div className="text-sm text-green-500/70 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>To: {drop.recipientId}</span>
                        {drop.roomId && <span>Room: {drop.roomId}</span>}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Created: {new Date(drop.createdAt).toLocaleString()}</span>
                        {drop.expiresAt && (
                          <span>Expires: {new Date(drop.expiresAt).toLocaleString()}</span>
                        )}
                      </div>
                      {drop.deliveredAt && (
                        <span className="text-green-500">
                          Delivered: {new Date(drop.deliveredAt).toLocaleString()}
                        </span>
                      )}
                      {drop.cancelledAt && (
                        <span className="text-gray-500">
                          Cancelled: {new Date(drop.cancelledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {drop.selfDestruct && (
                      <div className="p-2 bg-red-500/10 rounded" title="Self-destruct enabled">
                        <Flame className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                    {drop.requireConfirmation && (
                      <div className="p-2 bg-blue-500/10 rounded" title="Confirmation required">
                        <Eye className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    {drop.status === 'pending' && drop.creatorId === session?.user?.email && (
                      <button
                        onClick={() => cancelDeadDrop(drop.id)}
                        className="p-2 bg-red-500/10 rounded hover:bg-red-500/20 transition-colors"
                        title="Cancel dead drop"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-green-500/50">
                  <span>Delivery attempts: {drop.deliveryAttempts}</span>
                  {drop.lastEvaluatedAt && (
                    <span>Last evaluated: {new Date(drop.lastEvaluatedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dead Drop Modal */}
      {showCreateModal && (
        <CreateDeadDropModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadDeadDrops();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

/**
 * Create Dead Drop Modal Component
 */
function CreateDeadDropModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [recipientId, setRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('time');
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [requireConfirmation, setRequireConfirmation] = useState(false);

  // Time trigger
  const [delayHours, setDelayHours] = useState(24);

  // Heartbeat trigger
  const [monitoredUserId, setMonitoredUserId] = useState('');
  const [timeoutHours, setTimeoutHours] = useState(48);

  // Geographic trigger
  const [geoCondition, setGeoCondition] = useState<'enters' | 'exits' | 'within' | 'outside'>('enters');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radiusMeters, setRadiusMeters] = useState(1000);

  const createDeadDrop = async () => {
    try {
      let trigger: any;

      switch (triggerType) {
        case 'time':
          trigger = {
            type: 'time',
            delayMinutes: delayHours * 60,
          };
          break;

        case 'heartbeat':
          trigger = {
            type: 'heartbeat',
            userId: monitoredUserId,
            timeoutHours,
          };
          break;

        case 'geographic':
          trigger = {
            type: 'geographic',
            condition: geoCondition,
            latitude,
            longitude,
            radiusMeters,
            recipientId,
          };
          break;
      }

      // Mock encryption (in production, encrypt client-side with recipient's public key)
      const encryptedContent = Buffer.from(messageText).toString('base64');

      const res = await fetch('/api/messages/dead-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId,
          encryptedContent,
          encryptionMetadata: {
            algorithm: 'kyber768-aes256-gcm',
            kyberCiphertext: 'mock-kyber-ct',
            iv: 'mock-iv',
            authTag: 'mock-tag',
            recipientPublicKey: 'mock-pub-key',
          },
          trigger,
          selfDestruct,
          requireConfirmation,
          maxAttempts: 3,
        }),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create dead drop:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-green-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Create Dead Drop
          </h2>
          <button onClick={onClose} className="text-green-500/50 hover:text-green-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Message */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email</label>
              <input
                type="email"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter encrypted message content..."
                rows={6}
                className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 resize-none"
              />
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selfDestruct}
                  onChange={(e) => setSelfDestruct(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Self-destruct after reading</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireConfirmation}
                  onChange={(e) => setRequireConfirmation(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Require confirmation</span>
              </label>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!recipientId || !messageText}
              className="w-full bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Choose Trigger
            </button>
          </div>
        )}

        {/* Step 2: Trigger Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Delivery Trigger</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTriggerType('time')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    triggerType === 'time'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-green-500/30 hover:border-green-500/50'
                  }`}
                >
                  <Clock className="w-6 h-6 mb-2" />
                  <div className="font-semibold">Time-Based</div>
                  <div className="text-xs text-green-500/70">Deliver after delay</div>
                </button>

                <button
                  onClick={() => setTriggerType('heartbeat')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    triggerType === 'heartbeat'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-green-500/30 hover:border-green-500/50'
                  }`}
                >
                  <Heart className="w-6 h-6 mb-2" />
                  <div className="font-semibold">Dead Man's Switch</div>
                  <div className="text-xs text-green-500/70">If no heartbeat</div>
                </button>

                <button
                  onClick={() => setTriggerType('geographic')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    triggerType === 'geographic'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-green-500/30 hover:border-green-500/50'
                  }`}
                >
                  <MapPin className="w-6 h-6 mb-2" />
                  <div className="font-semibold">Geographic</div>
                  <div className="text-xs text-green-500/70">Location-based</div>
                </button>

                <button
                  onClick={() => setTriggerType('composite')}
                  disabled
                  className="p-4 rounded-lg border-2 border-green-500/10 opacity-50 cursor-not-allowed"
                >
                  <GitBranch className="w-6 h-6 mb-2" />
                  <div className="font-semibold">Composite</div>
                  <div className="text-xs text-green-500/70">Coming soon</div>
                </button>
              </div>
            </div>

            {/* Time Trigger Config */}
            {triggerType === 'time' && (
              <div>
                <label className="block text-sm font-medium mb-2">Delay (hours)</label>
                <input
                  type="number"
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  min="1"
                  max="720"
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                />
                <p className="text-xs text-green-500/70 mt-1">
                  Message will be delivered in {delayHours} hours ({Math.floor(delayHours / 24)} days)
                </p>
              </div>
            )}

            {/* Heartbeat Trigger Config */}
            {triggerType === 'heartbeat' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monitor User</label>
                  <input
                    type="email"
                    value={monitoredUserId}
                    onChange={(e) => setMonitoredUserId(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timeout (hours)</label>
                  <input
                    type="number"
                    value={timeoutHours}
                    onChange={(e) => setTimeoutHours(Number(e.target.value))}
                    min="1"
                    max="720"
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-xs text-green-500/70 mt-1">
                    Deliver if no heartbeat received for {timeoutHours} hours
                  </p>
                </div>
              </div>
            )}

            {/* Geographic Trigger Config */}
            {triggerType === 'geographic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <select
                    value={geoCondition}
                    onChange={(e) => setGeoCondition(e.target.value as any)}
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  >
                    <option value="enters">Enters region</option>
                    <option value="exits">Exits region</option>
                    <option value="within">Within region</option>
                    <option value="outside">Outside region</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Latitude</label>
                    <input
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      step="0.0001"
                      min="-90"
                      max="90"
                      className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Longitude</label>
                    <input
                      type="number"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      step="0.0001"
                      min="-180"
                      max="180"
                      className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Radius (meters)</label>
                  <input
                    type="number"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(Number(e.target.value))}
                    min="10"
                    max="10000"
                    className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={createDeadDrop}
                disabled={
                  (triggerType === 'heartbeat' && !monitoredUserId) ||
                  (triggerType === 'geographic' && (latitude === 0 || longitude === 0))
                }
                className="flex-1 bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Dead Drop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
