import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRealRoadGeometry, generateCurvedWaypoints, getRouteSegment, resolveTransitRouteDetails } from '../data/travelGraph';
import { createCustomRecipeIntent, parseNaturalLanguageInput } from '../services/intentParser';
import { parseNaturalLanguageWithLLM } from '../services/llmParser';
import { getIntentIngredients } from '../services/recipeService';
import { mergeShoppingIntents } from '../services/mergeShoppingIntents';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
import { optimizeShoppingPlan } from '../algorithms/storeOptimizer';
import { DEMO_STORES } from '../data/stores';
import { RecipeIngredient, TripContext } from '../types';

const context: TripContext = {
  origin: { lat: 35.9105, lng: -79.0755, label: 'Carrboro', source: 'manual', capturedAt: '' },
  destinationMode: 'return_to_origin', transportMode: 'transit', maxStops: 2, excludedStoreIds: []
};
const tomato: RecipeIngredient = { ingredientId: 'ing_tomatoes', name: 'Tomatoes', quantity: 2, unit: 'piece', category: 'Vegetables' };
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('Merged recipe and planner behavior', () => {
  it('edits custom dishes, merges repeats, scales the edited recipe and restores its baseline', () => {
    const custom = createCustomRecipeIntent('My soup', 4, [tomato]);
    expect(getIntentIngredients(custom)[0].quantity).toBe(4);
    custom.ingredientOverrides = { servings: 4, ingredients: [{ ...tomato, quantity: 6 }] };
    const merged = mergeShoppingIntents([custom], [createCustomRecipeIntent(' MY SOUP ', 2, [tomato])]);
    expect(merged).toHaveLength(1);
    expect(getIntentIngredients(merged[0])[0].quantity).toBe(9);
    expect(calculateIngredientShortfalls(merged, [
      { ...tomato, id: 'pantry', quantity: 2, updatedAt: '' }
    ])[0].shortfall).toBe(7);
    expect(getIntentIngredients({ ...merged[0], ingredientOverrides: undefined })[0].quantity).toBe(6);
  });
  it('merges a manually named catalog dish with quick-add while preserving edits', () => {
    const known = parseNaturalLanguageInput('mapo tofu for 2').intents[0];
    const manual = createCustomRecipeIntent('Mapo Tofu', 3, [tomato]);
    const merged = mergeShoppingIntents([manual], [known]);
    expect(merged).toHaveLength(1);
    expect(merged[0].servings).toBe(5);
    expect(getIntentIngredients(merged[0])[0].ingredientId).toBe('ing_tomatoes');
  });
  it('supports async local parsing without a network call and still merges known recipes', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const first = await parseNaturalLanguageWithLLM('mapo tofu for 2', { enabled: false });
    const second = await parseNaturalLanguageWithLLM('mapo tofu for 3', { enabled: false });
    const merged = mergeShoppingIntents(first.intents, second.intents);
    expect(merged.filter(item => item.type === 'recipe')).toHaveLength(1);
    expect(merged[0].servings).toBe(5);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('falls back to local parsing after an LLM network failure', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const parsed = await parseNaturalLanguageWithLLM('mapo tofu for 2', { enabled: true, provider: 'openai', apiKey: 'test-only' });
    expect(parsed.intents[0].recipeId).toBe('recipe_mapo_tofu');
  });
  it("retains all six stores including Trader Joe's", () => {
    expect(DEMO_STORES).toHaveLength(6);
    expect(new Set(DEMO_STORES.map(store => store.id)).size).toBe(6);
    expect(DEMO_STORES.some(store => store.id === 'store_trader_joes')).toBe(true);
  });
  it.each(['walking', 'cycling', 'driving', 'transit'] as const)('preserves optimizer invariants for %s', mode => {
    const requirements = calculateIngredientShortfalls(parseNaturalLanguageInput('mapo tofu for 2').intents, []);
    const plan = optimizeShoppingPlan(requirements, { ...context, transportMode: mode }, 'money');
    expect(plan.routeStops.length).toBeGreaterThan(0);
    expect(plan.totalCost).toBe(plan.totalGoodsCost);
    expect(plan.totalGoodsCost).toBeCloseTo(plan.storeAllocations.reduce((sum, allocation) => sum + allocation.subtotalCost, 0), 2);
    expect(plan.totalTravelMinutes).toBe(plan.routeSegments.reduce((sum, segment) => sum + segment.durationMinutes, 0));
    expect(plan.routeSegments[plan.routeSegments.length - 1]?.toCoords).toEqual([context.origin.lat, context.origin.lng]);
    if (mode === 'transit') {
      expect(plan.totalTripCost).toBeGreaterThan(0);
      expect(plan.totalTripCost).toBeCloseTo(plan.routeSegments.reduce((sum, segment) => sum + (segment.transitFare ?? 0), 0));
      const budgeted = optimizeShoppingPlan(requirements, { ...context, maxBudget: plan.totalGoodsCost }, 'money');
      expect(budgeted.feasibilityIssues.some(issue => issue.includes('budget'))).toBe(false);
    }
  });
});

