import {
  IngredientRequirement,
  TripContext,
  ShoppingPlan,
  StoreAllocation,
  PurchaseOption,
  Store,
  RouteSegment,
  OptimizationPriority
} from '../types';
import { DEMO_STORES } from '../data/stores';
import { getAvailablePurchaseOptions } from './shortfallCalculator';
import { getRouteSegment, TRANSPORT_MODES_CONFIG } from '../data/travelGraph';

// Permutations helper for small arrays (1 to 3 items)
function getPermutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const remaining = [...items.slice(0, i), ...items.slice(i + 1)];
    const perms = getPermutations(remaining);
    for (const p of perms) {
      result.push([current, ...p]);
    }
  }
  return result;
}

// Generate power set subsets up to maxStops
function getStoreCombinations(stores: Store[], maxStops: number): Store[][] {
  const combinations: Store[][] = [];

  function helper(start: number, current: Store[]) {
    if (current.length > 0 && current.length <= maxStops) {
      combinations.push([...current]);
    }
    if (current.length === maxStops) return;

    for (let i = start; i < stores.length; i++) {
      current.push(stores[i]);
      helper(i + 1, current);
      current.pop();
    }
  }

  helper(0, []);
  return combinations;
}

interface CandidatePlanInternal {
  storeAllocations: StoreAllocation[];
  routeStops: Store[];
  routeSegments: RouteSegment[];
  totalGoodsCost: number;
  totalTripCost: number;
  totalCost: number;
  totalTravelMinutes: number;
  totalShoppingMinutes: number;
  totalTripMinutes: number;
  totalWeightKg: number;
  isFeasible: boolean;
  feasibilityIssues: string[];
}

