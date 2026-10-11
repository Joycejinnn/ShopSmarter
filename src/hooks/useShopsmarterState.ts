import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingIntent,
  PantryItem,
  TripContext,
  ShoppingPlan,
  OptimizationPriority,
  TransportationMode,
  LocationPoint,
  ShoppingSession,
  LLMConfig
} from '../types';
import { loadPantryFromStorage, savePantryToStorage, addOrUpdatePantryItem, removePantryItem as removePantryItemService, incorporatePurchasedItemsIntoPantry, resetPantryToDefault } from '../services/pantryService';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
import { optimizeShoppingPlan } from '../algorithms/storeOptimizer';
import { parseNaturalLanguageInput, createCustomRecipeIntent } from '../services/intentParser';
import { parseNaturalLanguageWithLLM, getLLMConfig, saveLLMConfig } from '../services/llmParser';
import { DEMO_ORIGIN_LOCATIONS } from '../data/stores';
import { DEMO_SCENARIOS } from '../data/demoScenarios';

const DEFAULT_ORIGIN: LocationPoint = {
  lat: DEMO_ORIGIN_LOCATIONS[1].lat, // Meadowmont
  lng: DEMO_ORIGIN_LOCATIONS[1].lng,
  label: DEMO_ORIGIN_LOCATIONS[1].label,
  source: 'demo',
  capturedAt: new Date().toISOString()
};

