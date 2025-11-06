'use client';

/**
 * Admin User Management
 *
 * Full user administration with role management
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  AlertTriangle,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'analyst' | 'admin' | 'superadmin';
  createdAt: string;
  lastLogin?: string;
  disabled: boolean;
  activity: {
    totalActions: number;
    riskScore: number;
  };
  suspicious: boolean;
  suspiciousReasons: string[];
}

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/portal/login');
    } else if (status === 'authenticated') {
      loadUsers();
    }
  }, [status]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');

      if (res.status === 403) {
        setError('Access Denied: Insufficient permissions');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load users');
      }

      const data = await res.json();
      setUsers(data.users);
      setError('');
    } catch (err: any) {
      console.error('Users load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { role?: string; disabled?: boolean }) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          ...updates,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      await loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'superadmin': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'admin': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'analyst': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      default: return 'bg-green-500/20 text-green-500 border-green-500/50';
    }
  };

  const getRiskColor = (score: number): string => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center">
        <div>Loading users...</div>
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

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8" />
              <h1 className="text-3xl font-bold">User Management</h1>
            </div>
            <p className="text-green-500/70">
              Manage user accounts, roles, and permissions
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

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-green-500/5 border border-green-500/30 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1">{users.length}</div>
          <div className="text-sm text-green-500/70">Total Users</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1">
            {users.filter(u => !u.disabled).length}
          </div>
          <div className="text-sm text-green-500/70">Active</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1 text-yellow-500">
            {users.filter(u => u.suspicious).length}
          </div>
          <div className="text-sm text-green-500/70">Suspicious</div>
        </div>
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold font-mono mb-1 text-red-500">
            {users.filter(u => u.activity.riskScore >= 70).length}
          </div>
          <div className="text-sm text-green-500/70">High Risk</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-green-500/5 border border-green-500/30 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-green-500/10 border-b border-green-500/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Activity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Last Login</th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-500/20">
            {filteredUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-green-500/5">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-green-500/70">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold uppercase border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.disabled ? (
                    <span className="inline-flex items-center text-red-500 text-sm">
                      <XCircle className="w-4 h-4 mr-1" />
                      Disabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-green-500 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono">{user.activity.totalActions}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className={`text-sm font-mono font-semibold ${getRiskColor(user.activity.riskScore)}`}>
                      {user.activity.riskScore}
                    </span>
                    {user.suspicious && (
                      <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.lastLogin ? (
                    <div className="text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-green-500/50" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-sm text-green-500/50">Never</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Link
                      href={`/portal/admin/users/${encodeURIComponent(user.userId)}`}
                      className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateUser(user.userId, { disabled: !user.disabled })}
                      className={`p-2 rounded-lg hover:bg-green-500/10 transition-colors ${
                        user.disabled ? 'text-green-500' : 'text-red-500'
                      }`}
                      title={user.disabled ? 'Enable User' : 'Disable User'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-green-500/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit User: {selectedUser.name}</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) => {
                    if (confirm(`Change ${selectedUser.name}'s role to ${e.target.value}?`)) {
                      updateUser(selectedUser.userId, { role: e.target.value });
                    }
                  }}
                  className="w-full bg-green-500/5 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                >
                  <option value="user">User</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="pt-4 border-t border-green-500/30">
                <div className="text-sm text-green-500/70 mb-2">User Information</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Email:</span>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Created:</span>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Activity:</span>
                    <span>{selectedUser.activity.totalActions} actions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-500/70">Risk Score:</span>
                    <span className={getRiskColor(selectedUser.activity.riskScore)}>
                      {selectedUser.activity.riskScore}
                    </span>
                  </div>
                </div>
              </div>

              {selectedUser.suspicious && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-500/80">
                      <strong>Suspicious Activity Detected:</strong>
                      <ul className="mt-2 space-y-1">
                        {selectedUser.suspiciousReasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                Close
              </button>
              <Link
                href={`/portal/admin/users/${encodeURIComponent(selectedUser.userId)}`}
                className="flex-1 bg-green-500 text-black px-4 py-2 rounded-lg hover:bg-green-400 transition-colors text-center font-semibold"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
