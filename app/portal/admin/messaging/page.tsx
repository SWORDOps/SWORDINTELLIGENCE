'use client';

/**
 * Admin Messaging Oversight
 *
 * Monitor all secure communications system-wide
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Activity,
  Clock,
  Shield,
  AlertTriangle,
  Eye,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface MessagingStats {
  totalRooms: number;
  activeRooms: number;
  totalMembers: number;
  totalMessages: number;
  totalProfiles: number;
  totalConversations: number;
  byRoomTags: Record<string, number>;
}

interface Room {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  messageCount: number;
  lastActivity: string;
  createdAt: string;
  tags: string[];
  archived: boolean;
  ephemeralByDefault: boolean;
  members: Array<{
    userId: string;
    role: string;
    joinedAt: string;
    lastSeen: string;
  }>;
}

interface ActiveUser {
  userId: string;
  displayName: string;
  online: boolean;
  lastSeen: string;
}

export default function MessagingOversightPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<MessagingStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadMessagingData();
    }
  }, [status]);

  const loadMessagingData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messaging');

      if (res.status === 403) {
        setError('Access Denied: Insufficient permissions');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load messaging data');
      }

      const data = await res.json();
      setStats(data.stats);
      setRooms(data.rooms);
      setActiveUsers(data.activeUsers);
      setError('');
    } catch (err: any) {
      console.error('Messaging data load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div>Loading messaging data...</div>
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
              <MessageSquare className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Messaging Oversight</h1>
            </div>
            <p className="text-green-500/70">
              Monitor secure communications system-wide
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
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <span className="text-xs text-green-500/50">ROOMS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.activeRooms} />
          </div>
          <div className="text-sm text-green-500/70">
            {stats.totalRooms} total
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Users className="w-8 h-8 text-purple-500" />
            <span className="text-xs text-green-500/50">MEMBERS</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalMembers} />
          </div>
          <div className="text-sm text-green-500/70">
            Total participants
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Lock className="w-8 h-8 text-green-500" />
            <span className="text-xs text-green-500/50">MESSAGES</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={stats.totalMessages} />
          </div>
          <div className="text-sm text-green-500/70">
            Encrypted messages
          </div>
        </div>

        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <Activity className="w-8 h-8 text-yellow-500" />
            <span className="text-xs text-green-500/50">ONLINE</span>
          </div>
          <div className="text-3xl font-bold font-mono mb-1">
            <AnimatedCounter end={activeUsers.length} />
          </div>
          <div className="text-sm text-green-500/70">
            Active users now
          </div>
        </div>
      </div>

      {/* Room Tags */}
      {Object.keys(stats.byRoomTags).length > 0 && (
        <div className="mb-8 bg-green-500/5 border border-green-500/30 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Rooms by Category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byRoomTags)
              .sort(([, a], [, b]) => b - a)
              .map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-sm"
                >
                  {tag} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-500" />
            Online Users ({activeUsers.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activeUsers.map((user) => (
              <div
                key={user.userId}
                className="bg-green-500/5 border border-green-500/30 rounded-lg p-3"
              >
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-sm truncate">{user.displayName}</span>
                </div>
                <div className="text-xs text-green-500/70 truncate">{user.userId}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div className="mb-4">
        <h3 className="font-semibold mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Operations Rooms
        </h3>
      </div>

      <div className="bg-green-500/5 border border-green-500/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-500/10 border-b border-green-500/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Members</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Messages</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Security</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Last Activity</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-500/20">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-green-500/70">
                  No operations rooms created yet
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-green-500/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{room.name}</div>
                      {room.description && (
                        <div className="text-xs text-green-500/70 mt-1 max-w-xs truncate">
                          {room.description}
                        </div>
                      )}
                      {room.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-green-500/10 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-green-500/70">{room.ownerId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{room.memberCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{room.messageCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-500" title="Post-quantum encrypted" />
                      {room.ephemeralByDefault && (
                        <Clock className="w-4 h-4 text-yellow-500" title="Ephemeral by default" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-green-500/50" />
                      {new Date(room.lastActivity).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedRoom(room)}
                      className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-green-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{selectedRoom.name}</h2>

            {selectedRoom.description && (
              <p className="text-sm text-green-500/70 mb-4">{selectedRoom.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-green-500/70">Owner:</span>
                <div className="font-medium">{selectedRoom.ownerId}</div>
              </div>
              <div>
                <span className="text-green-500/70">Created:</span>
                <div className="font-medium">{new Date(selectedRoom.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <span className="text-green-500/70">Members:</span>
                <div className="font-medium">{selectedRoom.memberCount}</div>
              </div>
              <div>
                <span className="text-green-500/70">Messages:</span>
                <div className="font-medium">{selectedRoom.messageCount}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Members ({selectedRoom.members.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedRoom.members.map((member) => (
                  <div
                    key={member.userId}
                    className="bg-green-500/5 border border-green-500/30 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{member.userId}</span>
                      <span className="text-xs bg-green-500/10 px-2 py-1 rounded">{member.role}</span>
                    </div>
                    <div className="text-xs text-green-500/70 mt-1">
                      Joined: {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedRoom(null)}
              className="w-full bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-500/80">
            <strong>End-to-End Encryption:</strong> All messages are encrypted with Kyber-768 post-quantum cryptography.
            Private keys are stored client-side only. Admin oversight shows metadata only - message content remains encrypted.
          </div>
        </div>
      </div>
    </div>
  );
}
