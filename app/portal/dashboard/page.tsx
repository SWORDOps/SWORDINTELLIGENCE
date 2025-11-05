'use client';

import { useSession } from 'next-auth/react';
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Download,
  MessageSquare,
  Lock,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export default function DashboardPage() {
  const { data: session } = useSession();

  // Mock data (in production, fetch from API)
  const engagements = [
    {
      id: 'ENG-2024-047',
      title: 'DeFi Exploit Investigation',
      status: 'active',
      priority: 'high',
      progress: 73,
      lastUpdate: '2 hours ago',
      nextMilestone: 'Final attribution report due Nov 8',
    },
    {
      id: 'ENG-2024-039',
      title: 'Executive OPSEC Audit',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      lastUpdate: '3 days ago',
      nextMilestone: 'Recommendations delivered',
    },
    {
      id: 'ENG-2024-052',
      title: 'Threat Actor Profiling - APT28',
      status: 'active',
      priority: 'critical',
      progress: 45,
      lastUpdate: '5 hours ago',
      nextMilestone: 'Infrastructure mapping in progress',
    },
  ];

  const recentActivity = [
    {
      type: 'report',
      message: 'New intelligence report available: ENG-2024-047',
      timestamp: '2 hours ago',
      icon: FileText,
    },
    {
      type: 'message',
      message: 'Secure message from analyst regarding APT attribution',
      timestamp: '4 hours ago',
      icon: MessageSquare,
    },
    {
      type: 'update',
      message: 'Engagement ENG-2024-052 status updated to "In Progress"',
      timestamp: '1 day ago',
      icon: Clock,
    },
  ];

  const stats = [
    { label: 'Active Engagements', value: 3, icon: Shield, color: 'text-blue-500' },
    { label: 'Reports Delivered', value: 12, icon: FileText, color: 'text-green-500' },
    { label: 'Pending Actions', value: 2, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Total Recovered', value: 4.2, prefix: '$', suffix: 'M', decimals: 1, icon: TrendingUp, color: 'text-accent' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/50';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/50';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
      default: return 'bg-muted text-muted border-border';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-muted">
          Here's an overview of your active intelligence operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-lg border border-border bg-surface">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold font-mono mb-1">
              <AnimatedCounter
                end={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals}
              />
            </div>
            <div className="text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Active Engagements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Active Engagements</h2>
            <button className="text-sm text-accent hover:underline">View all →</button>
          </div>

          {engagements.map((engagement) => (
            <div
              key={engagement.id}
              className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-mono text-muted">{engagement.id}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase border ${getStatusColor(engagement.status)}`}>
                      {engagement.status}
                    </span>
                    <span className={`text-xs font-semibold uppercase ${getPriorityColor(engagement.priority)}`}>
                      {engagement.priority} priority
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{engagement.title}</h3>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Progress</span>
                  <span className="font-mono font-semibold">{engagement.progress}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${engagement.progress}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Updated {engagement.lastUpdate}</span>
                <span className="text-accent">{engagement.nextMilestone}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-border bg-surface"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{activity.message}</p>
                    <p className="text-xs text-muted mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/portal/vault" className="block w-full px-4 py-3 rounded-lg border border-green-500/50 bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-semibold">Post-Quantum Vault</span>
                </div>
              </Link>
              <Link href="/portal/canary" className="block w-full px-4 py-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-semibold">Canary Tokens</span>
                </div>
              </Link>
              <button className="w-full px-4 py-3 rounded-lg border border-border bg-surface hover:border-accent transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Send Secure Message</span>
                </div>
              </button>
              <button className="w-full px-4 py-3 rounded-lg border border-border bg-surface hover:border-accent transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">Download Reports</span>
                </div>
              </button>
              <button className="w-full px-4 py-3 rounded-lg border border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-left">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-semibold">Emergency Escalation</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
