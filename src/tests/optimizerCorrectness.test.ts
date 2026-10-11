import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IngredientRequirement, ProductOffer, TripContext } from '../types';

const fixture = vi.hoisted(() => ({ offers: [] as ProductOffer[], disconnected: false, cMinutes: 94 }));
vi.mock('../data/stores', () => ({ DEMO_STORES: ['a', 'b', 'c'].map((id, i) => ({
  id, name: id, lat: i + 1, lng: 0, category: 'supermarket', address: '', city: '', openingHours: '', demoNote: '', color: ''
})) }));
vi.mock('../data/products', () => ({ PRODUCTS: [{ id: 'soap', name: 'Dish Soap', category: 'Cleaning supplies', brand: '',
  packageQuantity: 1, unit: 'bottle', estimatedWeightKg: 1, matchedIngredientIds: ['ing_dish_soap'] }] }));
vi.mock('../data/productOffers', () => ({ get PRODUCT_OFFERS() { return fixture.offers; } }));
vi.mock('../data/travelGraph', () => ({ getRouteSegment: (fromName: string, fromCoords: [number, number], toName: string, toCoords: [number, number], transportMode: string) => {
  const store = fromName === 'home' ? toName : fromName;
  return { fromName, toName, fromCoords, toCoords, transportMode, distanceMeters: 100,
    durationMinutes: store === 'a' ? 24 : store === 'b' ? 9 : fixture.cMinutes,
    transitUnavailable: fixture.disconnected && store === 'c', geometry: [fromCoords, toCoords] };
} }));
import { optimizeShoppingPlan } from '../algorithms/storeOptimizer';
import { calculateIngredientShortfalls, getAvailablePurchaseOptions } from '../algorithms/shortfallCalculator';

const context: TripContext = { origin: {lat: 0, lng: 0, label: 'home', source: 'manual', capturedAt: ''},
  destinationMode: 'return_to_origin', transportMode: 'driving', maxStops: 1, excludedStoreIds: [] };
const requirement = (quantity: number): IngredientRequirement => ({ ingredientId: 'ing_dish_soap', name: 'Dish Soap',
 category: 'Cleaning supplies', totalRequired: quantity, unit: 'bottle', pantryAvailable: 0, shortfall: quantity,
 sourceContributions: [{sourceId: `source-${quantity}`, sourceName: 'manual', quantity}], isDirectPurchase: true });
const offer = (storeId: string, packPrice: number, availablePackCount = 100): ProductOffer => ({ offerId: storeId,
 productId: 'soap', storeId, packQuantity: 1, unit: 'bottle', packPrice, currency: 'USD', carryWeightKg: 1,
 availabilityStatus: 'in_stock', availablePackCount, source: 'test', updatedAt: '' });
beforeEach(() => { fixture.offers = [offer('a', 20), offer('b', 30)]; fixture.disconnected = false; fixture.cMinutes = 94; });

