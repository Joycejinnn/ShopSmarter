import React from 'react';
import { ShoppingPlan, TripContext } from '../../types';
import {
  DollarSign,
  Clock,
  Weight,
  Sparkles,
  Navigation,
  AlertTriangle,
  ArrowRight,
  Store,
  CheckCircle2
} from 'lucide-react';

interface RouteSummaryCardProps {
  plan: ShoppingPlan;
  tripContext: TripContext;
  onStartShopping: () => void;
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({
  plan,
  tripContext,
  onStartShopping
}) => {

  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-card space-y-3">
      {/* Explanation Banner */}
      <div className="p-3 bg-brand-lightgreen/50 rounded-xl border border-brand-sage/40 text-xs text-brand-darkgreen flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong>Recommendation: </strong>
          {plan.explanation}
        </div>
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 bg-brand-canvas rounded-xl border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">
            {plan.totalTripCost > 0 ? 'Goods + Fare' : 'Total goods cost'}
          </div>
          <div className="text-base sm:text-lg font-extrabold text-brand-darkgreen mt-0.5">
            ${plan.totalCost.toFixed(2)}
          </div>
          {plan.totalTripCost > 0 && (
            <div className="text-[10px] text-blue-700 font-medium">
              incl. ${plan.totalTripCost.toFixed(2)} bus fare
            </div>
          )}
        </div>

        <div className="p-2.5 bg-brand-canvas rounded-xl border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">
            Total Time
          </div>
          <div className="text-base sm:text-lg font-extrabold text-brand-darkgreen mt-0.5">
            {plan.totalTripMinutes} min
          </div>
          <div className="text-[10px] text-brand-muted">
            {plan.totalTravelMinutes}m travel + {plan.totalShoppingMinutes}m shop
          </div>
        </div>

        <div className="p-2.5 bg-brand-canvas rounded-xl border border-brand-border">
          <div className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">
            Estimated weight
          </div>
          <div
            className="text-base sm:text-lg font-extrabold mt-0.5 text-brand-darkgreen"
          >
            {plan.totalWeightKg.toFixed(1)} kg
          </div>

        </div>
      </div>

      {/* Warnings & Infeasibility Alerts */}
      {!plan.isFeasible && plan.feasibilityIssues.length > 0 && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            This plan needs attention
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-700">
            {plan.feasibilityIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Route Journey Stops Timeline */}
      {plan.routeStops.length > 0 && (
        <details className="quick-add pt-2 border-t border-brand-border/60"><summary>Route details · {plan.routeStops.length} stops</summary>
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-2">
            Trip Stop Sequence ({plan.routeStops.length} stops)
          </div>

          <div className="space-y-1.5 text-xs">
            {/* Origin */}
            <div className="flex items-center gap-2 text-brand-muted">
              <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                S
              </span>
              <span className="truncate">Start: {tripContext.origin.label}</span>
            </div>

            {/* Stops */}
            {plan.routeStops.map((stop, idx) => {
              const seg = plan.routeSegments[idx];
              return (
                <React.Fragment key={stop.id}>
                  {seg && (
                    <div className="pl-2.5 py-0.5 text-[10px] text-brand-muted border-l-2 border-dashed border-brand-border ml-2.5 flex items-start gap-1">
                      <ArrowRight className="w-3 h-3 text-brand-sage mt-0.5 shrink-0" />
                      {seg.transitDetails ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-blue-700">
                            🚌 {seg.transitRouteName || 'Bus'} ({seg.durationMinutes} min{seg.transitFare !== undefined ? ` · ${seg.transitFare === 0 ? 'Free' : '$' + seg.transitFare.toFixed(2)}` : ''})
                          </span>
                          {seg.boardingStop && seg.debarkingStop && (
                            <span className="text-[9px] text-stone-500">
                              {seg.boardingStop.split('(')[0].trim()} → {seg.debarkingStop.split('(')[0].trim()}
                            </span>
                          )}
                          {seg.transferStop && (
                            <span className="text-[9px] text-amber-700 font-medium">
                              🔄 Transfer at {seg.transferStop.split('(')[0].trim()}
                            </span>
                          )}
                          {seg.firstMileWalkMeters !== undefined && seg.firstMileWalkMeters > 150 && (
                            <span className="text-[9px] text-stone-600">
                              🚶 Walk {seg.firstMileWalkMeters > 1000 ? (seg.firstMileWalkMeters / 1000).toFixed(1) + 'km' : seg.firstMileWalkMeters + 'm'} ({seg.firstMileWalkMinutes || 1}m) to stop{seg.isTransitDesert ? ' · ⚠️ Low transit coverage' : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>
                          {seg.durationMinutes} min ({tripContext.transportMode})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 font-bold text-brand-darkgreen">
                    <span className="w-5 h-5 rounded-full bg-brand-darkgreen text-white flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{stop.name}</span>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Destination */}
            {tripContext.destinationMode === 'return_to_origin' && (
              <>
                <div className="pl-2.5 py-0.5 text-[10px] text-brand-muted border-l-2 border-dashed border-brand-border ml-2.5 flex items-start gap-1">
                  <ArrowRight className="w-3 h-3 text-brand-sage mt-0.5 shrink-0" />
                  {plan.routeSegments[plan.routeSegments.length - 1]?.transitDetails ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-blue-700">
                        🚌 {plan.routeSegments[plan.routeSegments.length - 1].transitRouteName || 'Bus'} ({plan.routeSegments[plan.routeSegments.length - 1].durationMinutes} min return{plan.routeSegments[plan.routeSegments.length - 1].transitFare !== undefined ? ` · ${plan.routeSegments[plan.routeSegments.length - 1].transitFare === 0 ? 'Free' : '$' + plan.routeSegments[plan.routeSegments.length - 1].transitFare?.toFixed(2)}` : ''})
                      </span>
                      {plan.routeSegments[plan.routeSegments.length - 1].boardingStop && plan.routeSegments[plan.routeSegments.length - 1].debarkingStop && (
                        <span className="text-[9px] text-stone-500">
                          {plan.routeSegments[plan.routeSegments.length - 1].boardingStop?.split('(')[0].trim()} → {plan.routeSegments[plan.routeSegments.length - 1].debarkingStop?.split('(')[0].trim()}
                        </span>
                      )}
                      {plan.routeSegments[plan.routeSegments.length - 1].transferStop && (
                        <span className="text-[9px] text-amber-700 font-medium">
                          🔄 Transfer at {plan.routeSegments[plan.routeSegments.length - 1].transferStop?.split('(')[0].trim()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>
                      {plan.routeSegments[plan.routeSegments.length - 1]?.durationMinutes || 8} min return
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-brand-muted">
                  <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    E
                  </span>
                  <span className="truncate">Return to {tripContext.origin.label}</span>
                </div>
              </>
            )}
          </div>
        </details>
      )}

      {/* Start Shopping CTA */}
      <button
        onClick={onStartShopping}
        disabled={plan.routeStops.length === 0}
        className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-card transition-all ${
          plan.routeStops.length > 0
            ? 'bg-brand-primary text-white hover:bg-brand-darkgreen hover:shadow-floating active:scale-98'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
        }`}
      >
        <Navigation className="w-4 h-4" />
        <span>Start shopping</span>
      </button>
    </div>
  );
};
