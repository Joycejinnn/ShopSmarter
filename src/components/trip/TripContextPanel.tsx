import React, { useState } from 'react';
import { OriginInput } from './OriginInput';
import {
  TripContext,
  LocationPoint
} from '../../types';
import { DEMO_ORIGIN_LOCATIONS } from '../../data/stores';
import { TRANSPORT_MODES_CONFIG } from '../../data/travelGraph';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  Footprints,
  Bus,
  Bike,
  Car,
  MapPin,
  Luggage,
  Navigation,
  Compass,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface TripContextPanelProps {
  location: ReturnType<typeof useGeolocation>;
  tripContext: TripContext;
  onSetOrigin: (origin: LocationPoint) => void;
  onSetDestinationMode: (
    mode: 'return_to_origin' | 'another_location' | 'finish_at_last_store',
    location?: LocationPoint
  ) => void;
}

export const TripContextPanel: React.FC<TripContextPanelProps> = ({
  tripContext,
  location,
  onSetOrigin,
  onSetDestinationMode
}) => {
  const { requestBrowserLocation, isLocating, isRetrying, error, clearError } = location;
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleUseCurrentLocation = () => {
    requestBrowserLocation((point) => {
      onSetOrigin(point);
      setShowLocationPicker(false);
    });
  };

  const handleSelectDemoOrigin = (locId: string) => {
    const found = DEMO_ORIGIN_LOCATIONS.find((l) => l.id === locId);
    if (found) {
      onSetOrigin({
        lat: found.lat,
        lng: found.lng,
        label: found.label,
        source: 'demo',
        capturedAt: new Date().toISOString()
      });
      setShowLocationPicker(false);
    }
  };

  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-card space-y-4">
      {/* Starting Location & Destination Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-brand-primary" />
            Origin & Destination
          </label>
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="text-[11px] font-semibold text-brand-primary hover:text-brand-darkgreen flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            Change Origin
          </button>
        </div>

        {/* Current Origin Display */}
        <div className="p-2.5 bg-brand-canvas rounded-xl border border-brand-border flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <div className="font-bold text-brand-darkgreen truncate">
              {tripContext.origin?.label || (isLocating ? 'Finding your location...' : 'Set your starting location')}
            </div>
            <div className="text-[10px] text-brand-muted flex items-center gap-2">
              <span>Source: {tripContext.origin?.source || 'Not set'}</span>
              <span>•</span>
              <span>Service Area: Chapel Hill / Durham</span>
            </div>
          </div>
        </div>

        {/* Location Selector Dropdown */}
        {(showLocationPicker || !tripContext.origin) && (
          <div className="mt-2 p-3 bg-white rounded-xl border border-brand-border shadow-soft space-y-2 text-xs animate-in fade-in">
            <OriginInput onSelect={point => {onSetOrigin(point); setShowLocationPicker(false);}} />

            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full p-2 rounded-lg bg-brand-lightgreen text-brand-darkgreen hover:bg-brand-sage hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isLocating ? (isRetrying ? 'Retrying with lower accuracy...' : 'Locating...') : 'Use Current GPS Location'}</span>
            </button>

            {error && (
              <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  <button onClick={clearError} className="underline text-[10px] font-bold mt-0.5">
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="pt-1 text-[11px] text-brand-muted font-medium">Or Pick a Demo Location:</div>
            <div className="space-y-1">
              {DEMO_ORIGIN_LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectDemoOrigin(loc.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-brand-canvas border border-transparent hover:border-brand-border text-xs text-brand-text flex items-center justify-between"
                >
                  <span className="font-semibold">{loc.label}</span>
                  <span className="text-[10px] text-brand-muted">{loc.note}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Destination Mode Selector */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-brand-border/60 text-xs">
          <span className="font-semibold text-brand-muted text-[11px]">Trip End:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetDestinationMode('return_to_origin')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                tripContext.destinationMode === 'return_to_origin'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-canvas text-brand-muted hover:text-brand-text border border-brand-border'
              }`}
            >
              Return to Start
            </button>
            <button
              onClick={() => onSetDestinationMode('finish_at_last_store')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                tripContext.destinationMode === 'finish_at_last_store'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-brand-canvas text-brand-muted hover:text-brand-text border border-brand-border'
              }`}
            >
              End at Last Store
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
