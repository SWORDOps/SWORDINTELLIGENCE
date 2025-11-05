'use client';

import Link from 'next/link';
import { Shield, Key, User, Bell, Lock, Database } from 'lucide-react';

export default function SettingsPage() {
  const settingsSections = [
    {
      href: '/portal/settings/security',
      icon: Key,
      title: 'Security',
      description: 'Manage passwords, hardware keys, and authentication methods',
      color: 'text-accent',
    },
    {
      href: '/portal/settings/profile',
      icon: User,
      title: 'Profile',
      description: 'Update your personal information and contact details',
      color: 'text-blue-500',
    },
    {
      href: '/portal/settings/notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Configure alert preferences and communication channels',
      color: 'text-yellow-500',
    },
    {
      href: '/portal/settings/privacy',
      icon: Lock,
      title: 'Privacy',
      description: 'Control data sharing, retention, and privacy settings',
      color: 'text-purple-500',
    },
    {
      href: '/portal/settings/data',
      icon: Database,
      title: 'Data Management',
      description: 'Export your data, view audit logs, and manage retention',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="p-6 rounded-lg border border-border bg-surface hover:border-accent/50 transition-colors group"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-surface flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-6 h-6 ${section.color}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                  {section.title}
                </h2>
                <p className="text-sm text-muted">
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Important Notice */}
      <div className="mt-8 p-6 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Security Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>• Enable hardware security keys for maximum account protection</li>
              <li>• Review your audit logs regularly for suspicious activity</li>
              <li>• Keep your contact information up to date for emergency communications</li>
              <li>• Use unique, strong passwords and never share your credentials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
