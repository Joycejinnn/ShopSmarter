import { ShoppingIntent, DirectItemIntent, ProductCategory, RecipeIngredient } from '../types';
import { PREDEFINED_RECIPES } from '../data/recipes';
import { normalizeIngredientName } from './ingredientNormalizer';

export interface ParseResult {
  intents: ShoppingIntent[];
  unrecognizedTokens: string[];
  unrecognizedDish?: string;
  explanation: string;
}

// Known direct household and grocery purchase keywords
const KNOWN_DIRECT_PURCHASES: {
  keywords: string[];
  name: string;
  defaultQty: number;
  unit: string;
  category: ProductCategory;
}[] = [
  {
    keywords: ['toilet paper', 'bath tissue', 'tp', '卫生纸', '卷纸'],
    name: 'Toilet Paper',
    defaultQty: 1,
    unit: 'pack',
    category: 'Paper products'
  },
  {
    keywords: ['paper towels', 'kitchen towel', 'paper towel', '厨房纸'],
    name: 'Paper Towels',
    defaultQty: 1,
    unit: 'pack',
    category: 'Paper products'
  },
  {
    keywords: ['facial tissues', 'tissues', 'kleenex', '抽纸', '纸巾'],
    name: 'Facial Tissues',
    defaultQty: 1,
    unit: 'box',
    category: 'Paper products'
  },
  {
    keywords: ['laundry detergent', 'detergent', 'tide', '洗衣液'],
    name: 'Laundry Detergent',
    defaultQty: 1,
    unit: 'bottle',
    category: 'Cleaning supplies'
  },
  {
    keywords: ['dish soap', 'dawn', '洗洁精'],
    name: 'Dish Soap',
    defaultQty: 1,
    unit: 'bottle',
    category: 'Cleaning supplies'
  },
  {
    keywords: ['disinfecting wipes', 'cleaning wipes', 'clorox', '消毒湿巾'],
    name: 'Disinfecting Wipes',
    defaultQty: 1,
    unit: 'canister',
    category: 'Cleaning supplies'
  },
  {
    keywords: ['trash bags', 'garbage bags', '垃圾袋'],
    name: 'Trash Bags',
    defaultQty: 1,
    unit: 'box',
    category: 'Cleaning supplies'
  },
  {
    keywords: ['toothpaste', 'colgate', '牙膏'],
    name: 'Toothpaste',
    defaultQty: 1,
    unit: 'tube',
    category: 'Toiletries'
  },
  {
    keywords: ['body wash', 'shower gel', '沐浴露'],
    name: 'Body Wash',
    defaultQty: 1,
    unit: 'bottle',
    category: 'Toiletries'
  },
  {
    keywords: ['shampoo', '洗发水'],
    name: 'Shampoo',
    defaultQty: 1,
    unit: 'bottle',
    category: 'Toiletries'
  },
  {
    keywords: ['aluminum foil', 'tin foil', '锡纸', '铝箔纸'],
    name: 'Aluminum Foil',
    defaultQty: 1,
    unit: 'roll',
    category: 'Household essentials'
  },
  {
    keywords: ['ziploc', 'storage bags', '保鲜袋', '密封袋'],
    name: 'Ziploc Storage Bags',
    defaultQty: 1,
    unit: 'box',
    category: 'Household essentials'
  },
  {
    keywords: ['batteries', 'aa batteries', '电池'],
    name: 'AA Batteries',
    defaultQty: 1,
    unit: 'pack',
    category: 'Household essentials'
  },
  {
    keywords: ['milk', 'whole milk', '牛奶', '鲜奶'],
    name: 'Whole Milk',
    defaultQty: 1,
    unit: 'gallon',
    category: 'Dairy'
  },
  {
    keywords: ['eggs', 'egg', 'carton of eggs', '鸡蛋'],
    name: 'Eggs (Direct Purchase)',
    defaultQty: 12,
    unit: 'piece',
    category: 'Dairy'
  },
  {
    keywords: ['jasmine rice', 'rice', '大米', '白米'],
    name: 'Jasmine Rice',
    defaultQty: 1,
    unit: 'bag',
    category: 'Rice and grains'
  },
  {
    keywords: ['sparkling water', 'lacroix', '气泡水'],
    name: 'Sparkling Mineral Water',
    defaultQty: 1,
    unit: 'pack',
    category: 'Beverages'
  },
  {
    keywords: ['orange juice', 'oj', '橙汁'],
    name: 'Orange Juice',
    defaultQty: 1,
    unit: 'bottle',
    category: 'Beverages'
  },
  {
    keywords: ['soft tofu', 'firm tofu', 'tofu', '豆腐'],
    name: 'Tofu',
    defaultQty: 1,
    unit: 'block',
    category: 'Asian specialty ingredients'
  }
];

