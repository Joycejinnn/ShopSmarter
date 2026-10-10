import { ShoppingIntent, DirectItemIntent, ProductCategory } from '../types';
import { PREDEFINED_RECIPES } from '../data/recipes';
import { normalizeIngredientName } from './ingredientNormalizer';

export interface ParseResult {
  intents: ShoppingIntent[];
  unrecognizedTokens: string[];
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

export function parseNaturalLanguageInput(rawInput: string): ParseResult {
  const inputLower = rawInput.toLowerCase();
  const detectedIntents: ShoppingIntent[] = [];
  const recognizedSpans: string[] = [];
  const defaultServings = extractServings(rawInput);

  // 1. Detect Preconfigured Recipes
  for (const recipe of PREDEFINED_RECIPES) {
    let matched = false;
    for (const alias of recipe.aliases) {
      if (inputLower.includes(alias.toLowerCase())) {
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
      // Avoid matching "egg" inside "tomato egg" if that recipe was already matched
      if (inputLower.includes(kw)) {
        // Special check: if "eggs" or "egg" matched, ensure it wasn't just part of tomato egg stir-fry or fried rice
        if (
          (kw === 'egg' || kw === 'eggs' || kw === '鸡蛋') &&
          (inputLower.includes('tomato egg') ||
            inputLower.includes('西红柿炒蛋') ||
            inputLower.includes('番茄炒蛋') ||
            inputLower.includes('fried rice') ||
            inputLower.includes('蛋炒饭')) &&
          !inputLower.includes('and eggs') &&
          !inputLower.includes('buy eggs') &&
          !inputLower.includes('need eggs')
        ) {
          continue;
        }

        // Avoid matching "tofu" if "mapo tofu" recipe was already matched and not standalone
        if (
          kw === 'tofu' &&
          (inputLower.includes('mapo tofu') || inputLower.includes('麻婆豆腐')) &&
          !inputLower.includes('also need tofu') &&
          !inputLower.includes('buy tofu')
        ) {
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

  // If nothing was recognized, provide helpful explanation
  let explanation = '';
  if (detectedIntents.length > 0) {
    const recipeCount = detectedIntents.filter((i) => i.type === 'recipe').length;
    const directCount = detectedIntents.filter((i) => i.type === 'direct_item').length;
    explanation = `Identified ${recipeCount} planned recipe(s) (${defaultServings} servings) and ${directCount} direct purchase item(s).`;
  } else {
    explanation =
      'Could not automatically decompose ingredients. Try our preconfigured dishes (Mapo Tofu, Tomato Egg, Fried Rice, Spaghetti, Chicken Curry, Pancakes) or common household items (milk, toilet paper, detergent).';
  }

  return {
    intents: detectedIntents,
    unrecognizedTokens: [],
    explanation
  };
}
