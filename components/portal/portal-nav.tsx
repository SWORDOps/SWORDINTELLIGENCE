'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderLock,
  MessageSquare,
  FileText,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PortalNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/vault', label: 'Document Vault', icon: FolderLock },
    { href: '/portal/messages', label: 'Secure Messages', icon: MessageSquare },
    { href: '/portal/reports', label: 'Intel Reports', icon: FileText },
    { href: '/portal/billing', label: 'Billing', icon: CreditCard },
  ];

  const handleEmergency = () => {
    // In production, this would trigger emergency protocols
    alert('Emergency escalation initiated. You will be contacted within 15 minutes.');
  };

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-mono text-lg font-bold">SWORD//PORTAL</span>
        </Link>
        {session?.user && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium truncate">{session.user.name}</p>
            <p className="text-xs text-muted truncate">{session.user.email}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/50'
                  : 'text-muted hover:bg-surface hover:text-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Emergency Button */}
        <button
          onClick={handleEmergency}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/50 mt-4"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-semibold">Emergency</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/portal/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted hover:bg-surface hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/portal/login' })}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-muted hover:bg-surface hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
