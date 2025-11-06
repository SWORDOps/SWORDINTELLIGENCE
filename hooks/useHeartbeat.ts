/**
 * Heartbeat Hook
 *
 * Automatically sends heartbeat signals for dead man's switch functionality
 */

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface UseHeartbeatOptions {
  intervalMinutes?: number;  // Default: 5 minutes
  enabled?: boolean;         // Default: true
  onHeartbeat?: () => void;
  onError?: (error: Error) => void;
}

export function useHeartbeat(options: UseHeartbeatOptions = {}) {
  const {
    intervalMinutes = 5,
    enabled = true,
    onHeartbeat,
    onError,
  } = options;

  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendHeartbeat = async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch('/api/messages/dead-drop/heartbeat', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Heartbeat failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('[Heartbeat] Sent successfully:', data.heartbeat.lastHeartbeat);

      if (onHeartbeat) {
        onHeartbeat();
      }
    } catch (error) {
      console.error('[Heartbeat] Failed to send:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  useEffect(() => {
    if (!enabled || !session) return;

    // Send initial heartbeat
    sendHeartbeat();

    // Set up periodic heartbeat
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, intervalMinutes * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, session, intervalMinutes]);

  return { sendHeartbeat };
}
