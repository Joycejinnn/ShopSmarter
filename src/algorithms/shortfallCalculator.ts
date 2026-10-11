import {
  ShoppingIntent,
  PantryItem,
  IngredientRequirement,
  PurchaseOption,
  ProductOffer,
  Product
} from '../types';
import { getRecipeById, scaleRecipeIngredients } from '../services/recipeService';
import { normalizeIngredientName, areUnitsCompatible, convertQuantity } from '../services/ingredientNormalizer';
import { PRODUCTS } from '../data/products';
import { PRODUCT_OFFERS } from '../data/productOffers';

// Step 1: Calculate Net Shortfalls from Shopping Intents and Pantry Inventory
export function calculateIngredientShortfalls(
  intents: ShoppingIntent[],
  pantryItems: PantryItem[]
): IngredientRequirement[] {
  const mergedMap = new Map<string, IngredientRequirement>();

  // 1. Process Recipe Intents (Both Predefined & Custom)
  for (const intent of intents) {
    if (intent.type === 'recipe') {
      let scaledIngredients: { ingredientId: string; name: string; quantity: number; unit: string; category: any }[] = [];
      let displayName = intent.recipeName || 'Custom Dish';
      const servings = intent.servings || 2;

      if (intent.customIngredients && intent.customIngredients.length > 0) {
        const scaleRatio = servings / 2;
        scaledIngredients = intent.customIngredients.map((ing) => ({
          ...ing,
          quantity: Math.round(ing.quantity * scaleRatio * 100) / 100
        }));
      } else if (intent.recipeId) {
        const recipe = getRecipeById(intent.recipeId);
        if (recipe) {
          displayName = recipe.name;
          scaledIngredients = scaleRecipeIngredients(recipe, servings);
        }
      }

      for (const ing of scaledIngredients) {
        const normId = ing.ingredientId || normalizeIngredientName(ing.name);
        const existing = mergedMap.get(normId);

        if (existing) {
          // Combine quantities if units are compatible
          const convertedQty = convertQuantity(ing.quantity, ing.unit, existing.unit);
          existing.totalRequired += convertedQty;
          existing.sourceContributions.push({
            sourceId: intent.id,
            sourceName: `${displayName} (${servings} servings)`,
            quantity: convertedQty
          });
        } else {
          mergedMap.set(normId, {
            ingredientId: normId,
            name: ing.name,
            category: ing.category,
            totalRequired: ing.quantity,
            unit: ing.unit,
            pantryAvailable: 0,
            shortfall: ing.quantity,
            sourceContributions: [
              {
                sourceId: intent.id,
                sourceName: `${displayName} (${servings} servings)`,
                quantity: ing.quantity
              }
            ],
            isDirectPurchase: false
          });
        }
      }
    }
  }

  // 2. Process Direct Purchase Items (Do not merge or overwrite as recipe-deductible)
  for (const intent of intents) {
    if (intent.type === 'direct_item' && intent.directItem) {
      const direct = intent.directItem;
      const normId = normalizeIngredientName(direct.name);

      // Check if this direct item should be its own requirement
      const reqId = `direct_${normId}_${intent.id}`;
      mergedMap.set(reqId, {
        ingredientId: normId,
        name: direct.name,
        category: direct.category || 'Household essentials',
        totalRequired: direct.quantity,
        unit: direct.unit,
        pantryAvailable: 0, // Direct purchase: pantry is NOT deducted
        shortfall: direct.quantity,
        sourceContributions: [
          {
            sourceId: intent.id,
            sourceName: `Direct purchase request`,
            quantity: direct.quantity
          }
        ],
        isDirectPurchase: true
      });
    }
  }

  // 3. Deduct Pantry Stock for Recipe Ingredients
  const results: IngredientRequirement[] = [];

  for (const [key, req] of mergedMap.entries()) {
    if (req.isDirectPurchase) {
      // Direct purchase preserves shortfall equal to totalRequired
      results.push(req);
      continue;
    }

    // Find pantry match
    const pantryMatch = pantryItems.find(
      (p) =>
        p.ingredientId === req.ingredientId ||
        normalizeIngredientName(p.name) === req.ingredientId ||
        p.name.toLowerCase() === req.name.toLowerCase()
    );

    let pantryStock = 0;
    if (pantryMatch) {
      if (areUnitsCompatible(pantryMatch.unit, req.unit)) {
        pantryStock = convertQuantity(pantryMatch.quantity, pantryMatch.unit, req.unit);
      } else {
        pantryStock = pantryMatch.quantity;
      }
    }

    const shortfall = Math.max(0, req.totalRequired - pantryStock);

    results.push({
      ...req,
      pantryAvailable: pantryStock,
      shortfall: Math.round(shortfall * 100) / 100
    });
  }

  return results;
}

// Step 2: Match Offers & Calculate Whole-Package Options for each shortfall
export function getAvailablePurchaseOptions(
  requirement: IngredientRequirement,
  storeFilterIds?: string[]
): PurchaseOption[] {
  if (requirement.shortfall <= 0) return [];

  // 1. Find matching products
  const matchingProducts = PRODUCTS.filter((p) =>
    p.matchedIngredientIds.includes(requirement.ingredientId) ||
    p.name.toLowerCase().includes(requirement.name.toLowerCase()) ||
    requirement.name.toLowerCase().includes(p.name.toLowerCase())
  );

  const matchedProductIds = new Set(matchingProducts.map((p) => p.id));

  // 2. Find store offers for these products
  const candidateOffers = PRODUCT_OFFERS.filter(
    (off) =>
      matchedProductIds.has(off.productId) &&
      off.availabilityStatus !== 'out_of_stock' &&
      (!storeFilterIds || storeFilterIds.includes(off.storeId))
  );

  const options: PurchaseOption[] = [];

  for (const offer of candidateOffers) {
    const product = matchingProducts.find((p) => p.id === offer.productId);
    if (!product) continue;

    // Convert shortfall to offer units if necessary
    const neededInOfferUnits = convertQuantity(requirement.shortfall, requirement.unit, offer.unit);

    // Whole package conversion: ceil(needed / packQuantity)
    const packs = Math.max(1, Math.ceil(neededInOfferUnits / offer.packQuantity));
    const buyQuantity = packs * offer.packQuantity;
    const surplus = Math.max(0, buyQuantity - neededInOfferUnits);
    const totalCost = Math.round(packs * offer.packPrice * 100) / 100;
    const totalWeightKg = Math.round(packs * offer.carryWeightKg * 100) / 100;

    options.push({
      offer,
      product,
      packs,
      buyQuantity,
      surplus,
      totalCost,
      totalWeightKg
    });
  }

  return options;
}