describe('Transit connection failures', () => {
  it('does not fabricate Route 400 or a fare for disconnected stops', () => {
    const result = resolveTransitRouteDetails([35.9592, -79.0435], [35.9030, -78.9415]);
    expect(result.routeName).toBeUndefined();
    expect(result.fare).toBeUndefined();
  });
  it('marks an out-of-coverage trip infeasible without phantom fares', () => {
    const segment = getRouteSegment('Outside coverage', [40, -74], 'Target', [35.9525, -78.9616], 'transit');
    expect(segment.transitUnavailable).toBe(true);
    expect(segment.transitFare).toBeUndefined();
    const requirements = calculateIngredientShortfalls([createCustomRecipeIntent('Tomato salad', 2, [tomato])], []);
    const plan = optimizeShoppingPlan(requirements, { ...context, origin: { ...context.origin, lat: 40, lng: -74 } }, 'money');
    expect(plan.isFeasible).toBe(false);
    expect(plan.feasibilityIssues.join(' ')).toContain('No transit connection');
  });
  it('does not charge for travel within the same stop area', () => {
    const result = resolveTransitRouteDetails([35.9528, -78.9620], [35.9529, -78.9620]);
    expect(result.routeName).toBe('Walk');
    expect(result.fare).toBe(0);
  });
});

describe('OSRM transport, caching and failure handling', () => {
  it.each([['walking', 'routed-foot'], ['cycling', 'routed-bike'], ['driving', 'routed-car']] as const)('uses the correct %s dataset and reverses coordinates', async (mode, server) => {
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'Ok', routes: [{ geometry: { coordinates: [[-79.01, 35.91], [-79.02, 35.92]] } }] }) });
    vi.stubGlobal('fetch', mock);
    const result = await fetchRealRoadGeometry([35.91, -79.01], [35.92, -79.02], mode);
    expect(mock.mock.calls[0][0]).toContain(server + '/route/v1/driving/-79.01,35.91;-79.02,35.92');
    expect(result).toEqual([[35.91, -79.01], [35.92, -79.02]]);
    await fetchRealRoadGeometry([35.91, -79.01], [35.92, -79.02], mode);
    expect(mock).toHaveBeenCalledTimes(1);
  });
  it('does not cache an offline fallback, permitting a later retry', async () => {
    const mock = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', mock);
    const from: [number, number] = [35.93, -79.03]; const to: [number, number] = [35.94, -79.04];
    expect(await fetchRealRoadGeometry(from, to, 'driving')).toEqual(generateCurvedWaypoints(from, to));
    await fetchRealRoadGeometry(from, to, 'driving');
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('rejects malformed coordinates and never requests a driving route for transit', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'Ok', routes: [{ geometry: { coordinates: [[null, 35], [200, 95]] } }] }) });
    vi.stubGlobal('fetch', mock);
    const from: [number, number] = [35.95, -79.05]; const to: [number, number] = [35.96, -79.06];
    expect(await fetchRealRoadGeometry(from, to, 'walking')).toEqual(generateCurvedWaypoints(from, to));
    mock.mockClear();
    await fetchRealRoadGeometry(from, to, 'transit');
    expect(mock).not.toHaveBeenCalled();
  });
  it('times out stalled requests and clears the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))))));
    const pending = fetchRealRoadGeometry([35.97, -79.07], [35.98, -79.08], 'driving');
    await vi.advanceTimersByTimeAsync(4000);
    expect((await pending).length).toBeGreaterThan(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
