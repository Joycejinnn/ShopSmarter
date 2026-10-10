import React from 'react';
import { StoreAllocation } from '../../types';
import { Store, MapPin, Tag, Weight, Sparkles, CheckCircle2 } from 'lucide-react';

interface StoreAllocationCardProps {
  allocation: StoreAllocation;
  stopIndex: number;
}

export const StoreAllocationCard: React.FC<StoreAllocationCardProps> = ({
  allocation,
  stopIndex
}) => {
  const { store, items, subtotalCost, totalWeightKg } = allocation;

  // Determine plain English rationale badge
  let selectionReason = 'Best combination of price and proximity';
  if (store.id === 'store_asian_market') {
    selectionReason = 'Exclusive provider for authentic Asian specialty ingredients';
  } else if (store.id === 'store_food_lion') {
    selectionReason = 'Lowest prices on everyday produce & dairy staples';
  } else if (store.id === 'store_target') {
    selectionReason = 'Optimal pricing on paper goods, laundry & toiletries';
  } else if (store.id === 'store_walmart') {
    selectionReason = 'Lowest overall bulk pricing on pantry staples & household goods';
  } else if (store.id === 'store_harris_teeter') {
    selectionReason = 'Closest walking proximity to origin with fresh premium ingredients';
  }

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-border shadow-card overflow-hidden hover:border-brand-sage/60 transition-all">
      {/* Store Header */}
      <div className="p-4 bg-brand-canvas/70 border-b border-brand-border flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-darkgreen text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">
            {stopIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-brand-darkgreen">{store.name}</h4>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-subtle text-brand-muted">
                {store.category}
              </span>
            </div>
            <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-extrabold text-brand-darkgreen">
            ${subtotalCost.toFixed(2)}
          </div>
          <div className="text-[10px] text-brand-muted flex items-center justify-end gap-1 mt-0.5">
            <Weight className="w-3 h-3" />
            <span>{totalWeightKg.toFixed(2)} kg</span>
          </div>
        </div>
      </div>

      {/* Rationale Pill */}
      <div className="px-4 py-2 bg-brand-lightgreen/40 border-b border-brand-border/40 text-[11px] text-brand-darkgreen flex items-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" />
        <span>{selectionReason}</span>
      </div>

      {/* Items Assigned to Store */}
      <div className="divide-y divide-brand-border/50 p-2">
        {items.map(({ requirement, option }, idx) => (
          <div
            key={requirement.ingredientId + idx}
            className="p-2.5 flex items-center justify-between gap-3 hover:bg-brand-canvas/30 rounded-xl transition-colors text-xs"
          >
            <div className="min-w-0">
              <div className="font-bold text-brand-darkgreen truncate flex items-center gap-1.5">
                <span>{option.product.name}</span>
                <span className="text-[10px] font-normal text-stone-400">
                  ({option.product.brand})
                </span>
              </div>
              <div className="text-[11px] text-brand-muted flex items-center gap-2 mt-0.5">
                <span>
                  Needed: {requirement.shortfall} {requirement.unit}
                </span>
                <span>•</span>
                <span className="text-brand-darkgreen font-semibold">
                  Buying: {option.packs} × {option.offer.packQuantity} {option.offer.unit}
                </span>
                {option.surplus > 0 && (
                  <span className="text-emerald-700 bg-emerald-50 px-1 rounded text-[10px]">
                    +{option.surplus} surplus
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-bold text-brand-darkgreen text-xs">
                ${option.totalCost.toFixed(2)}
              </div>
              <div className="text-[10px] text-stone-400">
                {option.packs} × ${option.offer.packPrice.toFixed(2)}
              </div>
              <span className="text-[9px] text-stone-400 block">Demo estimate</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      <div className="p-3 bg-brand-canvas/50 border-t border-brand-border flex items-center justify-between text-xs font-semibold text-brand-darkgreen">
        <span className="text-brand-muted text-[11px]">
          {items.length} product(s) assigned
        </span>
        <div className="flex items-center gap-3">
          <span>Carry Weight: {totalWeightKg.toFixed(1)} kg</span>
          <span className="font-extrabold text-sm text-brand-primary">
            Subtotal: ${subtotalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
