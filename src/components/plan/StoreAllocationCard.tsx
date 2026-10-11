import React from 'react';
import { StoreAllocation, ShoppingSession, StoreAllocationItem } from '../../types';
import { Store, MapPin, Tag, Weight, Sparkles, CheckCircle2 } from 'lucide-react';

interface StoreAllocationCardProps {
  allocation: StoreAllocation;
  stopIndex: number;
  purchasedItems: ShoppingSession["purchasedItems"];
  onSetPurchased: (item: StoreAllocationItem, storeId: string, checked: boolean) => void;
}

export const StoreAllocationCard: React.FC<StoreAllocationCardProps> = ({
  allocation,
  stopIndex, purchasedItems, onSetPurchased
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
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-brand-darkgreen text-white flex items-center justify-center font-extrabold text-xs shadow-sm shrink-0">
            {stopIndex + 1}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-sm text-brand-darkgreen">{store.name}</h4>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-subtle text-brand-muted">
                {store.category}
              </span>
            </div>
            <div className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
              <span className="break-words">{store.address}</span>
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

      <ul className="purchase-list" aria-label={`${store.name} shopping list`}>
        {items.filter(item => item.requirement.shortfall > 0).map(item => {
          const {requirement, option} = item;
          const checked = purchasedItems.some(p => p.storeId === store.id && p.requirement.ingredientId === requirement.ingredientId && p.option.offer.offerId === option.offer.offerId && p.option.buyQuantity === option.buyQuantity);
          return <li key={requirement.ingredientId} className={checked ? 'purchase-row is-purchased' : 'purchase-row'}>
            <label className="purchase-label"><input type="checkbox" checked={checked} onChange={e => onSetPurchased(item, store.id, e.target.checked)} /><span><span className="purchase-name">{option.product.name}</span><span className="purchase-quantity">{option.packs} × {option.offer.packQuantity} {option.offer.unit}{checked ? ' · Purchased' : ''}</span></span></label>
            <span className="purchase-price">${option.totalCost.toFixed(2)}</span>
            <details className="purchase-details"><summary>Package details</summary><p>{option.product.brand} · Needed: {requirement.shortfall} {requirement.unit} · {option.packs} × ${option.offer.packPrice.toFixed(2)}{option.surplus > 0 ? ` · ${option.surplus} extra ${option.offer.unit}` : ''}</p></details>
          </li>;
        })}
      </ul>
    </div>
  );
};
