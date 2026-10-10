// Ingredient normalization and unit conversion utilities

const SYNONYM_MAP: Record<string, string> = {
  // Scallions / Green onions
  'scallion': 'ing_scallions',
  'scallions': 'ing_scallions',
  'green onion': 'ing_scallions',
  'green onions': 'ing_scallions',
  'spring onion': 'ing_scallions',
  'spring onions': 'ing_scallions',
  '葱': 'ing_scallions',
  '小葱': 'ing_scallions',
  '香葱': 'ing_scallions',

  // Tomatoes
  'tomato': 'ing_tomatoes',
  'tomatoes': 'ing_tomatoes',
  '番茄': 'ing_tomatoes',
  '西红柿': 'ing_tomatoes',

  // Eggs
  'egg': 'ing_eggs',
  'eggs': 'ing_eggs',
  'egg carton': 'ing_eggs',
  '鸡蛋': 'ing_eggs',
  '蛋': 'ing_eggs',

  // Garlic
  'garlic': 'ing_garlic',
  'garlic cloves': 'ing_garlic',
  '大蒜': 'ing_garlic',
  '蒜': 'ing_garlic',

  // Tofu
  'tofu': 'ing_tofu',
  'soft tofu': 'ing_tofu',
  'silken tofu': 'ing_tofu',
  'firm tofu': 'ing_tofu',
  '豆腐': 'ing_tofu',
  '嫩豆腐': 'ing_tofu',

  // Ground pork
  'ground pork': 'ing_ground_pork',
  'pork mince': 'ing_ground_pork',
  'minced pork': 'ing_ground_pork',
  '猪肉末': 'ing_ground_pork',
  '猪肉碎': 'ing_ground_pork',
  '肉末': 'ing_ground_pork',

  // Ground beef
  'ground beef': 'ing_ground_beef',
  'beef mince': 'ing_ground_beef',
  'minced beef': 'ing_ground_beef',
  '牛肉末': 'ing_ground_beef',

  // Chicken
  'chicken': 'ing_chicken_thighs',
  'chicken thighs': 'ing_chicken_thighs',
  'chicken breast': 'ing_chicken_thighs',
  '鸡肉': 'ing_chicken_thighs',
  '鸡腿肉': 'ing_chicken_thighs',

  // Curry
  'curry': 'ing_curry_powder',
  'curry powder': 'ing_curry_powder',
  'curry sauce': 'ing_curry_powder',
  'curry sauce mix': 'ing_curry_powder',
  '咖喱': 'ing_curry_powder',
  '咖喱块': 'ing_curry_powder',

  // Doubanjiang
  'doubanjiang': 'ing_doubanjiang',
  'chili bean paste': 'ing_doubanjiang',
  'pixian doubanjiang': 'ing_doubanjiang',
  '豆瓣酱': 'ing_doubanjiang',
  '郫县豆瓣酱': 'ing_doubanjiang',

  // Sichuan peppercorns
  'sichuan peppercorn': 'ing_sichuan_peppercorn',
  'sichuan peppercorns': 'ing_sichuan_peppercorn',
  'szechuan peppercorn': 'ing_sichuan_peppercorn',
  '花椒': 'ing_sichuan_peppercorn',
  '麻椒': 'ing_sichuan_peppercorn',

  // Rice
  'rice': 'ing_rice',
  'jasmine rice': 'ing_rice',
  'white rice': 'ing_rice',
  '大米': 'ing_rice',
  '香米': 'ing_rice',

  // Cooking oil
  'oil': 'ing_cooking_oil',
  'cooking oil': 'ing_cooking_oil',
  'canola oil': 'ing_cooking_oil',
  'vegetable oil': 'ing_cooking_oil',
  'olive oil': 'ing_cooking_oil',
  '食用油': 'ing_cooking_oil',
  '油': 'ing_cooking_oil',

  // Salt
  'salt': 'ing_salt',
  'table salt': 'ing_salt',
  '盐': 'ing_salt',
  '食盐': 'ing_salt',

  // Sugar
  'sugar': 'ing_sugar',
  'granulated sugar': 'ing_sugar',
  'white sugar': 'ing_sugar',
  '糖': 'ing_sugar',
  '白糖': 'ing_sugar',

  // Flour
  'flour': 'ing_flour',
  'all-purpose flour': 'ing_flour',
  '面粉': 'ing_flour',

  // Milk
  'milk': 'ing_milk',
  'whole milk': 'ing_milk',
  '牛奶': 'ing_milk',
  '鲜奶': 'ing_milk',

  // Soy sauce
  'soy sauce': 'ing_soy_sauce',
  'soya sauce': 'ing_soy_sauce',
  '生抽': 'ing_soy_sauce',
  '酱油': 'ing_soy_sauce',

  // Pasta / Spaghetti
  'pasta': 'ing_pasta',
  'spaghetti': 'ing_pasta',
  'noodles': 'ing_pasta',
  '意面': 'ing_pasta',
  '意大利面': 'ing_pasta',

  // Household & personal items
  'toilet paper': 'ing_toilet_paper',
  'bath tissue': 'ing_toilet_paper',
  'tp': 'ing_toilet_paper',
  '卫生纸': 'ing_toilet_paper',
  '卷纸': 'ing_toilet_paper',

  'paper towels': 'ing_paper_towels',
  'kitchen towel': 'ing_paper_towels',
  '厨房纸': 'ing_paper_towels',

  'laundry detergent': 'ing_laundry_detergent',
  'detergent': 'ing_laundry_detergent',
  '洗衣液': 'ing_laundry_detergent',

  'dish soap': 'ing_dish_soap',
  'washing up liquid': 'ing_dish_soap',
  '洗洁精': 'ing_dish_soap',

  'toothpaste': 'ing_toothpaste',
  '牙膏': 'ing_toothpaste',

  'body wash': 'ing_body_wash',
  'shower gel': 'ing_body_wash',
  '沐浴露': 'ing_body_wash',

  'shampoo': 'ing_shampoo',
  '洗发水': 'ing_shampoo',

  'trash bags': 'ing_trash_bags',
  'garbage bags': 'ing_trash_bags',
  '垃圾袋': 'ing_trash_bags',

  'aluminum foil': 'ing_aluminum_foil',
  'tin foil': 'ing_aluminum_foil',
  '锡纸': 'ing_aluminum_foil',
  '铝箔纸': 'ing_aluminum_foil',

  'disinfecting wipes': 'ing_cleaning_wipes',
  'cleaning wipes': 'ing_cleaning_wipes',
  '消毒湿巾': 'ing_cleaning_wipes'
};

