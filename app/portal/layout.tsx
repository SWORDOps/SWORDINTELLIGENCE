'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { PortalNav } from '@/components/portal/portal-nav';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated (except on login page)
    if (status === 'unauthenticated' && pathname !== '/portal/login') {
      router.push('/portal/login');
    }
  }, [status, pathname, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (pathname === '/portal/login') {
    return children;
  }

  // Show portal content if authenticated
  if (session) {
    return (
      <div className="min-h-screen flex">
        <PortalNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  return null;
}
