import React, { useState } from 'react';
import { IngredientRequirement, ShoppingPlan } from '../../types';
import { ListFilter, ChevronDown, ChevronUp, PackageCheck, AlertTriangle } from 'lucide-react';

interface RequirementsBreakdownProps {
  requirements: IngredientRequirement[];
  plan: ShoppingPlan;
}

export const RequirementsBreakdown: React.FC<RequirementsBreakdownProps> = ({
  requirements,
  plan
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (requirements.length === 0) return null;

  const totalItems = requirements.length;
  const itemsWithShortfall = requirements.filter((r) => r.shortfall > 0).length;
  const zeroShortfallItems = totalItems - itemsWithShortfall;

  return (
    <div className="bg-brand-card rounded-2xl border border-brand-border shadow-card overflow-hidden">
      <button type="button" aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-center justify-between cursor-pointer hover:bg-brand-canvas/50 transition-colors select-none"
      >
        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen">
            Pantry deductions
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-lightgreen text-brand-darkgreen font-semibold">
            {itemsWithShortfall} needed to buy
          </span>
          {zeroShortfallItems > 0 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium hidden sm:inline">
              {zeroShortfallItems} fully in pantry
            </span>
          )}
        </div>

        <span className="text-brand-muted">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-brand-border/60">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-canvas text-brand-muted uppercase text-[10px] tracking-wider border-b border-brand-border">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Item & Category</th>
                  <th className="py-2.5 px-3 font-semibold">Sources</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Required</th>
                  <th className="py-2.5 px-3 font-semibold text-center">In Pantry</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-brand-darkgreen">Still Needed</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Assigned Buy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {requirements.map((req) => {
                  // Find purchase option in plan
                  let assignedOption: { storeName: string; packs: number; packQty: number; unit: string; cost: number } | null = null;

                  for (const alloc of plan.storeAllocations) {
                    const found = alloc.items.find((i) => i.requirement.ingredientId === req.ingredientId);
                    if (found) {
                      assignedOption = {
                        storeName: alloc.store.name.split('(')[0].trim(),
                        packs: found.option.packs,
                        packQty: found.option.offer.packQuantity,
                        unit: found.option.offer.unit,
                        cost: found.option.totalCost
                      };
                      break;
                    }
                  }

                  const isUnresolved = plan.unresolvedRequirements.some(
                    (ur) => ur.ingredientId === req.ingredientId
                  );

                  return (
                    <tr
                      key={req.ingredientId + (req.isDirectPurchase ? '_direct' : '')}
                      className={req.shortfall === 0 ? 'bg-emerald-50/30 opacity-70' : 'hover:bg-brand-canvas/40'}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-brand-darkgreen">{req.name}</div>
                        <div className="text-[10px] text-brand-muted">{req.category}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-[11px] text-stone-600 space-y-0.5">
                          {req.sourceContributions.map((sc, i) => (
                            <div key={i} className="truncate max-w-[140px]">
                              {sc.sourceName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-medium">
                        {req.totalRequired} {req.unit}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {req.isDirectPurchase ? (
                          <span className="text-[10px] text-brand-muted italic">Direct Buy</span>
                        ) : req.pantryAvailable > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            {req.pantryAvailable} {req.unit}
                          </span>
                        ) : (
                          <span className="text-stone-400">0</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center font-bold">
                        {req.shortfall > 0 ? (
                          <span className="text-brand-orange">
                            {req.shortfall} {req.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center justify-center gap-1">
                            <PackageCheck className="w-3.5 h-3.5" /> Met
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {assignedOption ? (
                          <div>
                            <div className="font-bold text-brand-darkgreen">
                              {assignedOption.packs} pack ({assignedOption.packs * assignedOption.packQty} {assignedOption.unit})
                            </div>
                            <div className="text-[10px] text-brand-muted">
                              @ {assignedOption.storeName} • ${assignedOption.cost.toFixed(2)}
                            </div>
                          </div>
                        ) : isUnresolved ? (
                          <span className="text-red-500 font-medium text-[11px] flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3 h-3" /> No offer found
                          </span>
                        ) : req.shortfall === 0 ? (
                          <span className="text-emerald-600 text-[11px] italic">From Pantry</span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
