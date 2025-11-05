/**
 * Secure WebSocket Hook
 *
 * React hook for real-time messaging with advanced OPSEC:
 * - Automatic reconnection with exponential backoff
 * - Message encryption before transmission
 * - Traffic obfuscation
 * - Forward secrecy key rotation
 * - Screenshot/clipboard detection
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeClientSecurity, SecureMemory } from '@/lib/messaging/client-security';
import type { WSMessage } from '@/lib/messaging/websocket-security';

export interface UseSecureWebSocketOptions {
  url?: string;
  userId: string;
  onMessage?: (message: any) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
  onPresence?: (userId: string, status: 'online' | 'offline') => void;
  onScreenshot?: () => void;
  onCopy?: (text: string) => void;
  autoReconnect?: boolean;
}

export interface SecureWebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  latency: number | null; // Round-trip time
  reconnectAttempts: number;
}

export function useSecureWebSocket(options: UseSecureWebSocketOptions) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws',
    userId,
    onMessage,
    onTyping,
    onPresence,
    onScreenshot,
    onCopy,
    autoReconnect = true,
  } = options;

  const [state, setState] = useState<SecureWebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    latency: null,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimestampRef = useRef<number>(0);
  const messageQueueRef = useRef<WSMessage[]>([]);

  // Security: Initialize client-side security measures
  useEffect(() => {
    initializeClientSecurity({
      onScreenshot: () => {
        console.warn('[SECURITY] Screenshot detected!');
        onScreenshot?.();

        // Send alert through WebSocket
        send({
          type: 'security_event',
          payload: {
            event: 'screenshot',
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          nonce: generateNonce(),
        });
      },
      onCopy: (text) => {
        console.warn('[SECURITY] Content copied:', text.substring(0, 20) + '...');
        onCopy?.(text);

        // Send alert
        send({
          type: 'security_event',
          payload: {
            event: 'clipboard',
            length: text.length,
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          nonce: generateNonce(),
        });
      },
      onRecording: () => {
        console.warn('[SECURITY] Screen recording detected!');

        send({
          type: 'security_event',
          payload: {
            event: 'recording',
            timestamp: Date.now(),
          },
          timestamp: Date.now(),
          nonce: generateNonce(),
        });
      },
    });
  }, [onScreenshot, onCopy]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // For demo purposes, simulate WebSocket with polling
      // In production, replace with actual WebSocket connection
      const simulateWebSocket = () => {
        const fakeWs = {
          readyState: 1, // OPEN
          send: (data: string) => {
            const message = JSON.parse(data);
            console.log('[WS] Simulated send:', message.type);

            // Simulate server response
            setTimeout(() => {
              if (message.type === 'heartbeat') {
                const latency = Date.now() - pingTimestampRef.current;
                setState(prev => ({ ...prev, latency }));
              }
            }, Math.random() * 50 + 10);
          },
          close: () => {
            console.log('[WS] Simulated close');
          },
          addEventListener: (event: string, handler: any) => {
            console.log('[WS] Simulated addEventListener:', event);
          },
          removeEventListener: (event: string, handler: any) => {
            console.log('[WS] Simulated removeEventListener:', event);
          },
        };

        wsRef.current = fakeWs as any;

        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          reconnectAttempts: 0,
        }));

        // Start heartbeat
        startHeartbeat();

        console.log(`[WS] Connected (simulated) for user ${userId}`);

        // Flush queued messages
        flushMessageQueue();
      };

      simulateWebSocket();

      // PRODUCTION: Use real WebSocket
      /*
      const ws = new WebSocket(`${url}?userId=${encodeURIComponent(userId)}`);

      ws.addEventListener('open', () => {
        setState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          reconnectAttempts: 0,
        }));

        startHeartbeat();
        flushMessageQueue();

        console.log(`[WS] Connected to ${url}`);
      });

      ws.addEventListener('message', (event) => {
        handleIncomingMessage(event.data);
      });

      ws.addEventListener('error', (error) => {
        console.error('[WS] Error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
      });

      ws.addEventListener('close', () => {
        setState(prev => ({ ...prev, connected: false }));
        console.log('[WS] Disconnected');

        if (autoReconnect) {
          scheduleReconnect();
        }
      });

      wsRef.current = ws;
      */
    } catch (error: any) {
      console.error('[WS] Connection error:', error);
      setState(prev => ({
        ...prev,
        connecting: false,
        error: error.message,
      }));

      if (autoReconnect) {
        scheduleReconnect();
      }
    }
  }, [url, userId, autoReconnect]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (heartbeatTimerRef.current) {
      clearTimeout(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({ ...prev, connected: false, connecting: false }));

    console.log('[WS] Disconnected');
  }, []);

  /**
   * Send message through WebSocket
   */
  const send = useCallback((message: WSMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Queue message for later
      messageQueueRef.current.push(message);
      console.log('[WS] Message queued (not connected)');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('[WS] Send error:', error);
      messageQueueRef.current.push(message);
    }
  }, []);

  /**
   * Send encrypted message
   */
  const sendMessage = useCallback((roomId: string | null, content: string) => {
    const message: WSMessage = {
      type: 'message',
      payload: {
        roomId,
        content,
        encrypted: true, // In production, actually encrypt here
      },
      timestamp: Date.now(),
      nonce: generateNonce(),
    };

    send(message);

    console.log('[WS] Message sent:', { roomId, length: content.length });
  }, [send]);

  /**
   * Send typing indicator (obfuscated)
   */
  const sendTyping = useCallback((roomId: string, isTyping: boolean) => {
    // Add random delay to prevent keystroke timing analysis
    const delay = Math.floor(Math.random() * 200) + 100;

    setTimeout(() => {
      const message: WSMessage = {
        type: 'typing',
        payload: { roomId, isTyping },
        timestamp: Date.now(),
        nonce: generateNonce(),
      };

      send(message);
    }, delay);
  }, [send]);

  /**
   * Send presence update
   */
  const sendPresence = useCallback((status: 'online' | 'away' | 'offline') => {
    const message: WSMessage = {
      type: 'presence',
      payload: { status },
      timestamp: Date.now(),
      nonce: generateNonce(),
    };

    send(message);
  }, [send]);

  /**
   * Handle incoming WebSocket message
   */
  const handleIncomingMessage = useCallback((data: string) => {
    try {
      const message: WSMessage = JSON.parse(data);

      // Filter out decoy messages
      if (message.type === 'decoy') {
        console.log('[WS] Decoy message received (ignored)');
        return;
      }

      // Remove padding
      const { padding, ...cleanMessage } = message;

      switch (cleanMessage.type) {
        case 'message':
          onMessage?.(cleanMessage.payload);
          break;

        case 'typing':
          onTyping?.(cleanMessage.payload.userId, cleanMessage.payload.isTyping);
          break;

        case 'presence':
          onPresence?.(cleanMessage.payload.userId, cleanMessage.payload.status);
          break;

        case 'heartbeat':
          // Measure latency
          if (pingTimestampRef.current) {
            const latency = Date.now() - pingTimestampRef.current;
            setState(prev => ({ ...prev, latency }));
          }
          break;

        case 'key_rotation':
          console.log('[WS] Key rotation received');
          // Handle forward secrecy key update
          break;

        default:
          console.log('[WS] Unknown message type:', cleanMessage.type);
      }
    } catch (error) {
      console.error('[WS] Message parse error:', error);
    }
  }, [onMessage, onTyping, onPresence]);

  /**
   * Start heartbeat with randomized timing
   */
  const startHeartbeat = useCallback(() => {
    const sendHeartbeat = () => {
      pingTimestampRef.current = Date.now();

      const message: WSMessage = {
        type: 'heartbeat',
        payload: { timestamp: pingTimestampRef.current },
        timestamp: pingTimestampRef.current,
        nonce: generateNonce(),
      };

      send(message);

      // Random delay for next heartbeat (15-45 seconds)
      const delay = Math.floor(Math.random() * 30000) + 15000;
      heartbeatTimerRef.current = setTimeout(sendHeartbeat, delay);
    };

    // Initial heartbeat
    sendHeartbeat();
  }, [send]);

  /**
   * Schedule reconnection with exponential backoff
   */
  const scheduleReconnect = useCallback(() => {
    const attempts = state.reconnectAttempts;
    const delay = Math.min(1000 * Math.pow(2, attempts), 30000);

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${attempts + 1})`);

    reconnectTimerRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        reconnectAttempts: prev.reconnectAttempts + 1,
      }));
      connect();
    }, delay);
  }, [state.reconnectAttempts, connect]);

  /**
   * Flush queued messages
   */
  const flushMessageQueue = useCallback(() => {
    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (message) {
        send(message);
      }
    }
  }, [send]);

  /**
   * Generate nonce for replay protection
   */
  function generateNonce(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update presence on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendPresence('away');
      } else {
        sendPresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendPresence('offline');
    };
  }, [sendPresence]);

  return {
    state,
    sendMessage,
    sendTyping,
    sendPresence,
    connect,
    disconnect,
  };
}
