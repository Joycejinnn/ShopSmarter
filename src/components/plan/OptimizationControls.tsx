import React from 'react';
import { OptimizationPriority } from '../../types';
import { DEMO_STORES } from '../../data/stores';
import { DollarSign, Clock, Scale, SlidersHorizontal, CheckSquare, Square } from 'lucide-react';

interface OptimizationControlsProps {
  optimizationMode: OptimizationPriority;
  onSetOptimizationMode: (mode: OptimizationPriority) => void;
  maxStops: number;
  onSetMaxStops: (stops: number) => void;
  excludedStoreIds: string[];
  onToggleStoreExclusion: (storeId: string) => void;
}

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({
  optimizationMode,
  onSetOptimizationMode,
  maxStops,
  onSetMaxStops,
  excludedStoreIds,
  onToggleStoreExclusion
}) => {
  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-card space-y-3">
      {/* Priority Selector */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-primary" />
          Plan preference
        </label>

      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          aria-pressed={optimizationMode === 'money'} onClick={() => onSetOptimizationMode('money')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            optimizationMode === 'money'
              ? 'bg-emerald-50 border-brand-emerald text-brand-darkgreen shadow-sm ring-1 ring-brand-emerald'
              : 'bg-brand-canvas border-brand-border text-brand-muted hover:bg-stone-100'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save Money</span>
          </div>
          <div className="text-[10px] mt-0.5 opacity-80 leading-tight">
            Lowest product & transit cost
          </div>
        </button>

        <button
          aria-pressed={optimizationMode === 'time'} onClick={() => onSetOptimizationMode('time')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            optimizationMode === 'time'
              ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-1 ring-blue-400'
              : 'bg-brand-canvas border-brand-border text-brand-muted hover:bg-stone-100'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Save Time</span>
          </div>
          <div className="text-[10px] mt-0.5 opacity-80 leading-tight">
            Min travel & store minutes
          </div>
        </button>

        <button
          aria-pressed={optimizationMode === 'balanced'} onClick={() => onSetOptimizationMode('balanced')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            optimizationMode === 'balanced'
              ? 'bg-brand-lightgreen border-brand-primary text-brand-darkgreen shadow-sm ring-1 ring-brand-primary'
              : 'bg-brand-canvas border-brand-border text-brand-muted hover:bg-stone-100'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Scale className="w-3.5 h-3.5 text-brand-primary" />
            <span>Balanced</span>
          </div>
          <div className="text-[10px] mt-0.5 opacity-80 leading-tight">
            50/50 cost & time tradeoff
          </div>
        </button>
      </div>

      <details className="quick-add"><summary>Store preferences <span>Up to {maxStops} stops · {DEMO_STORES.length - excludedStoreIds.length} stores included</span></summary>
      {/* Constraints: Max Stops & Excluded Stores */}
      <div className="pt-2 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-brand-muted text-[11px]">Max Stores to Visit:</span>
          <div className="flex items-center gap-1 bg-brand-canvas p-1 rounded-lg border border-brand-border">
            {[1, 2, 3].map((stops) => (
              <button
                key={stops}
                onClick={() => onSetMaxStops(stops)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                  maxStops === stops
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {stops}
              </button>
            ))}
          </div>
        </div>

        {/* Store exclusions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-brand-muted text-[11px] mr-1">Include Stores:</span>
          {DEMO_STORES.map((store) => {
            const isExcluded = excludedStoreIds.includes(store.id);
            return (
              <button
                key={store.id} aria-pressed={!isExcluded}
                onClick={() => onToggleStoreExclusion(store.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-all ${
                  isExcluded
                    ? 'bg-stone-100 text-stone-400 border-stone-200 line-through'
                    : 'bg-white text-brand-darkgreen border-brand-border shadow-xs hover:border-brand-sage'
                }`}
                title={isExcluded ? `Excluded. Click to include ${store.name}` : `Included. Click to exclude ${store.name}`}
              >
                {isExcluded ? (
                  <Square className="w-2.5 h-2.5 text-stone-400" />
                ) : (
                  <CheckSquare className="w-2.5 h-2.5 text-brand-emerald" />
                )}
                <span>{store.name.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>
      </details>
    </div>
  );
};
