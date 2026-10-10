import React, { useState } from 'react';
import { ShoppingPlan, ShoppingSession, StoreAllocationItem, Store } from '../../types';
import {
  CheckCircle2,
  XCircle,
  SkipForward,
  Navigation,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Award,
  PlusCircle,
  X
} from 'lucide-react';

interface ShoppingModeModalProps {
  session: ShoppingSession;
  plan: ShoppingPlan;
  onMarkPurchased: (item: StoreAllocationItem, storeId: string) => void;
  onMarkOutOfStock: (item: StoreAllocationItem, storeId: string) => void;
  onCompleteTrip: () => void;
  onCancelShopping: () => void;
}

export const ShoppingModeModal: React.FC<ShoppingModeModalProps> = ({
  session,
  plan,
  onMarkPurchased,
  onMarkOutOfStock,
  onCompleteTrip,
  onCancelShopping
}) => {
  const [currentStoreIdx, setCurrentStoreIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentAllocation = plan.storeAllocations[currentStoreIdx];
  const totalStores = plan.storeAllocations.length;

  const isItemPurchased = (reqId: string, storeId: string) =>
    session.purchasedItems.some(
      (pi) => pi.requirement.ingredientId === reqId && pi.storeId === storeId
    );

  const isItemSkipped = (reqId: string, storeId: string) =>
    session.skippedItems.some(
      (si) => si.requirement.ingredientId === reqId && si.storeId === storeId
    );

  const handleNextStore = () => {
    if (currentStoreIdx < totalStores - 1) {
      setCurrentStoreIdx(currentStoreIdx + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevStore = () => {
    if (currentStoreIdx > 0) {
      setCurrentStoreIdx(currentStoreIdx - 1);
    }
  };

  const totalAssignedItems = plan.storeAllocations.reduce((acc, a) => acc + a.items.length, 0);
  const totalPurchasedCount = session.purchasedItems.length;
  const progressPercent =
    totalAssignedItems > 0 ? Math.round((totalPurchasedCount / totalAssignedItems) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-floating border border-brand-border overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-darkgreen to-brand-primary text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Live Shopping In Progress
              </h2>
            </div>
            <p className="text-xs text-brand-lightgreen mt-0.5">
              Stop {currentStoreIdx + 1} of {totalStores}: {currentAllocation?.store.name}
            </p>
          </div>

          <button
            onClick={onCancelShopping}
            className="p-1.5 rounded-full text-brand-lightgreen hover:bg-white/10 transition-colors"
            title="Exit shopping mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trip Progress Bar */}
        <div className="w-full bg-brand-subtle h-2 shrink-0">
          <div
            className="bg-brand-emerald h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {!isCompleted ? (
            <>
              {/* Store Banner */}
              <div className="p-3 bg-brand-canvas rounded-2xl border border-brand-border flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                    Current Store (Stop {currentStoreIdx + 1})
                  </div>
                  <h3 className="font-extrabold text-base text-brand-darkgreen">
                    {currentAllocation?.store.name}
                  </h3>
                  <p className="text-xs text-brand-muted">{currentAllocation?.store.address}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-brand-primary block">
                    Subtotal: ${currentAllocation?.subtotalCost.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-brand-muted">
                    {currentAllocation?.items.length} items to pick up
                  </span>
                </div>
              </div>

              {/* Items Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-brand-darkgreen flex items-center justify-between">
                  <span>Items to purchase at this stop:</span>
                  <span className="text-[11px] font-normal text-brand-muted">
                    Tap to check off
                  </span>
                </div>

                <div className="divide-y divide-brand-border/60 border border-brand-border rounded-2xl overflow-hidden">
                  {currentAllocation?.items.map((item, idx) => {
                    const req = item.requirement;
                    const opt = item.option;
                    const storeId = currentAllocation.store.id;
                    const purchased = isItemPurchased(req.ingredientId, storeId);
                    const skipped = isItemSkipped(req.ingredientId, storeId);

                    return (
                      <div
                        key={req.ingredientId + idx}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          purchased
                            ? 'bg-emerald-50/70 text-emerald-950'
                            : skipped
                            ? 'bg-red-50/50 opacity-60'
                            : 'hover:bg-brand-canvas/40 bg-white'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-xs sm:text-sm ${
                                purchased ? 'line-through text-emerald-800' : 'text-brand-darkgreen'
                              }`}
                            >
                              {opt.product.name}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              ({opt.product.brand})
                            </span>
                          </div>

                          <div className="text-[11px] text-brand-muted flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-brand-primary">
                              Grab {opt.packs} pack ({opt.packs * opt.offer.packQuantity} {opt.offer.unit})
                            </span>
                            <span>•</span>
                            <span>Est: ${opt.totalCost.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {purchased ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Purchased
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => onMarkPurchased(item, storeId)}
                                className="px-3 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-darkgreen flex items-center gap-1 shadow-xs transition-all active:scale-95"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Got It</span>
                              </button>

                              <button
                                onClick={() => onMarkOutOfStock(item, storeId)}
                                className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors text-xs"
                                title="Mark Out of Stock"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Shopping Completion View */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-lightgreen text-brand-primary flex items-center justify-center mx-auto shadow-card animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-brand-darkgreen">
                  Shopping Trip Completed! 🎉
                </h3>
                <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
                  You successfully purchased {session.purchasedItems.length} items across{' '}
                  {totalStores} stores.
                </p>
              </div>

              <div className="p-4 bg-brand-canvas rounded-2xl border border-brand-border text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="font-bold text-brand-darkgreen">Purchased Receipt Summary:</div>
                <div className="divide-y divide-brand-border/60 max-h-40 overflow-y-auto pr-1">
                  {session.purchasedItems.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <span className="font-medium text-brand-darkgreen">
                        {item.option.product.name} ({item.option.packs} pack)
                      </span>
                      <span className="font-bold">${item.option.totalCost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onCompleteTrip}
                  className="px-6 py-3 rounded-2xl bg-brand-primary text-white font-extrabold text-sm hover:bg-brand-darkgreen shadow-floating transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Purchased Quantities to My Pantry</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        {!isCompleted && (
          <div className="p-4 bg-brand-canvas border-t border-brand-border flex items-center justify-between shrink-0">
            <button
              onClick={handlePrevStore}
              disabled={currentStoreIdx === 0}
              className="px-3 py-1.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-text disabled:opacity-30"
            >
              Previous Store
            </button>

            <button
              onClick={handleNextStore}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-darkgreen flex items-center gap-1.5 shadow-sm"
            >
              <span>{currentStoreIdx < totalStores - 1 ? 'Next Store Stop' : 'Finish Trip'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