export function normalizeIngredientName(rawName: string): string {
  const clean = rawName.trim().toLowerCase();
  if (SYNONYM_MAP[clean]) {
    return SYNONYM_MAP[clean];
  }
  // Try partial search in synonym keys
  for (const [key, id] of Object.entries(SYNONYM_MAP)) {
    if (clean === key || clean.includes(key)) {
      return id;
    }
  }
  return clean.replace(/\s+/g, '_');
}

export function areUnitsCompatible(unitA: string, unitB: string): boolean {
  const a = unitA.toLowerCase().trim();
  const b = unitB.toLowerCase().trim();
  if (a === b) return true;

  const weightUnits = ['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'oz', 'lb'];
  if (weightUnits.includes(a) && weightUnits.includes(b)) return true;

  const volumeUnits = ['ml', 'milliliter', 'l', 'liter', 'liters', 'fl oz'];
  if (volumeUnits.includes(a) && volumeUnits.includes(b)) return true;

  const countUnits = ['piece', 'pieces', 'ct', 'count', 'roll', 'rolls', 'bottle', 'box', 'head', 'tube', 'can', 'clove', 'cloves', 'block'];
  if (countUnits.includes(a) && countUnits.includes(b)) return true;

  return false;
}

export function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number {
  const from = fromUnit.toLowerCase().trim();
  const to = toUnit.toLowerCase().trim();
  if (from === to) return quantity;

  // Weight conversions
  if (from === 'kg' && to === 'g') return quantity * 1000;
  if (from === 'g' && to === 'kg') return quantity / 1000;

  // Volume conversions
  if (from === 'l' && to === 'ml') return quantity * 1000;
  if (from === 'ml' && to === 'l') return quantity / 1000;

  // Default unchanged if compatible without specific multiplier
  return quantity;
}