export function useShopsmarterState() {
  // 1. Intents
  const [intents, setIntents] = useState<ShoppingIntent[]>(() => {
    // Start with pre-parsed Scenario A (Weeknight Dinner: Spaghetti Bolognese & Paper Towels)
    const initial = parseNaturalLanguageInput('I want to cook spaghetti bolognese for two people and I need paper towels.');
    return initial.intents;
  });

  // 2. Pantry
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => loadPantryFromStorage());

  // 3. Trip Context
  const [tripContext, setTripContext] = useState<TripContext>({
    origin: DEFAULT_ORIGIN,
    destinationMode: 'return_to_origin',
    transportMode: 'driving',
    maxStops: 2,
    excludedStoreIds: []
  });

  // 4. Optimization Priority
  const [optimizationMode, setOptimizationMode] = useState<OptimizationPriority>('balanced');

  // 5. Shopping Session Mode (live in-store shopping)
  const [shoppingSession, setShoppingSession] = useState<ShoppingSession>({
    isActive: false,
    currentStopIndex: 0,
    purchasedItems: [],
    skippedItems: [],
    startedAt: ''
  });

  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const [llmConfig, setLlmConfigState] = useState<LLMConfig>(() => getLLMConfig());
  const [isParsingLLM, setIsParsingLLM] = useState<boolean>(false);

  const updateLLMConfig = useCallback((newConfig: Partial<LLMConfig>) => {
    const updated = saveLLMConfig(newConfig);
    setLlmConfigState(updated);
  }, []);

  // Derived: Ingredient Shortfalls
  const requirements = useMemo(() => {
    return calculateIngredientShortfalls(intents, pantryItems);
  }, [intents, pantryItems]);

  // Derived: Optimal Plan
  const plan = useMemo(() => {
    return optimizeShoppingPlan(requirements, tripContext, optimizationMode);
  }, [requirements, tripContext, optimizationMode]);

  // Actions: Intents
  const addFromNaturalLanguage = useCallback(async (input: string) => {
    setIsParsingLLM(true);
    try {
      const res = await parseNaturalLanguageWithLLM(input, llmConfig);
      if (res.intents.length > 0) {
        setIntents((prev) => [...prev, ...res.intents]);
        setLastNotification(res.explanation);
      } else {
        setLastNotification(res.explanation);
      }
      return res;
    } finally {
      setIsParsingLLM(false);
    }
  }, [llmConfig]);

  const removeIntent = useCallback((id: string) => {
    setIntents((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateServings = useCallback((intentId: string, newServings: number) => {
    setIntents((prev) =>
      prev.map((i) => (i.id === intentId ? { ...i, servings: Math.max(1, newServings) } : i))
    );
  }, []);

  const addCustomRecipe = useCallback((dishName: string, servings: number, ingredients: any[]) => {
    const customIntent = createCustomRecipeIntent(dishName, servings, ingredients);
    setIntents((prev) => [...prev, customIntent]);
    setLastNotification(`Added custom dish "${dishName}" (${servings} servings) with ${ingredients.length} ingredients.`);
  }, []);

  const clearAllIntents = useCallback(() => {
    setIntents([]);
  }, []);

  // Actions: Pantry
  const updatePantry = useCallback((item: Omit<PantryItem, 'id' | 'updatedAt'> & { id?: string }) => {
    setPantryItems((prev) => addOrUpdatePantryItem(prev, item));
  }, []);

  const deletePantryItem = useCallback((id: string) => {
    setPantryItems((prev) => removePantryItemService(prev, id));
  }, []);

  const resetPantry = useCallback(() => {
    setPantryItems(resetPantryToDefault());
  }, []);

  // Actions: Trip Context
  const setTransportMode = useCallback((mode: TransportationMode) => {
    setTripContext((prev) => ({ ...prev, transportMode: mode }));
  }, []);

  const setMaxStops = useCallback((stops: number) => {
    setTripContext((prev) => ({ ...prev, maxStops: Math.max(1, Math.min(5, stops)) }));
  }, []);

  const setOrigin = useCallback((origin: LocationPoint) => {
    setTripContext((prev) => ({ ...prev, origin }));
  }, []);

  const setDestinationMode = useCallback(
    (destMode: 'return_to_origin' | 'another_location' | 'finish_at_last_store', destLocation?: LocationPoint) => {
      setTripContext((prev) => ({
        ...prev,
        destinationMode: destMode,
        destinationLocation: destLocation
      }));
    },
    []
  );

  const toggleStoreExclusion = useCallback((storeId: string) => {
    setTripContext((prev) => {
      const isExcluded = prev.excludedStoreIds.includes(storeId);
      const updated = isExcluded
        ? prev.excludedStoreIds.filter((id) => id !== storeId)
        : [...prev.excludedStoreIds, storeId];
      return { ...prev, excludedStoreIds: updated };
    });
  }, []);

  // Load Scenario
  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setShoppingSession(prev => ({ ...prev, purchasedItems: [], skippedItems: [], isActive: false }));
    // Set settings
    const originLoc = DEMO_ORIGIN_LOCATIONS.find((loc) => loc.id === scenario.settings.originId) || DEMO_ORIGIN_LOCATIONS[0];

    setTripContext({
      origin: {
        lat: originLoc.lat,
        lng: originLoc.lng,
        label: originLoc.label,
        source: 'demo',
        capturedAt: new Date().toISOString()
      },
      destinationMode: scenario.settings.destinationMode,
      transportMode: scenario.settings.transportMode,
      maxStops: 2,
      excludedStoreIds: scenario.settings.excludedStoreIds || []
    });

    setOptimizationMode(scenario.settings.optimizationMode);

    // Parse and set intents
    const parsed = parseNaturalLanguageInput(scenario.inputPrompt);
    setIntents(parsed.intents);
    setLastNotification(`Loaded ${scenario.name}: ${scenario.description}`);
  }, []);

  // Shopping Mode Handlers
  const startShopping = useCallback(() => {
    setShoppingSession(prev => ({ ...prev, isActive: true, currentStopIndex: 0, startedAt: new Date().toISOString() }));
  }, []);

  const setItemPurchased = useCallback((item: (typeof plan.storeAllocations)[0]['items'][0], storeId: string, checked: boolean) => {
    setShoppingSession(prev => ({ ...prev, purchasedItems: [
      ...prev.purchasedItems.filter(p => !(p.requirement.ingredientId === item.requirement.ingredientId && p.storeId === storeId)),
      ...(checked ? [{requirement: item.requirement, option: item.option, storeId, purchasedAt: new Date().toISOString()}] : [])
    ] }));
  }, []);
  const markItemPurchased = useCallback((item: (typeof plan.storeAllocations)[0]['items'][0], storeId: string) => setItemPurchased(item, storeId, true), [setItemPurchased]);

  // Keep checks only for the same current purchase; changed quantities require a new check.
  useEffect(() => {
    setShoppingSession(prev => {
      const purchasedItems = prev.purchasedItems.filter(p => plan.storeAllocations.some(a => a.store.id === p.storeId && a.items.some(i => i.requirement.ingredientId === p.requirement.ingredientId && i.option.offer.offerId === p.option.offer.offerId && i.option.buyQuantity === p.option.buyQuantity)));
      return purchasedItems.length === prev.purchasedItems.length ? prev : {...prev, purchasedItems};
    });
  }, [plan]);

  const markItemOutOfStock = useCallback(
    (item: (typeof plan.storeAllocations)[0]['items'][0], storeId: string) => {
      setShoppingSession((prev) => ({
        ...prev,
        skippedItems: [
          ...prev.skippedItems,
          {
            requirement: item.requirement,
            storeId,
            reason: 'out_of_stock'
          }
        ]
      }));
      setLastNotification(`${item.requirement.name} marked out of stock. Remaining trip updated.`);
    },
    []
  );

  const completeTripAndSyncPantry = useCallback(() => {
    if (shoppingSession.purchasedItems.length > 0) {
      setPantryItems((current) =>
        incorporatePurchasedItemsIntoPantry(current, shoppingSession.purchasedItems)
      );
    }
    setShoppingSession({
      isActive: false,
      currentStopIndex: 0,
      purchasedItems: [],
      skippedItems: [],
      startedAt: ''
    });
    setLastNotification('Shopping trip finished! Purchased quantities have been added to your pantry.');
  }, [shoppingSession.purchasedItems]);

  const cancelShopping = useCallback(() => {
    setShoppingSession(prev => ({ ...prev, isActive: false }));
  }, []);

  return {
    intents,
    pantryItems,
    tripContext,
    optimizationMode,
    requirements,
    plan,
    shoppingSession,
    lastNotification,
    setLastNotification,
    addFromNaturalLanguage,
    addCustomRecipe,
    removeIntent,
    updateServings,
    clearAllIntents,
    updatePantry,
    deletePantryItem,
    resetPantry,
    setTransportMode,
    setMaxStops,
    setOrigin,
    setDestinationMode,
    toggleStoreExclusion,
    setOptimizationMode,
    loadScenario,
    startShopping,
    markItemPurchased,
    setItemPurchased,
    markItemOutOfStock,
    completeTripAndSyncPantry,
    cancelShopping,
    llmConfig,
    isParsingLLM,
    updateLLMConfig
  };
}