// Food ingredients vocabulary for heuristic ingredient extraction
export const KNOWN_COOKING_INGREDIENTS: {
  keywords: string[];
  ingredientId: string;
  name: string;
  defaultQty: number;
  unit: string;
  category: ProductCategory;
}[] = [
  {
    keywords: ['chicken', 'chicken thighs', 'chicken breast', '鸡肉', '鸡腿', '鸡'],
    ingredientId: 'ing_chicken_thighs',
    name: 'Chicken Thighs',
    defaultQty: 350,
    unit: 'g',
    category: 'Meat'
  },
  {
    keywords: ['beef', 'ground beef', 'beef mince', '牛肉', '牛腩', '牛'],
    ingredientId: 'ing_ground_beef',
    name: 'Ground Beef',
    defaultQty: 300,
    unit: 'g',
    category: 'Meat'
  },
  {
    keywords: ['pork', 'ground pork', 'pork mince', '猪肉', '肉末', '肉碎'],
    ingredientId: 'ing_ground_pork',
    name: 'Ground Pork',
    defaultQty: 250,
    unit: 'g',
    category: 'Meat'
  },
  {
    keywords: ['bacon', '培根'],
    ingredientId: 'ing_bacon',
    name: 'Thick Cut Bacon',
    defaultQty: 150,
    unit: 'g',
    category: 'Meat'
  },
  {
    keywords: ['tofu', 'silken tofu', 'soft tofu', 'firm tofu', '豆腐'],
    ingredientId: 'ing_tofu',
    name: 'Soft Tofu',
    defaultQty: 1,
    unit: 'block',
    category: 'Asian specialty ingredients'
  },
  {
    keywords: ['egg', 'eggs', '鸡蛋', '蛋'],
    ingredientId: 'ing_eggs',
    name: 'Eggs',
    defaultQty: 3,
    unit: 'piece',
    category: 'Dairy'
  },
  {
    keywords: ['potato', 'potatoes', '土豆', '马铃薯'],
    ingredientId: 'ing_potatoes',
    name: 'Potatoes',
    defaultQty: 2,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['tomato', 'tomatoes', '西红柿', '番茄'],
    ingredientId: 'ing_tomatoes',
    name: 'Tomatoes',
    defaultQty: 2,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['onion', 'onions', 'yellow onion', '洋葱'],
    ingredientId: 'ing_onion',
    name: 'Yellow Onion',
    defaultQty: 1,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['garlic', 'garlic cloves', '大蒜', '蒜'],
    ingredientId: 'ing_garlic',
    name: 'Garlic',
    defaultQty: 3,
    unit: 'clove',
    category: 'Vegetables'
  },
  {
    keywords: ['scallion', 'scallions', 'green onion', 'green onions', '小葱', '青葱', '葱'],
    ingredientId: 'ing_scallions',
    name: 'Green Onions (Scallions)',
    defaultQty: 2,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['carrot', 'carrots', '胡萝卜', '红萝卜'],
    ingredientId: 'ing_carrots',
    name: 'Carrots',
    defaultQty: 2,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['lettuce', 'romaine', '生菜'],
    ingredientId: 'ing_lettuce',
    name: 'Romaine Lettuce',
    defaultQty: 1,
    unit: 'head',
    category: 'Vegetables'
  },
  {
    keywords: ['cucumber', 'cucumbers', '黄瓜'],
    ingredientId: 'ing_cucumber',
    name: 'Cucumber',
    defaultQty: 1,
    unit: 'piece',
    category: 'Vegetables'
  },
  {
    keywords: ['pasta', 'spaghetti', 'noodles', '意面', '意大利面', '面条'],
    ingredientId: 'ing_pasta',
    name: 'Spaghetti Pasta',
    defaultQty: 200,
    unit: 'g',
    category: 'Pasta'
  },
  {
    keywords: ['rice', 'jasmine rice', '白米', '香米', '大米', '米饭'],
    ingredientId: 'ing_rice',
    name: 'Jasmine Rice',
    defaultQty: 250,
    unit: 'g',
    category: 'Rice and grains'
  },
  {
    keywords: ['milk', '牛奶'],
    ingredientId: 'ing_milk',
    name: 'Whole Milk',
    defaultQty: 250,
    unit: 'ml',
    category: 'Dairy'
  },
  {
    keywords: ['cooking oil', 'oil', 'olive oil', 'canola oil', '食用油', '油'],
    ingredientId: 'ing_cooking_oil',
    name: 'Cooking Oil',
    defaultQty: 20,
    unit: 'ml',
    category: 'Cooking ingredients'
  },
  {
    keywords: ['soy sauce', '生抽', '酱油'],
    ingredientId: 'ing_soy_sauce',
    name: 'Soy Sauce',
    defaultQty: 15,
    unit: 'ml',
    category: 'Cooking ingredients'
  },
  {
    keywords: ['curry', 'curry powder', 'curry sauce', '咖喱'],
    ingredientId: 'ing_curry_powder',
    name: 'Curry Sauce Mix',
    defaultQty: 50,
    unit: 'g',
    category: 'Cooking ingredients'
  },
  {
    keywords: ['doubanjiang', '豆瓣酱', '郫县豆瓣酱'],
    ingredientId: 'ing_doubanjiang',
    name: 'Pixian Doubanjiang',
    defaultQty: 30,
    unit: 'g',
    category: 'Asian specialty ingredients'
  },
  {
    keywords: ['sichuan peppercorn', 'peppercorns', '花椒'],
    ingredientId: 'ing_sichuan_peppercorn',
    name: 'Sichuan Peppercorns',
    defaultQty: 5,
    unit: 'g',
    category: 'Asian specialty ingredients'
  }
];

