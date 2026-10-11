import React from 'react';
import { TransportationMode } from '../../types';
import { TRANSPORT_MODES_CONFIG } from '../../data/travelGraph';
import { Footprints, Bus, Bike, Car, Navigation } from 'lucide-react';
export function TransportSelector({mode, onChange}: {mode: TransportationMode; onChange: (mode: TransportationMode) => void}) { return <div className="bg-brand-card p-4 rounded-2xl border border-brand-border">
      {/* Multimodal Transportation Selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-brand-primary" />
            Transportation Mode
          </span>

        </label>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { value: 'walking', label: 'Walking', icon: Footprints },
            { value: 'transit', label: 'Transit', icon: Bus },
            { value: 'cycling', label: 'Cycling', icon: Bike },
            { value: 'driving', label: 'Driving', icon: Car }
          ].map(({ value, label, icon: Icon }) => {
            const isSelected = mode === value;
            const config = TRANSPORT_MODES_CONFIG[value as TransportationMode];
            return (
              <button
                key={value} aria-pressed={isSelected}
                onClick={() => onChange(value as TransportationMode)}
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
          {TRANSPORT_MODES_CONFIG[mode].description}
        </div>
      </div>

</div>; }
