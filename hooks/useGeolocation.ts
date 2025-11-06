/**
 * Geolocation Hook
 *
 * Tracks user location for geographic trigger evaluation
 */

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationOptions {
  enabled?: boolean;           // Default: false (opt-in for privacy)
  updateIntervalMinutes?: number;  // Default: 10 minutes
  onUpdate?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enabled = false,
    updateIntervalMinutes = 10,
    onUpdate,
    onError,
  } = options;

  const { data: session } = useSession();
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateLocation = async (pos: GeolocationPosition) => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch('/api/messages/dead-drop/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: pos.latitude,
          longitude: pos.longitude,
          accuracy: pos.accuracy,
        }),
      });

      if (!res.ok) {
        throw new Error(`Location update failed: ${res.status}`);
      }

      console.log('[Geolocation] Updated successfully:', pos);

      if (onUpdate) {
        onUpdate(pos);
      }
    } catch (err) {
      console.error('[Geolocation] Failed to update:', err);
    }
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      console.error('[Geolocation] Not supported by browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const pos: GeolocationPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
          timestamp: Date.now(),
        };

        setPosition(pos);
        setError(null);
        setLoading(false);

        // Update server
        updateLocation(pos);
      },
      (geoError) => {
        console.error('[Geolocation] Error:', geoError.message);
        setError(geoError);
        setLoading(false);

        if (onError) {
          onError(geoError);
        }
      },
      {
        enableHighAccuracy: false,  // Balance between accuracy and battery
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,  // Cache for 5 minutes
      }
    );
  };

  useEffect(() => {
    if (!enabled || !session) return;

    // Get initial position
    getCurrentPosition();

    // Set up periodic updates
    intervalRef.current = setInterval(() => {
      getCurrentPosition();
    }, updateIntervalMinutes * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, session, updateIntervalMinutes]);

  return {
    position,
    error,
    loading,
    getCurrentPosition,
  };
}
