import { useState, useCallback, useRef } from 'react';
import { LocationPoint } from '../types';
import { requestPositionWithFallback } from '../services/browserLocation';

// Chapel Hill / Carrboro / Durham boundary bounds
const SERVICE_BOUNDS = {
  minLat: 35.85,
  maxLat: 36.05,
  minLng: -79.15,
  maxLng: -78.85
};

export function isWithinServiceArea(lat: number, lng: number): boolean {
  return (
    lat >= SERVICE_BOUNDS.minLat &&
    lat <= SERVICE_BOUNDS.maxLat &&
    lng >= SERVICE_BOUNDS.minLng &&
    lng <= SERVICE_BOUNDS.maxLng
  );
}

export function useGeolocation() {
  const requestId = useRef(0);
  const [isLocating, setIsLocating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserLocation = useCallback(
    (onSuccess: (point: LocationPoint) => void) => {
      const id = ++requestId.current;
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      setIsLocating(true);
      setIsRetrying(false);
      setError(null);

      requestPositionWithFallback(
        navigator.geolocation,
        (position) => {
          if (id !== requestId.current) return;
          setIsLocating(false);
          setIsRetrying(false);
          const { latitude, longitude, accuracy } = position.coords;

          if (!isWithinServiceArea(latitude, longitude)) {
            setError(
              'Store and route data are not available for this area (outside Chapel Hill / Carrboro / Durham). Please enter an address within the service area.'
            );
            return;
          }

          const point: LocationPoint = {
            lat: latitude,
            lng: longitude,
            label: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            source: 'geolocation',
            capturedAt: new Date().toISOString(),
            accuracyMeters: Math.round(accuracy)
          };

          onSuccess(point);
        },
        (err) => {
          if (id !== requestId.current) return;
          setIsLocating(false);
          setIsRetrying(false);
          if (err.code === err.PERMISSION_DENIED) {
            setError('Location permission denied. Allow location access in your browser, or enter an address manually.');
          } else if (err.code === err.TIMEOUT) {
            setError('Location timed out after retrying at lower accuracy. Please try again or enter an address manually.');
          } else {
            setError('Could not retrieve your location after retrying. Please enter an address manually or select a demo location.');
          }
        },
        () => { if (id === requestId.current) setIsRetrying(true); }
      );
    },
    []
  );

  return {
    isLocating,
    isRetrying,
    error,
    clearError: useCallback(() => { requestId.current++; setError(null); setIsLocating(false); setIsRetrying(false); }, []),
    requestBrowserLocation
  };
}
