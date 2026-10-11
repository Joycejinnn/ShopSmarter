import { describe, expect, it } from 'vitest';
import { getRouteSegment, findNearestTransitStop, calculateHaversineDistanceMeters } from '../data/travelGraph';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
import { optimizeShoppingPlan } from '../algorithms/storeOptimizer';
import { createCustomRecipeIntent } from '../services/intentParser';
import { DEMO_STORES } from '../data/stores';
import { TripContext } from '../types';

describe('Transit versus walking', () => {
  it('recommends direct walking when boarding requires more walking than the whole trip', () => {
    const from: [number, number] = [35.934, -79.029];
    const to: [number, number] = [35.935, -79.028];
    const stop = findNearestTransitStop(from);
    expect(calculateHaversineDistanceMeters({ lat: from[0], lng: from[1] }, stop))
      .toBeGreaterThan(calculateHaversineDistanceMeters({ lat: from[0], lng: from[1] }, { lat: to[0], lng: to[1] }));
    const segment = getRouteSegment('A', from, 'B', to, 'transit');
    const walking = getRouteSegment('A', from, 'B', to, 'walking');
    expect(segment.transportMode).toBe('walking');
    expect(segment.durationMinutes).toBe(walking.durationMinutes);
    expect(segment.walkingRecommendation).toBeTruthy();
    expect(segment.transitFare).toBeUndefined();
    expect(segment.boardingStop).toBeUndefined();
    expect(segment.transferStop).toBeUndefined();
  });
  it('never creates a bus ride for locations using the same stop', () => {
    const segment = getRouteSegment('A', [35.9528, -78.962], 'B', [35.9529, -78.962], 'transit');
    expect(segment.transportMode).toBe('walking');
    expect(segment.transitRouteName).toBeUndefined();
  });
  it('retains beneficial transfers and includes access, egress and waiting time', () => {
    const from: [number, number] = [35.9105, -79.0755];
    const to: [number, number] = [35.9525, -78.9616];
    const segment = getRouteSegment('Carrboro', from, 'Target', to, 'transit');
    expect(segment.transportMode).toBe('transit');
    expect(segment.transferStop).toContain('Downtown Hub');
    expect(segment.lastMileWalkMinutes).toBeGreaterThan(0);
    expect(segment.durationMinutes).toBeGreaterThan((segment.firstMileWalkMinutes ?? 0) + (segment.lastMileWalkMinutes ?? 0) + 14);
    expect(segment.durationMinutes).toBeLessThan(getRouteSegment('A', from, 'B', to, 'walking').durationMinutes);
    expect(segment.geometry).toContainEqual([35.9135, -79.0552]);
  });
  it('selects no bus rides or fares for a nearby shopping trip and keeps totals coherent', () => {
    const target = DEMO_STORES.find(store => store.id === 'store_harris_teeter')!;
    const context: TripContext = {
      origin: { lat: target.lat + 0.0001, lng: target.lng, label: 'Near store', source: 'manual', capturedAt: '' },
      destinationMode: 'return_to_origin', transportMode: 'transit', maxStops: 1,
      excludedStoreIds: DEMO_STORES.filter(store => store.id !== target.id).map(store => store.id)
    };
    const requirements = calculateIngredientShortfalls([createCustomRecipeIntent('Salad', 2, [
      { ingredientId: 'ing_tomatoes', name: 'Tomatoes', quantity: 2, unit: 'piece', category: 'Vegetables' }
    ])], []);
    const plan = optimizeShoppingPlan(requirements, context, 'time');
    expect(plan.routeSegments.length).toBe(2);
    expect(plan.routeSegments.every(segment => segment.transportMode === 'walking')).toBe(true);
    expect(plan.totalTripCost).toBe(0);
    expect(plan.totalTravelMinutes).toBe(plan.routeSegments.reduce((sum, segment) => sum + segment.durationMinutes, 0));
    expect(plan.totalCost).toBe(plan.totalGoodsCost);
  });
});
