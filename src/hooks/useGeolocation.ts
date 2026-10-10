import { useState, useCallback } from 'react';
import { LocationPoint } from '../types';

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
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserLocation = useCallback(
    (onSuccess: (point: LocationPoint) => void) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const { latitude, longitude, accuracy } = position.coords;

          if (!isWithinServiceArea(latitude, longitude)) {
            setError(
              'Store and route data are not available for this area (outside Chapel Hill / Carrboro / Durham). Please select a demo starting point.'
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
          setIsLocating(false);
          if (err.code === err.PERMISSION_DENIED) {
            setError('Location permission denied. Please pick a demo location or click on the map.');
          } else if (err.code === err.TIMEOUT) {
            setError('Location request timed out. Please select a demo location.');
          } else {
            setError('Could not retrieve current location. Please select a demo starting point.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    },
    []
  );

  return {
    isLocating,
    error,
    clearError: () => setError(null),
    requestBrowserLocation
  };
}