// Helper to create a custom recipe intent
export function createCustomRecipeIntent(
  dishName: string,
  servings: number = 2,
  ingredients: RecipeIngredient[] = []
): ShoppingIntent {
  return {
    id: `intent_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'recipe',
    recipeName: dishName,
    servings,
    customIngredients: ingredients,
    rawText: dishName,
    createdAt: new Date().toISOString()
  };
}

// Extract serving count from text (e.g. "for 2 people", "for 4", "for two")
function extractServings(text: string): number {
  const numberWordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    '两个人': 2,
    '二人': 2,
    '3人': 3,
    '4人': 4,
    '四个人': 4
  };

  const regex = /(?:for|servings?|people|persons?| serving)\s*(\d+|one|two|three|four|five|six)/i;
  const match = text.match(regex);
  if (match) {
    const val = match[1].toLowerCase();
    if (numberWordMap[val]) return numberWordMap[val];
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Chinese patterns
  for (const [key, num] of Object.entries(numberWordMap)) {
    if (text.includes(key)) return num;
  }

  return 2; // Default servings
}

// Extract candidate dish name when unrecognized
function extractPotentialDishName(text: string): string | null {
  const patterns = [
    /(?:want to cook|want to make|planning to make|planning to cook|cook|make|recipe for)\s+([a-zA-Z\s]{2,25}?)(?:\s+(?:for|with|and|,|\.|$))/i,
    /(?:想做|要做|打算做|想吃|煮|炒|炖)\s*([^\s,，。！!]{2,15})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 1 && !['something', 'dinner', 'lunch', 'breakfast'].includes(candidate.toLowerCase())) {
        return candidate;
      }
    }
  }

  return null;
}

// Helper to match keyword with word boundary for English words
function matchKeyword(text: string, kw: string): boolean {
  if (/^[a-zA-Z\s]+$/.test(kw)) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(kw);
}

export function parseNaturalLanguageInput(rawInput: string): ParseResult {
  const inputLower = rawInput.toLowerCase();
  const detectedIntents: ShoppingIntent[] = [];
  const recognizedSpans: string[] = [];
  const defaultServings = extractServings(rawInput);

  // 1. Detect Preconfigured Recipes (18 Catalog Dishes)
  for (const recipe of PREDEFINED_RECIPES) {
    let matched = false;
    for (const alias of recipe.aliases) {
      if (matchKeyword(inputLower, alias.toLowerCase())) {
        matched = true;
        recognizedSpans.push(alias);
        break;
      }
    }

    if (matched) {
      detectedIntents.push({
        id: `intent_${recipe.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'recipe',
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings: defaultServings,
        rawText: recipe.name,
        createdAt: new Date().toISOString()
      });
    }
  }

  // 2. Detect Direct Household & Grocery Purchases
  for (const item of KNOWN_DIRECT_PURCHASES) {
    let matchedKeyword: string | null = null;
    for (const kw of item.keywords) {
      if (matchKeyword(inputLower, kw)) {
        // Special check: avoid overlapping eggs / tofu when recipe was already recognized
        const hasMatchedEggRecipe = detectedIntents.some(
          (i) => i.recipeId === 'recipe_tomato_egg' || i.recipeId === 'recipe_fried_rice' || i.recipeId === 'recipe_scrambled_eggs'
        );
        if ((kw === 'egg' || kw === 'eggs' || kw === '鸡蛋') && hasMatchedEggRecipe && !inputLower.includes('also need eggs') && !inputLower.includes('buy eggs')) {
          continue;
        }

        const hasMatchedTofuRecipe = detectedIntents.some(
          (i) => i.recipeId === 'recipe_mapo_tofu' || i.recipeId === 'recipe_tofu_pork'
        );
        if (kw === 'tofu' && hasMatchedTofuRecipe && !inputLower.includes('also need tofu') && !inputLower.includes('buy tofu')) {
          continue;
        }

        matchedKeyword = kw;
        break;
      }
    }

    if (matchedKeyword) {
      recognizedSpans.push(matchedKeyword);
      detectedIntents.push({
        id: `intent_direct_${item.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'direct_item',
        directItem: {
          name: item.name,
          quantity: item.defaultQty,
          unit: item.unit,
          category: item.category
        },
        rawText: item.name,
        createdAt: new Date().toISOString()
      });
    }
  }

  // 3. Smart Heuristic Ingredient & Recipe Extraction (Option 1)
  // Only triggered if user expressed a cooking intent or potential dish name
  let unrecognizedDishName: string | null = null;
  const potentialDish = extractPotentialDishName(rawInput);
  const COOKING_TRIGGERS = [
    'cook', 'make', 'dinner', 'lunch', 'breakfast', 'recipe', 'soup', 'stew', 'salad', 'curry', 'pasta', 'dish',
    '想做', '做', '煮', '炒', '炖', '想吃', '吃', '菜谱'
  ];
  const hasCookingIntent = COOKING_TRIGGERS.some((trigger) => matchKeyword(inputLower, trigger));

  if (detectedIntents.filter((i) => i.type === 'recipe').length === 0 && (hasCookingIntent || potentialDish)) {
    // Look for recognizable cooking ingredients in the sentence
    const detectedIngredients: RecipeIngredient[] = [];
    const usedIngIds = new Set<string>();

    for (const ing of KNOWN_COOKING_INGREDIENTS) {
      for (const kw of ing.keywords) {
        if (matchKeyword(inputLower, kw) && !usedIngIds.has(ing.ingredientId)) {
          usedIngIds.add(ing.ingredientId);
          detectedIngredients.push({
            ingredientId: ing.ingredientId,
            name: ing.name,
            quantity: ing.defaultQty,
            unit: ing.unit,
            category: ing.category
          });
          break;
        }
      }
    }

    if (detectedIngredients.length > 0) {
      // Create a dynamic custom dish from the heuristic ingredients!
      const dynamicDishTitle = potentialDish ? potentialDish : 'Custom Cooking Recipe';
      detectedIntents.push(
        createCustomRecipeIntent(dynamicDishTitle, defaultServings, detectedIngredients)
      );
    } else if (potentialDish) {
      unrecognizedDishName = potentialDish;
    }
  }

  // Result explanation
  let explanation = '';
  if (detectedIntents.length > 0) {
    const recipeCount = detectedIntents.filter((i) => i.type === 'recipe').length;
    const directCount = detectedIntents.filter((i) => i.type === 'direct_item').length;
    const customCount = detectedIntents.filter((i) => i.type === 'recipe' && i.customIngredients).length;

    if (customCount > 0) {
      explanation = `Smart Match: Extracted ${customCount} custom dish with ${detectedIntents[0].customIngredients?.length} ingredients (${defaultServings} servings).`;
    } else {
      explanation = `Identified ${recipeCount} planned recipe(s) (${defaultServings} servings) and ${directCount} direct purchase item(s).`;
    }
  } else if (unrecognizedDishName) {
    explanation = `Dish "${unrecognizedDishName}" is not in our preset catalog. Click "+ Add Custom Dish" to specify ingredients manually, or specify ingredients in text (e.g., "${unrecognizedDishName} with chicken, potatoes").`;
  } else {
    explanation =
      'Could not automatically decompose ingredients. Try our 18 preset recipes (Mapo Tofu, Beef Stew, Curry, Spaghetti...), mention ingredients directly, or click "+ Add Custom Dish".';
  }

  return {
    intents: detectedIntents,
    unrecognizedTokens: [],
    unrecognizedDish: unrecognizedDishName || undefined,
    explanation
  };
}