describe('Optimizer correctness', () => {
  it('does not plan store visits without an origin', () => {
    const plan = optimizeShoppingPlan([requirement(1)], {...context, origin: null}, 'balanced');
    expect(plan.routeSegments).toEqual([]);
    expect(plan.storeAllocations).toEqual([]);
    expect(plan.isFeasible).toBe(false);
    expect(plan.explanation).toContain('Waiting for a starting location');
  });
  it.each(['money', 'time', 'balanced'] as const)('%s merges repeated purchases before package calculation regardless of order', mode => {
    const forward = optimizeShoppingPlan([requirement(1), requirement(3)], context, mode);
    const reverse = optimizeShoppingPlan([requirement(3), requirement(1)], context, mode);
    expect(forward.totalGoodsCost).toBe(reverse.totalGoodsCost);
    for (const plan of [forward, reverse]) {
      const items = plan.storeAllocations.flatMap(a => a.items);
      expect(items).toHaveLength(1);
      expect(items[0].option.packs).toBe(4);
      expect(items[0].requirement.sourceContributions).toHaveLength(2);
    }
  });
  it('deducts pantry only from recipe needs before combining with direct purchases', () => {
    const requirements = calculateIngredientShortfalls([
      {id: 'recipe', type: 'recipe', recipeName: 'Custom', servings: 2, customIngredients: [{ingredientId: 'ing_dish_soap', name: 'Dish Soap', quantity: 3, unit: 'bottle', category: 'Cleaning supplies'}], createdAt: ''},
      {id: 'direct', type: 'direct_item', directItem: {name: 'Dish Soap', quantity: 2, unit: 'bottle'}, createdAt: ''}
    ], [{id: 'pantry', ingredientId: 'ing_dish_soap', name: 'Dish Soap', quantity: 2, unit: 'bottle', category: 'Cleaning supplies', updatedAt: ''}]);
    const plan = optimizeShoppingPlan(requirements, context, 'money');
    expect(plan.storeAllocations[0].items[0].option.packs).toBe(3);
    expect(requirements).toHaveLength(2);
  });
  it('uses sufficient stock alternatives and accepts exact stock limits', () => {
    fixture.offers = [offer('a', 1, 3), offer('b', 2, 4)];
    const plan = optimizeShoppingPlan([requirement(1), requirement(3)], context, 'money');
    expect(plan.routeStops.map(s => s.id)).toEqual(['b']);
    expect(plan.totalGoodsCost).toBe(8);
    expect(plan.isFeasible).toBe(true);
  });
  it('marks a shortage instead of buying beyond stock, including zero stock', () => {
    fixture.offers = [offer('a', 1, 0), offer('b', 2, 3)];
    expect(getAvailablePurchaseOptions(requirement(4))).toEqual([]);
    const plan = optimizeShoppingPlan([requirement(4)], context, 'money');
    expect(plan.isFeasible).toBe(false);
    expect(plan.unresolvedRequirements[0].shortfall).toBe(4);
    expect(plan.storeAllocations).toEqual([]);
  });
  it('retains offers with unknown stock', () => {
    fixture.offers[0].availablePackCount = undefined;
    expect(getAvailablePurchaseOptions(requirement(101)).map(o => o.offer.storeId)).toEqual(['a']);
  });
  it('does not let an unreachable cheap store distort balanced ranking', () => {
    const baseline = optimizeShoppingPlan([requirement(1)], context, 'balanced');
    fixture.offers.push(offer('c', 1)); fixture.disconnected = true;
    const actual = optimizeShoppingPlan([requirement(1)], context, 'balanced');
    expect(baseline.routeStops[0].id).toBe('b');
    expect(actual.routeStops[0].id).toBe('b');
    expect(actual.isFeasible).toBe(true);
  });
  it('does not let an over-budget fast store distort balanced ranking', () => {
    // A=$20/60min and B=$40/30min tie; the lower-price A wins.
    // An over-budget C=$100/14min must not tip the ranking to B.
    fixture.offers = [offer('a', 20), offer('b', 40), offer('c', 100)];
    fixture.cMinutes = 1;
    const budgeted = {...context, maxBudget: 40};
    const baseline = optimizeShoppingPlan([requirement(1)], {...budgeted, excludedStoreIds: ['c']}, 'balanced');
    const actual = optimizeShoppingPlan([requirement(1)], budgeted, 'balanced');
    expect(baseline.routeStops[0].id).toBe('a');
    expect(actual.routeStops[0].id).toBe(baseline.routeStops[0].id);
  });
  it('returns a flagged plan when every candidate is over budget', () => {
    const plan = optimizeShoppingPlan([requirement(1)], {...context, maxBudget: 1}, 'balanced');
    expect(plan.isFeasible).toBe(false);
    expect(plan.feasibilityIssues.join(' ')).toContain('budget');
    expect(Number.isFinite(plan.totalGoodsCost)).toBe(true);
  });
});
