import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageInput } from '../services/intentParser';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
import { optimizeShoppingPlan } from '../algorithms/storeOptimizer';
import { scaleRecipeIngredients, getRecipeById } from '../services/recipeService';
import { incorporatePurchasedItemsIntoPantry } from '../services/pantryService';
import { PantryItem, ShoppingIntent, TripContext } from '../types';
import { DEMO_ORIGIN_LOCATIONS } from '../data/stores';

describe('Shopsmarter Core Logic & Verification Suite', () => {
  const dummyOrigin = {
    lat: DEMO_ORIGIN_LOCATIONS[0].lat,
    lng: DEMO_ORIGIN_LOCATIONS[0].lng,
    label: DEMO_ORIGIN_LOCATIONS[0].label,
    source: 'demo' as const,
    capturedAt: new Date().toISOString()
  };

  const defaultTripContext: TripContext = {
    origin: dummyOrigin,
    destinationMode: 'return_to_origin',
    transportMode: 'walking',
    maxStops: 2,
    excludedStoreIds: []
  };

  // Test 1: Recipe scaling
  it('Increasing recipe servings updates ingredient quantities correctly', () => {
    const mapoTofu = getRecipeById('recipe_mapo_tofu')!;
    expect(mapoTofu).toBeDefined();

    // Default servings is 2, requiring 150g pork and 30g doubanjiang
    const servings4 = scaleRecipeIngredients(mapoTofu, 4);
    const pork = servings4.find((i) => i.ingredientId === 'ing_ground_pork')!;
    const doubanjiang = servings4.find((i) => i.ingredientId === 'ing_doubanjiang')!;

    expect(pork.quantity).toBe(300); // 150 * 2
    expect(doubanjiang.quantity).toBe(60); // 30 * 2
  });

  // Test 2: Duplicate ingredients are merged correctly
  it('Duplicate ingredients from multiple recipes are merged into combined requirements', () => {
    // Tomato egg (4 eggs) + Fried rice (3 eggs) = 7 eggs
    const intents: ShoppingIntent[] = [
      {
        id: 'int_1',
        type: 'recipe',
        recipeId: 'recipe_tomato_egg',
        recipeName: 'Tomato Egg',
        servings: 2,
        createdAt: ''
      },
      {
        id: 'int_2',
        type: 'recipe',
        recipeId: 'recipe_fried_rice',
        recipeName: 'Fried Rice',
        servings: 2,
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    const eggReq = shortfalls.find((r) => r.ingredientId === 'ing_eggs');

    expect(eggReq).toBeDefined();
    expect(eggReq?.totalRequired).toBe(7); // 4 + 3
    expect(eggReq?.sourceContributions.length).toBe(2);
  });

  // Test 3: Pantry inventory subtraction
  it('Pantry inventory is correctly subtracted from recipe needs (shortfall = max(0, need - pantry))', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_1',
        type: 'recipe',
        recipeId: 'recipe_tomato_egg',
        recipeName: 'Tomato Egg',
        servings: 2,
        createdAt: ''
      }
    ];

    // Tomato egg requires 4 eggs. Pantry has 3 eggs.
    const pantry: PantryItem[] = [
      {
        id: 'p_1',
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 3,
        unit: 'piece',
        category: 'Dairy',
        updatedAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, pantry);
    const eggReq = shortfalls.find((r) => r.ingredientId === 'ing_eggs');

    expect(eggReq).toBeDefined();
    expect(eggReq?.totalRequired).toBe(4);
    expect(eggReq?.pantryAvailable).toBe(3);
    expect(eggReq?.shortfall).toBe(1); // 4 - 3 = 1
  });

  // Test 4: Household products are not decomposed as recipes
  it('Household products are treated as direct purchase intents without decomposition', () => {
    const parse = parseNaturalLanguageInput('I need toilet paper and laundry detergent.');
    expect(parse.intents.length).toBe(2);
    expect(parse.intents[0].type).toBe('direct_item');
    expect(parse.intents[1].type).toBe('direct_item');

    const shortfalls = calculateIngredientShortfalls(parse.intents, []);
    expect(shortfalls.length).toBe(2);
    expect(shortfalls.some((s) => s.name === 'Toilet Paper')).toBe(true);
    expect(shortfalls.some((s) => s.name === 'Laundry Detergent')).toBe(true);
  });

  // Test 5: Removing a recipe does not remove unrelated requirements
  it('Removing a recipe preserves other independent intents and requirements', () => {
    let intents: ShoppingIntent[] = [
      {
        id: 'int_mapo',
        type: 'recipe',
        recipeId: 'recipe_mapo_tofu',
        recipeName: 'Mapo Tofu',
        servings: 2,
        createdAt: ''
      },
      {
        id: 'int_tp',
        type: 'direct_item',
        directItem: {
          name: 'Toilet Paper',
          quantity: 1,
          unit: 'pack',
          category: 'Paper products'
        },
        createdAt: ''
      }
    ];

    // Remove mapo tofu
    intents = intents.filter((i) => i.id !== 'int_mapo');
    const shortfalls = calculateIngredientShortfalls(intents, []);

    expect(shortfalls.length).toBe(1);
    expect(shortfalls[0].name).toBe('Toilet Paper');
    expect(shortfalls.some((s) => s.ingredientId === 'ing_doubanjiang')).toBe(false);
  });

  // Test 6: Unavailable products remain visible in unresolved list
  it('Unavailable items remain visible as unresolved requirements and are never silently dropped', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_rare',
        type: 'direct_item',
        directItem: {
          name: 'Rare Saffron Extracted Herb',
          quantity: 1,
          unit: 'jar',
          category: 'Cooking ingredients'
        },
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    const plan = optimizeShoppingPlan(shortfalls, defaultTripContext, 'balanced');

    expect(plan.unresolvedRequirements.length).toBe(1);
    expect(plan.isFeasible).toBe(false);
  });

  // Test 7: Excluding a store forces recalculation
  it('Excluding a store excludes its offers and recalculates allocation', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_tp',
        type: 'direct_item',
        directItem: {
          name: 'Toilet Paper',
          quantity: 1,
          unit: 'pack',
          category: 'Paper products'
        },
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);

    // Plan with Target included
    const plan1 = optimizeShoppingPlan(shortfalls, defaultTripContext, 'money');
    expect(plan1.routeStops.some((s) => s.id === 'store_target' || s.id === 'store_walmart')).toBe(true);

    // Now exclude both Target and Walmart
    const contextWithoutSuperstores: TripContext = {
      ...defaultTripContext,
      excludedStoreIds: ['store_target', 'store_walmart']
    };
    const plan2 = optimizeShoppingPlan(shortfalls, contextWithoutSuperstores, 'money');

    // Allocation should fallback to Food Lion (which stocks Toilet Paper 4-pack)
    expect(plan2.routeStops.some((s) => s.id === 'store_target' || s.id === 'store_walmart')).toBe(false);
    expect(plan2.routeStops.some((s) => s.id === 'store_food_lion')).toBe(true);
  });

  // Test 8: Purchase weight is informational
  it('Reports estimated weight without rejecting a heavy shopping plan', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_detergent',
        type: 'direct_item',
        directItem: {
          name: 'Laundry Detergent',
          quantity: 1,
          unit: 'bottle',
          category: 'Cleaning supplies'
        },
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    // Weight is calculated for complete product packages.
    const strictContext: TripContext = {
      ...defaultTripContext,
    };

    const plan = optimizeShoppingPlan(shortfalls, strictContext, 'balanced');
    expect(plan.totalWeightKg).toBeGreaterThan(2.0);
    expect(plan.isFeasible).toBe(true);
    expect(plan.feasibilityIssues).toEqual([]);
  });

  // Test 9: Purchased items persist into pantry after trip
  it('Purchased items are added to pantry with proper quantities after shopping trip', () => {
    const initialPantry: PantryItem[] = [
      {
        id: 'p_eggs',
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 3,
        unit: 'piece',
        category: 'Dairy',
        updatedAt: ''
      }
    ];

    const purchases = [
      {
        requirement: {
          ingredientId: 'ing_eggs',
          name: 'Eggs',
          category: 'Dairy' as const,
          totalRequired: 4,
          unit: 'piece',
          pantryAvailable: 3,
          shortfall: 1,
          sourceContributions: [],
          isDirectPurchase: false
        },
        option: {
          offer: {
            offerId: 'off_eggs',
            productId: 'prod_eggs_12',
            storeId: 'store_food_lion',
            packQuantity: 12,
            unit: 'piece',
            packPrice: 2.49,
            currency: 'USD',
            carryWeightKg: 0.72,
            availabilityStatus: 'in_stock' as const,
            source: 'Demo',
            updatedAt: ''
          },
          product: {} as any,
          packs: 1,
          buyQuantity: 12,
          surplus: 11,
          totalCost: 2.49,
          totalWeightKg: 0.72
        }
      }
    ];

    const updatedPantry = incorporatePurchasedItemsIntoPantry(initialPantry, purchases);
    const eggPantry = updatedPantry.find((p) => p.ingredientId === 'ing_eggs');

    expect(eggPantry).toBeDefined();
    expect(eggPantry?.quantity).toBe(15); // 3 initial + 12 purchased carton
  });

  // Test 10: Switching optimization priorities can change the optimal plan
  it('Switching optimization priorities between Save Money and Save Time produces distinct trade-offs', () => {
    // Cook Chicken curry + Spaghetti (multiple ingredients across supermarket and hypermarket)
    const intents: ShoppingIntent[] = [
      {
        id: 'int_curry',
        type: 'recipe',
        recipeId: 'recipe_chicken_curry',
        recipeName: 'Chicken Curry',
        servings: 2,
        createdAt: ''
      },
      {
        id: 'int_tp',
        type: 'direct_item',
        directItem: {
          name: 'Toilet Paper',
          quantity: 1,
          unit: 'pack',
          category: 'Paper products'
        },
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    const moneyPlan = optimizeShoppingPlan(shortfalls, defaultTripContext, 'money');
    const timePlan = optimizeShoppingPlan(shortfalls, defaultTripContext, 'time');

    expect(moneyPlan.isFeasible).toBe(true);
    expect(timePlan.isFeasible).toBe(true);
    // In Save Money, total cost is <= Save Time cost
    expect(moneyPlan.totalCost).toBeLessThanOrEqual(timePlan.totalCost);
    // In Save Time, total trip time is <= Save Money trip time
    expect(timePlan.totalTripMinutes).toBeLessThanOrEqual(moneyPlan.totalTripMinutes);
  });

  // Test 11: Route includes all selected stores and returns home when requested
  it('Route includes all stores with assigned products and returns to origin', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_mapo',
        type: 'recipe',
        recipeId: 'recipe_mapo_tofu',
        recipeName: 'Mapo Tofu',
        servings: 2,
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    const plan = optimizeShoppingPlan(shortfalls, defaultTripContext, 'balanced');

    // Every store in storeAllocations must appear in routeStops
    for (const alloc of plan.storeAllocations) {
      expect(plan.routeStops.some((s) => s.id === alloc.store.id)).toBe(true);
    }

    // Since destinationMode is 'return_to_origin', last route segment returns to origin
    expect(plan.routeSegments.length).toBe(plan.routeStops.length + 1);
    const lastSeg = plan.routeSegments[plan.routeSegments.length - 1];
    expect(lastSeg.toName).toBe(defaultTripContext.origin.label);
  });

  // Test 12: Plan totals are based on assigned product offers whole packages
  it('Plan totals equal the sum of whole-pack offer prices', () => {
    const intents: ShoppingIntent[] = [
      {
        id: 'int_1',
        type: 'recipe',
        recipeId: 'recipe_mapo_tofu',
        recipeName: 'Mapo Tofu',
        servings: 2,
        createdAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(intents, []);
    const plan = optimizeShoppingPlan(shortfalls, {...defaultTripContext, transportMode: 'driving'}, 'balanced');

    let sumOffers = 0;
    for (const alloc of plan.storeAllocations) {
      for (const item of alloc.items) {
        sumOffers += item.option.totalCost;
      }
    }

    expect(Math.round(sumOffers * 100) / 100).toBe(plan.totalGoodsCost);
    expect(plan.totalTripCost).toBe(0);
    expect(plan.totalCost).toBe(plan.totalGoodsCost);
  });

  // Test 13: Heuristic ingredient extraction (Option 1)
  it('Heuristic ingredient extraction dynamically extracts ingredients for uncatalogued cooking requests', () => {
    const parse = parseNaturalLanguageInput('I want to cook chicken with potatoes and onions for 2 people.');
    expect(parse.intents.length).toBe(1);
    const customRecipe = parse.intents[0];
    expect(customRecipe.type).toBe('recipe');
    expect(customRecipe.customIngredients).toBeDefined();
    expect(customRecipe.customIngredients?.length).toBeGreaterThanOrEqual(2);
    expect(customRecipe.customIngredients?.some((i) => i.ingredientId === 'ing_chicken_thighs')).toBe(true);
    expect(customRecipe.customIngredients?.some((i) => i.ingredientId === 'ing_potatoes')).toBe(true);
  });

  // Test 14: Custom recipe shortfalls and store allocation (Option 3)
  it('Custom recipe intents correctly calculate shortfalls, scale servings, and allocate to stores', () => {
    const customIntent: ShoppingIntent = {
      id: 'int_custom_ratatouille',
      type: 'recipe',
      recipeName: 'Ratatouille',
      servings: 4, // 4 servings
      customIngredients: [
        {
          ingredientId: 'ing_tomatoes',
          name: 'Tomatoes',
          quantity: 2, // 2 per 2 servings -> 4 for 4 servings
          unit: 'piece',
          category: 'Vegetables'
        },
        {
          ingredientId: 'ing_garlic',
          name: 'Garlic',
          quantity: 2, // 2 per 2 servings -> 4 for 4 servings
          unit: 'clove',
          category: 'Vegetables'
        }
      ],
      createdAt: ''
    };

    const pantry: PantryItem[] = [
      {
        id: 'p_garlic',
        ingredientId: 'ing_garlic',
        name: 'Garlic',
        quantity: 2,
        unit: 'clove',
        category: 'Vegetables',
        updatedAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls([customIntent], pantry);
    const tomatoReq = shortfalls.find((r) => r.ingredientId === 'ing_tomatoes');
    const garlicReq = shortfalls.find((r) => r.ingredientId === 'ing_garlic');

    expect(tomatoReq?.totalRequired).toBe(4); // 2 * (4/2) = 4
    expect(tomatoReq?.shortfall).toBe(4);
    expect(garlicReq?.totalRequired).toBe(4); // 2 * (4/2) = 4
    expect(garlicReq?.shortfall).toBe(2); // 4 - 2 pantry = 2

    const plan = optimizeShoppingPlan(shortfalls, defaultTripContext, 'balanced');
    expect(plan.isFeasible).toBe(true);
    expect(plan.storeAllocations.length).toBeGreaterThan(0);
  });

  // Test 15: Default launch scenario (Spaghetti Bolognese + Paper Towels) exhibits distinct trade-offs
  it('Default launch scenario exhibits distinct trade-offs between Save Time and Save Money', () => {
    const parse = parseNaturalLanguageInput('I want to cook spaghetti bolognese for two people and I need paper towels.');
    expect(parse.intents.length).toBe(2);

    const pantry: PantryItem[] = [
      {
        id: 'p_garlic',
        ingredientId: 'ing_garlic',
        name: 'Garlic',
        quantity: 2,
        unit: 'clove',
        category: 'Vegetables',
        updatedAt: ''
      }
    ];

    const shortfalls = calculateIngredientShortfalls(parse.intents, pantry);
    const drivingContext: TripContext = {
      ...defaultTripContext,
      transportMode: 'driving',
      maxStops: 2
    };

    const moneyPlan = optimizeShoppingPlan(shortfalls, drivingContext, 'money');
    const timePlan = optimizeShoppingPlan(shortfalls, drivingContext, 'time');

    expect(moneyPlan.isFeasible).toBe(true);
    expect(timePlan.isFeasible).toBe(true);
    expect(moneyPlan.totalCost).toBeLessThanOrEqual(timePlan.totalCost);
    expect(timePlan.totalTripMinutes).toBeLessThanOrEqual(moneyPlan.totalTripMinutes);
  });
});