export function optimizeShoppingPlan(
  requirements: IngredientRequirement[],
  tripContext: TripContext,
  mode: OptimizationPriority
): ShoppingPlan {
  const activeRequirements = requirements.filter((r) => r.shortfall > 0);

  // If no shopping needed, return empty feasible plan
  if (activeRequirements.length === 0) {
    return {
      mode,
      storeAllocations: [],
      unresolvedRequirements: [],
      routeStops: [],
      routeSegments: [],
      totalGoodsCost: 0,
      totalTripCost: 0,
      totalCost: 0,
      totalTravelMinutes: 0,
      totalShoppingMinutes: 0,
      totalTripMinutes: 0,
      totalWeightKg: 0,
      isFeasible: true,
      feasibilityIssues: [],
      explanation: 'All ingredients are already in stock in your pantry! No shopping trip required.',
      calculatedAt: new Date().toISOString(),
      isOptimalWithinScope: true
    };
  }

  // 1. Identify which requirements have NO offers anywhere in candidate stores
  const candidateStores = DEMO_STORES.filter(
    (s) => !tripContext.excludedStoreIds.includes(s.id)
  );

  const unresolvedRequirements: IngredientRequirement[] = [];
  const fulfillableRequirements: IngredientRequirement[] = [];

  for (const req of activeRequirements) {
    const allOptions = getAvailablePurchaseOptions(
      req,
      candidateStores.map((s) => s.id)
    );
    if (allOptions.length === 0) {
      unresolvedRequirements.push(req);
    } else {
      fulfillableRequirements.push(req);
    }
  }

  // 2. Enumerate store subsets of size 1 to maxStops
  const storeSubsets = getStoreCombinations(
    candidateStores,
    Math.min(tripContext.maxStops, 3)
  );

  const candidatePlans: CandidatePlanInternal[] = [];

  for (const storeSubset of storeSubsets) {
    const storeIds = storeSubset.map((s) => s.id);

    // Check if this subset can fulfill all fulfillableRequirements
    let canFulfillAll = true;
    const reqOptionsMap = new Map<string, PurchaseOption[]>();

    for (const req of fulfillableRequirements) {
      const options = getAvailablePurchaseOptions(req, storeIds);
      if (options.length === 0) {
        canFulfillAll = false;
        break;
      }
      reqOptionsMap.set(req.ingredientId, options);
    }

    if (!canFulfillAll) {
      continue; // This subset cannot cover the shopping list
    }

    // For valid subsets, find the optimal offer assignment for this subset
    // Depending on mode, choose lowest cost offer or fastest store assignment
    const chosenOptions: { requirement: IngredientRequirement; option: PurchaseOption }[] = [];

    for (const req of fulfillableRequirements) {
      const options = reqOptionsMap.get(req.ingredientId) || [];
      if (options.length === 0) continue;

      // Sort options:
      // In 'money' mode: strictly lowest price
      // In 'time' or 'balanced' mode: prefer lowest price among candidate stores
      options.sort((a, b) => a.totalCost - b.totalCost || a.totalWeightKg - b.totalWeightKg);
      chosenOptions.push({
        requirement: req,
        option: options[0]
      });
    }

    // Determine stores actually used
    const usedStoreIds = new Set(chosenOptions.map((co) => co.option.offer.storeId));
    const actuallyUsedStores = storeSubset.filter((s) => usedStoreIds.has(s.id));
    if (actuallyUsedStores.length === 0) continue;

    // Group items into StoreAllocation
    const allocations: StoreAllocation[] = actuallyUsedStores.map((store) => {
      const storeItems = chosenOptions.filter((co) => co.option.offer.storeId === store.id);
      const subtotalCost = storeItems.reduce((acc, i) => acc + i.option.totalCost, 0);
      const totalWeightKg = storeItems.reduce((acc, i) => acc + i.option.totalWeightKg, 0);
      const packCount = storeItems.reduce((acc, i) => acc + i.option.packs, 0);

      return {
        store,
        items: storeItems.map((si) => ({
          requirement: si.requirement,
          option: si.option,
          shoppingStatus: 'pending'
        })),
        subtotalCost: Math.round(subtotalCost * 100) / 100,
        totalWeightKg: Math.round(totalWeightKg * 100) / 100,
        packCount
      };
    });

    const totalGoodsCost = Math.round(
      allocations.reduce((acc, a) => acc + a.subtotalCost, 0) * 100
    ) / 100;
    const totalWeightKg = Math.round(
      allocations.reduce((acc, a) => acc + a.totalWeightKg, 0) * 100
    ) / 100;

    // Evaluate Visit Order Permutations
    const permutations = getPermutations(actuallyUsedStores);
    let bestPermutation: Store[] = actuallyUsedStores;
    let bestSegments: RouteSegment[] = [];
    let bestTravelMinutes = Infinity;


    for (const perm of permutations) {
      const segments: RouteSegment[] = [];
      let currentPoint = {
        name: tripContext.origin.label,
        coords: [tripContext.origin.lat, tripContext.origin.lng] as [number, number]
      };
      let permTravelMinutes = 0;
      let permDistanceMeters = 0;

      // Leg 1: Origin to first store, then store to store
      for (const st of perm) {
        const seg = getRouteSegment(
          currentPoint.name,
          currentPoint.coords,
          st.name,
          [st.lat, st.lng],
          tripContext.transportMode
        );
        segments.push(seg);
        permTravelMinutes += seg.durationMinutes;
        permDistanceMeters += seg.distanceMeters;
        currentPoint = {
          name: st.name,
          coords: [st.lat, st.lng]
        };
      }

      // Final Leg: To destination or back home
      if (tripContext.destinationMode === 'return_to_origin') {
        const returnSeg = getRouteSegment(
          currentPoint.name,
          currentPoint.coords,
          tripContext.origin.label,
          [tripContext.origin.lat, tripContext.origin.lng],
          tripContext.transportMode
        );
        segments.push(returnSeg);
        permTravelMinutes += returnSeg.durationMinutes;
        permDistanceMeters += returnSeg.distanceMeters;
      } else if (
        tripContext.destinationMode === 'another_location' &&
        tripContext.destinationLocation
      ) {
        const dest = tripContext.destinationLocation;
        const destSeg = getRouteSegment(
          currentPoint.name,
          currentPoint.coords,
          dest.label,
          [dest.lat, dest.lng],
          tripContext.transportMode
        );
        segments.push(destSeg);
        permTravelMinutes += destSeg.durationMinutes;
        permDistanceMeters += destSeg.distanceMeters;
      }

      if (permTravelMinutes < bestTravelMinutes) {
        bestTravelMinutes = permTravelMinutes;
        bestPermutation = perm;
        bestSegments = segments;

      }
    }

    const shoppingMinutesPerStore = 12;
    const totalShoppingMinutes = actuallyUsedStores.length * shoppingMinutesPerStore;
    const totalTripMinutes = bestTravelMinutes + totalShoppingMinutes;
    const totalTransitCost = tripContext.transportMode === 'transit'
      ? Math.round(bestSegments.reduce((acc, s) => acc + (s.transitFare || 0), 0) * 100) / 100
      : 0;
    const totalCost = Math.round((totalGoodsCost + totalTransitCost) * 100) / 100;

    // Check constraints
    const feasibilityIssues: string[] = [];
    let isFeasible = true;

    if (tripContext.maxBudget && totalCost > tripContext.maxBudget) {
      isFeasible = false;
      feasibilityIssues.push(
        `Total cost ($${totalCost.toFixed(2)}) exceeds shopping budget of $${tripContext.maxBudget.toFixed(2)}.`
      );
    }

    candidatePlans.push({
      storeAllocations: allocations,
      routeStops: bestPermutation,
      routeSegments: bestSegments,
      totalGoodsCost,
      totalTripCost: totalTransitCost,
      totalCost,
      totalTravelMinutes: bestTravelMinutes,
      totalShoppingMinutes,
      totalTripMinutes,
      totalWeightKg,
      isFeasible,
      feasibilityIssues
    });
  }

  // Deduplicate and rank candidate plans
  if (candidatePlans.length === 0) {
    return {
      mode,
      storeAllocations: [],
      unresolvedRequirements: activeRequirements,
      routeStops: [],
      routeSegments: [],
      totalGoodsCost: 0,
      totalTripCost: 0,
      totalCost: 0,
      totalTravelMinutes: 0,
      totalShoppingMinutes: 0,
      totalTripMinutes: 0,
      totalWeightKg: 0,
      isFeasible: false,
      feasibilityIssues: [
        'No feasible store combination can cover all items with current store filters and max stops limit.'
      ],
      explanation:
        'Could not find a feasible route covering all required items within candidate stores. Try increasing maximum stops or enabling excluded stores.',
      calculatedAt: new Date().toISOString(),
      isOptimalWithinScope: false
    };
  }

  // Reference floors for balanced calculation
  const minCost = Math.max(1, Math.min(...candidatePlans.map((p) => p.totalCost)));
  const minTime = Math.max(1, Math.min(...candidatePlans.map((p) => p.totalTripMinutes)));

  // Sorting based on Mode
  candidatePlans.sort((a, b) => {
    // Prioritize feasible plans first
    if (a.isFeasible !== b.isFeasible) {
      return a.isFeasible ? -1 : 1;
    }

    if (mode === 'money') {
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      if (a.totalTripMinutes !== b.totalTripMinutes) return a.totalTripMinutes - b.totalTripMinutes;
      return a.routeStops.length - b.routeStops.length;
    } else if (mode === 'time') {
      if (a.totalTripMinutes !== b.totalTripMinutes) return a.totalTripMinutes - b.totalTripMinutes;
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      return a.routeStops.length - b.routeStops.length;
    } else {
      // Balanced
      const scoreA = 0.5 * (a.totalCost / minCost) + 0.5 * (a.totalTripMinutes / minTime);
      const scoreB = 0.5 * (b.totalCost / minCost) + 0.5 * (b.totalTripMinutes / minTime);
      if (Math.abs(scoreA - scoreB) > 0.001) return scoreA - scoreB;
      if (a.routeStops.length !== b.routeStops.length) return a.routeStops.length - b.routeStops.length;
      return a.totalCost - b.totalCost;
    }
  });

  const selectedPlan = candidatePlans[0];

  // Plain language explanation contrasting with second best / single store alternative
  let explanation = '';
  const storeNames = selectedPlan.routeStops.map((s) => s.name.split('(')[0].trim()).join(' and ');

  if (selectedPlan.routeStops.length === 1) {
    explanation = `Single-stop visit to ${storeNames}: complete coverage with minimal travel overhead (${selectedPlan.totalTripMinutes} min total).`;
  } else if (candidatePlans.length > 1) {
    const alternative = candidatePlans.find(
      (p) => p.routeStops.length !== selectedPlan.routeStops.length && p.isFeasible
    );
    if (alternative) {
      const costDiff = alternative.totalCost - selectedPlan.totalCost;
      const timeDiff = selectedPlan.totalTripMinutes - alternative.totalTripMinutes;
      if (costDiff > 0 && timeDiff > 0) {
        explanation = `We recommend visiting ${selectedPlan.routeStops.length} stores (${storeNames}) saving $${costDiff.toFixed(2)} compared to a ${alternative.routeStops.length}-stop option, adding only ${timeDiff} min.`;
      } else if (timeDiff < 0 && costDiff < 0) {
        explanation = `Visiting ${selectedPlan.routeStops.length} stores (${storeNames}) saves ${Math.abs(timeDiff)} min travel time at a modest $${Math.abs(costDiff).toFixed(2)} price difference.`;
      } else {
        explanation = `Optimal ${mode} allocation across ${selectedPlan.routeStops.length} stores (${storeNames}) fulfilling all ingredients.`;
      }
    } else {
      explanation = `Recommended ${selectedPlan.routeStops.length}-store plan (${storeNames}) balancing product pricing and multimodal travel.`;
    }
  } else {
    explanation = `Recommended route visiting ${storeNames} satisfying all ingredient shortfalls.`;
  }

  return {
    mode,
    storeAllocations: selectedPlan.storeAllocations,
    unresolvedRequirements,
    routeStops: selectedPlan.routeStops,
    routeSegments: selectedPlan.routeSegments,
    totalGoodsCost: selectedPlan.totalGoodsCost,
    totalTripCost: selectedPlan.totalTripCost,
    totalCost: selectedPlan.totalCost,
    totalTravelMinutes: selectedPlan.totalTravelMinutes,
    totalShoppingMinutes: selectedPlan.totalShoppingMinutes,
    totalTripMinutes: selectedPlan.totalTripMinutes,
    totalWeightKg: selectedPlan.totalWeightKg,
    isFeasible: selectedPlan.isFeasible && unresolvedRequirements.length === 0,
    feasibilityIssues: [
      ...selectedPlan.feasibilityIssues,
      ...(unresolvedRequirements.length > 0
        ? [`${unresolvedRequirements.length} item(s) are unavailable in candidate stores.`]
        : [])
    ],
    explanation,
    calculatedAt: new Date().toISOString(),
    isOptimalWithinScope: true
  };
}
