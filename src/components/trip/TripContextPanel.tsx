import React, { useState } from 'react';
import {
  TripContext,
  TransportationMode,
  CarryingBagType,
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
  tripContext: TripContext;
  onSetTransportMode: (mode: TransportationMode) => void;
  onSetCarryingBagType: (bag: CarryingBagType, customWeight?: number) => void;
  onSetOrigin: (origin: LocationPoint) => void;
  onSetDestinationMode: (
    mode: 'return_to_origin' | 'another_location' | 'finish_at_last_store',
    location?: LocationPoint
  ) => void;
  currentPlanWeightKg: number;
}

export const TripContextPanel: React.FC<TripContextPanelProps> = ({
  tripContext,
  onSetTransportMode,
  onSetCarryingBagType,
  onSetOrigin,
  onSetDestinationMode,
  currentPlanWeightKg
}) => {
  const { requestBrowserLocation, isLocating, error, clearError } = useGeolocation();
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

  const isOverweight = currentPlanWeightKg > tripContext.carryingCapacityKg;
  const weightPercent = Math.min(100, Math.round((currentPlanWeightKg / tripContext.carryingCapacityKg) * 100));

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
              {tripContext.origin.label}
            </div>
            <div className="text-[10px] text-brand-muted flex items-center gap-2">
              <span>Source: {tripContext.origin.source}</span>
              <span>•</span>
              <span>Service Area: Chapel Hill / Durham</span>
            </div>
          </div>
        </div>

        {/* Location Selector Dropdown */}
        {showLocationPicker && (
          <div className="mt-2 p-3 bg-white rounded-xl border border-brand-border shadow-soft space-y-2 text-xs animate-in fade-in">
            <div className="font-semibold text-brand-darkgreen text-[11px]">Choose Starting Location:</div>

            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full p-2 rounded-lg bg-brand-lightgreen text-brand-darkgreen hover:bg-brand-sage hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Locating...' : 'Use Current GPS Location'}</span>
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

      {/* Multimodal Transportation Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-brand-primary" />
            Transportation Mode
          </span>
          <span className="text-[11px] font-normal text-brand-muted">Multimodal Routing</span>
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { mode: 'walking', label: 'Walking', icon: Footprints },
            { mode: 'transit', label: 'Transit', icon: Bus },
            { mode: 'cycling', label: 'Cycling', icon: Bike },
            { mode: 'driving', label: 'Driving', icon: Car }
          ].map(({ mode, label, icon: Icon }) => {
            const isSelected = tripContext.transportMode === mode;
            const config = TRANSPORT_MODES_CONFIG[mode as TransportationMode];
            return (
              <button
                key={mode}
                onClick={() => onSetTransportMode(mode as TransportationMode)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-brand-lightgreen border-brand-primary text-brand-darkgreen shadow-sm ring-1 ring-brand-primary font-bold'
                    : 'bg-brand-canvas border-brand-border text-brand-muted hover:bg-stone-100 font-medium'
                }`}
                title={config.description}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-primary' : 'text-stone-500'}`} />
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-brand-muted mt-1.5">
          {TRANSPORT_MODES_CONFIG[tripContext.transportMode].description}
        </div>
      </div>

      {/* Carrying Capacity & Bag Limits */}
      <div className="pt-2 border-t border-brand-border/60">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-brand-primary" />
            Carrying Capacity
          </label>
          <span className="text-xs font-bold text-brand-darkgreen">
            {currentPlanWeightKg.toFixed(1)} / {tripContext.carryingCapacityKg} kg
          </span>
        </div>

        {/* Capacity options */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { bag: 'backpack', label: 'Backpack (5kg)' },
            { bag: 'one_bag', label: '1 Bag (8kg)' },
            { bag: 'two_bags', label: '2 Bags (15kg)' }
          ].map(({ bag, label }) => (
            <button
              key={bag}
              onClick={() => onSetCarryingBagType(bag as CarryingBagType)}
              className={`p-1.5 rounded-lg border text-center text-xs transition-all ${
                tripContext.carryingBagType === bag
                  ? 'bg-brand-primary text-white font-bold border-brand-primary shadow-xs'
                  : 'bg-brand-canvas border-brand-border text-brand-muted hover:bg-stone-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Weight Bar Gauge */}
        <div className="mt-2.5">
          <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverweight
                  ? 'bg-red-500'
                  : weightPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-brand-emerald'
              }`}
              style={{ width: `${Math.min(100, weightPercent)}%` }}
            />
          </div>

          {isOverweight && (
            <div className="mt-1.5 p-2 bg-red-50 rounded-lg border border-red-200 text-red-700 text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Plan weight ({currentPlanWeightKg.toFixed(1)} kg) exceeds carrying capacity ({tripContext.carryingCapacityKg} kg). Consider choosing a 2-bag option or switching transport mode to driving.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
